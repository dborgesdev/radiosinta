import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import {
  HOSTPLAY_METADATA_URL,
  metadataSource,
  nowPlayingOptions,
  readNowPlaying,
} from "../src/lib/radio/metadata.ts";

const track = (title = "Louvor", history = "Anterior") => ({
  title,
  artist: "Artista",
  cover: "/cover.webp",
  history: [{ title: history, played_at: "12:30" }],
});
const signal = () => new AbortController().signal;

test("direct transport uses HTTPS CORS without credentials/cache/redirects and keeps the UI contract", async (t) => {
  t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    assert.equal(url, HOSTPLAY_METADATA_URL);
    assert.equal(init.cache, "no-store");
    assert.equal(init.credentials, "omit");
    assert.equal(init.redirect, "error");
    assert.equal(init.mode, "cors");
    assert.ok(init.signal instanceof AbortSignal);
    return Response.json(track());
  });
  const data = await readNowPlaying(signal());
  assert.equal(data.data?.title, "Louvor");
  assert.equal(data.data?.cover, "https://play.radiosinta.com.br/cover.webp");
  assert.equal(data.data?.history[0].title, "Anterior");
  assert.equal(data.stale, false);
  assert.ok(data.updatedAt);
});

test("worker rollback is explicit and Hostplay failures never switch to the local endpoint", async (t) => {
  assert.equal(metadataSource(), "hostplay");
  assert.equal(metadataSource("anything"), "hostplay");
  assert.equal(metadataSource("worker"), "worker");
  const urls: string[] = [];
  t.mock.method(globalThis, "fetch", async (url: string) => {
    urls.push(url);
    return url === HOSTPLAY_METADATA_URL
      ? new Response(null, { status: 503 })
      : Response.json({ data: track(), stale: true, updatedAt: 123 });
  });
  await assert.rejects(readNowPlaying(signal()), /503/);
  assert.deepEqual(urls, [HOSTPLAY_METADATA_URL]);
  const rollback = await readNowPlaying(signal(), "worker");
  assert.equal(urls[1], "/api/nowplaying");
  assert.equal(rollback.data?.title, "Louvor");
  assert.equal(rollback.stale, true);
  assert.equal(rollback.updatedAt, 123);
});

test("HTTP, JSON, empty-title and network failures preserve the last valid React Query snapshot", async (t) => {
  let response = () => Promise.resolve(Response.json(track()));
  const calls = t.mock.method(globalThis, "fetch", () => response());
  const client = new QueryClient();
  t.after(() => client.clear());
  const options = { ...nowPlayingOptions("hostplay", true), staleTime: 0, retry: false };
  const original = await client.fetchQuery(options);
  for (const fail of [
    () => Promise.resolve(new Response(null, { status: 500 })),
    () => Promise.resolve(new Response("invalid json")),
    () => Promise.resolve(Response.json({ title: " " })),
    () => Promise.reject(new TypeError("offline")),
  ]) {
    response = fail;
    await assert.rejects(client.fetchQuery(options));
    assert.deepEqual(client.getQueryData(options.queryKey), original);
  }
  assert.equal(calls.mock.callCount(), 5);
  response = () =>
    Promise.resolve(Response.json({ ...track("Novo louvor", "Louvor"), cover: null }));
  const next = await client.fetchQuery(options);
  assert.equal(next.data?.title, "Novo louvor");
  assert.equal(next.data?.history[0].title, "Louvor");
  assert.equal(next.data?.cover, null);
});

test("shared queries deduplicate concurrent consumers and remounts reuse fresh data", async (t) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    await pending;
    return Response.json(track());
  });
  const client = new QueryClient();
  t.after(() => client.clear());
  const options = nowPlayingOptions("hostplay", true);
  const jobs = Array.from({ length: 10 }, () => client.fetchQuery(options));
  assert.equal(fetch.mock.callCount(), 1);
  release();
  const values = await Promise.all(jobs);
  assert.ok(values.every((value) => value === values[0]));
  await client.fetchQuery(options);
  assert.equal(fetch.mock.callCount(), 1);
});

test("hidden/SSR observers never fetch; visibility re-enables one request; polling and retry budgets are bounded", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json(track()));
  const client = new QueryClient();
  const observer = new QueryObserver(client, nowPlayingOptions("hostplay", false));
  const unsubscribe = observer.subscribe(() => {});
  t.after(() => {
    unsubscribe();
    client.clear();
  });
  assert.equal(fetch.mock.callCount(), 0);
  observer.setOptions(nowPlayingOptions("hostplay", true));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(fetch.mock.callCount(), 1);
  const hidden = nowPlayingOptions("hostplay", false);
  assert.equal(hidden.refetchInterval({ state: { status: "success" } }), false);
  assert.equal(hidden.refetchIntervalInBackground, false);
  const visible = nowPlayingOptions("hostplay", true);
  assert.equal(visible.refetchInterval({ state: { status: "success" } }), 15_000);
  assert.equal(visible.refetchInterval({ state: { status: "error" } }), 120_000);
  assert.equal(visible.retry, 2);
  assert.equal(visible.retryDelay(0), 15_000);
  assert.equal(visible.retryDelay(1), 30_000);
  assert.equal(visible.retryDelay(10), 60_000);
});

test("timeout aborts an eight-second request, including a stalled response body", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => ({
    ok: true,
    json: () =>
      new Promise((_resolve, reject) => {
        init.signal!.addEventListener("abort", () => reject(init.signal!.reason), { once: true });
      }),
  }));
  const pending = readNowPlaying(signal());
  await Promise.resolve();
  const rejected = assert.rejects(pending, { name: "TimeoutError" });
  t.mock.timers.tick(8_000);
  await rejected;
});

test("a sustained outage makes only the configured three attempts and never calls the Worker", async (t) => {
  const client = new QueryClient();
  t.after(() => client.clear());
  const requests: string[] = [];
  t.mock.method(globalThis, "fetch", async (url: string) => {
    requests.push(url);
    return new Response(null, { status: 503 });
  });
  const policy = nowPlayingOptions("hostplay", true);
  const delays: number[] = [];
  await assert.rejects(
    client.fetchQuery({
      ...policy,
      retryDelay: (attempt) => {
        delays.push(policy.retryDelay(attempt));
        return 0; // Execute the actual retry policy without waiting 45 seconds in this test.
      },
    }),
  );
  assert.deepEqual(requests, Array(3).fill(HOSTPLAY_METADATA_URL));
  assert.deepEqual(delays.slice(0, 2), [15_000, 30_000]);
});

test("React Query cancellation aborts transport and retains its previous snapshot", async (t) => {
  const client = new QueryClient();
  t.after(() => client.clear());
  const options = { ...nowPlayingOptions("hostplay", true), staleTime: 0 };
  t.mock.method(globalThis, "fetch", async () => Response.json(track()));
  const original = await client.fetchQuery(options);
  let aborted = false;
  t.mock.method(
    globalThis,
    "fetch",
    async (_url: string, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal!.addEventListener(
          "abort",
          () => {
            aborted = true;
            reject(init.signal!.reason);
          },
          { once: true },
        );
      }),
  );
  const pending = client.fetchQuery(options).catch(() => undefined);
  await client.cancelQueries({ queryKey: options.queryKey });
  await pending;
  assert.equal(aborted, true);
  assert.deepEqual(client.getQueryData(options.queryKey), original);
});
