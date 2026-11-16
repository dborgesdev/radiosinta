import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import {
  newsEndpoints,
  newsOptions,
  normalizeWordPressPosts,
  readNews,
  wordpressDate,
} from "../src/lib/news/rest.ts";
import { saoPauloDay, verseForDay } from "../src/lib/dailyVerse.ts";

function post(source: "gospel" | "regional", id = 1) {
  const host = source === "gospel" ? "folhagospel.com" : "defatoonline.com.br";
  return {
    id,
    date: "2026-11-12T10:30:00",
    link: `https://${host}/noticia-${id}/`,
    title: { rendered: "F&eacute; &amp; esperan&ccedil;a &#8212; hoje" },
    excerpt: {
      rendered: "<p>Notícia &hellip; <strong>real</strong>.</p><script>não exibir</script>",
    },
    featured_media: 12,
    featured_image_url: "https://cdn.defatoonline.com.br/foto.jpg",
    jetpack_featured_media_url:
      "https://i0.wp.com/folhagospel.com/foto.jpg?fit=675%2C450&amp;ssl=1",
  };
}

test("REST preserves decoded titles, plain summaries, dates, attribution and safe article/image URLs", () => {
  for (const source of ["regional", "gospel"] as const) {
    const items = normalizeWordPressPosts([post(source), post(source)], source);
    assert.equal(items.length, 1);
    assert.equal(items[0].title, "Fé & esperança — hoje");
    assert.equal(items[0].summary, "Notícia … real .");
    assert.equal(items[0].publishedAt, "2026-11-12T13:30:00.000Z");
    assert.equal(items[0].source, source === "gospel" ? "Folha Gospel" : "DeFato Online");
    assert.ok(items[0].image?.startsWith("https://"));
    assert.ok(!items[0].image?.includes("&amp;"));
  }
  assert.equal(wordpressDate("2026-11-12T10:30:00Z"), "2026-11-12T10:30:00.000Z");
  assert.equal(wordpressDate("bad"), null);
  const input = [
    post("regional"),
    {
      ...post("regional", 2),
      date: "2026-11-12T11:30:00",
      featured_image_url: "javascript:alert(1)",
    },
  ];
  const items = normalizeWordPressPosts(input, "regional");
  assert.equal(items[0].id, "2");
  assert.equal(items[0].image, null);
  assert.equal(
    normalizeWordPressPosts(
      [{ ...post("regional"), title: { rendered: "&lt;img src=x onerror=bad()&gt;Texto" } }],
      "regional",
    )[0].title,
    "Texto",
  );
  assert.equal(
    normalizeWordPressPosts(
      Array.from({ length: 20 }, (_, i) => post("regional", i)),
      "regional",
    ).length,
    10,
  );
  for (const payload of [
    null,
    {},
    [],
    [{ ...post("regional"), link: "https://evil.test/article" }],
  ])
    assert.throws(() => normalizeWordPressPosts(payload, "regional"));
});

test("cards and ticker share one direct query per source, with no embed, media lookup or local Worker calls", async (t) => {
  const urls: string[] = [];
  t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    urls.push(url);
    const parsed = new URL(url);
    assert.ok(parsed.searchParams.get("_fields")?.split(",").includes("featured_media"));
    assert.equal(parsed.searchParams.get("_embed"), null);
    assert.equal(parsed.searchParams.get("per_page"), "10");
    assert.equal(init.credentials, "omit");
    assert.equal(init.redirect, "error");
    assert.equal(init.mode, "cors");
    await new Promise((resolve) => setTimeout(resolve, 5));
    const source = parsed.hostname === "folhagospel.com" ? "gospel" : "regional";
    return Response.json(Array.from({ length: 10 }, (_, i) => post(source, i)));
  });
  const client = new QueryClient();
  t.after(() => client.clear());
  const jobs = Array.from({ length: 10 }, () =>
    Promise.all([
      client.fetchQuery(newsOptions("regional", true)),
      client.fetchQuery(newsOptions("gospel", true)),
    ]),
  );
  const results = await Promise.all(jobs);
  assert.equal(urls.length, 2);
  assert.deepEqual(new Set(urls), new Set(Object.values(newsEndpoints)));
  assert.equal(results[0][0].data?.length, 10);
  assert.equal(results[0][1].data?.length, 4);
  assert.ok(
    results.every(([regional, gospel]) => regional === results[0][0] && gospel === results[0][1]),
  );
  await client.fetchQuery(newsOptions("regional", true));
  await client.fetchQuery(newsOptions("gospel", true));
  assert.equal(urls.length, 2);
});

test("failed/invalid refreshes keep the last valid news; image-free gospel items do not trigger media requests", async (t) => {
  let response = () => Promise.resolve(Response.json([post("regional")]));
  const fetch = t.mock.method(globalThis, "fetch", () => response());
  const client = new QueryClient();
  t.after(() => client.clear());
  const options = { ...newsOptions("regional", true), staleTime: 0, retry: false };
  const original = await client.fetchQuery(options);
  for (const invalid of [
    () => Promise.resolve(new Response(null, { status: 503 })),
    () => Promise.resolve(new Response("invalid")),
    () => Promise.resolve(Response.json([])),
    () => Promise.reject(new Error("offline")),
  ]) {
    response = invalid;
    await assert.rejects(client.fetchQuery(options));
    assert.deepEqual(client.getQueryData(options.queryKey), original);
  }
  response = () =>
    Promise.resolve(Response.json([{ ...post("gospel"), jetpack_featured_media_url: null }]));
  const before = fetch.mock.callCount();
  assert.deepEqual((await readNews("gospel", new AbortController().signal)).data, []);
  assert.equal(fetch.mock.callCount(), before + 1);
});

test("news has no SSR/hidden fetches, keeps 15-minute caching and resumes one shared request", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json([post("regional")]));
  const client = new QueryClient();
  const hidden = newsOptions("regional", false);
  const observer = new QueryObserver(client, hidden);
  const unsubscribe = observer.subscribe(() => {});
  t.after(() => {
    unsubscribe();
    client.clear();
  });
  assert.equal(fetch.mock.callCount(), 0);
  assert.equal(hidden.refetchInterval, false);
  observer.setOptions(newsOptions("regional", true));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(fetch.mock.callCount(), 1);
  const options = newsOptions("regional", true);
  assert.equal(options.staleTime, 900_000);
  assert.equal(options.refetchInterval, 900_000);
  assert.equal(options.refetchIntervalInBackground, false);
  assert.equal(options.retry, 1);
  assert.equal(options.retryDelay, 30_000);
});

test("eight-second timeout covers a stalled news body", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => ({
    ok: true,
    json: () =>
      new Promise((_resolve, reject) =>
        init.signal!.addEventListener("abort", () => reject(init.signal!.reason), { once: true }),
      ),
  }));
  const pending = readNews("regional", new AbortController().signal);
  await Promise.resolve();
  const rejected = assert.rejects(pending, { name: "TimeoutError" });
  t.mock.timers.tick(8_000);
  await rejected;
});

test("daily verse remains deterministic, local, in São Paulo time and never calls any API", (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => {
    throw new Error("Verses must stay local");
  });
  const day = saoPauloDay(new Date("2026-11-13T02:59:59Z"));
  assert.equal(day, "2026-11-12");
  assert.match(verseForDay(day).reference, / \d+:\d+$/);
  assert.ok(verseForDay(day).text.length >= 25);
  assert.deepEqual(verseForDay(day), verseForDay(day));
  assert.notEqual(
    verseForDay(day).reference,
    verseForDay(saoPauloDay(new Date("2026-11-13T03:00:00Z"))).reference,
  );
  assert.equal(fetch.mock.callCount(), 0);
});
