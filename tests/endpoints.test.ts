import { test } from "node:test";
import assert from "node:assert/strict";
import type { CacheStore } from "../src/lib/services/cache.ts";

test("local endpoints canonicalize queries, share normalized payloads, conditionally revalidate RSS, and never proxy MP3", async () => {
  const entries = new Map<string, Response>();
  const store: CacheStore = {
    match: async (key) => entries.get(key.url)?.clone(),
    put: async (key, value) => {
      entries.set(key.url, value.clone());
    },
  };
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "caches");
  let time = 1_800_000_000_000;
  let radioCalls = 0;
  let newsCalls = 0;
  const originUrls: string[] = [];
  Object.defineProperty(globalThis, "caches", { configurable: true, value: { default: store } });
  Date.now = () => time;
  globalThis.fetch = async (input, init) => {
    assert.equal(init?.redirect, "manual", "Cloudflare Workers supports manual/follow redirects");
    const url = String(input);
    originUrls.push(url);
    if (url.includes("nowplaying")) {
      radioCalls++;
      return Response.json({ title: "Música", artist: "Artista", history: [] });
    }
    newsCalls++;
    if (newsCalls > 1) {
      assert.equal(new Headers(init?.headers).get("If-None-Match"), '"rss-v1"');
      assert.equal(
        new Headers(init?.headers).get("If-Modified-Since"),
        "Thu, 12 Nov 2026 10:00:00 GMT",
      );
      return new Response(null, { status: 304 });
    }
    return new Response(
      "<rss><channel><item><title>Notícia</title><link>https://defatoonline.com.br/noticia/</link></item></channel></rss>",
      { headers: { ETag: '"rss-v1"', "Last-Modified": "Thu, 12 Nov 2026 10:00:00 GMT" } },
    );
  };
  try {
    const { integrationResponse } = await import("../src/lib/services/integrations.server.ts");
    const responses = await Promise.all(
      Array.from({ length: 50 }, (_, i) =>
        integrationResponse(new Request(`https://radiosinta.com.br/api/nowplaying?visitor=${i}`)),
      ),
    );
    assert.equal(radioCalls, 1);
    for (const response of responses) {
      assert.ok(response);
      assert.equal(response?.headers.get("X-Integration-Cache"), "cloudflare-pop");
      assert.equal((await response.json()).data.title, "Música");
    }
    await integrationResponse(new Request("https://radiosinta.com.br/api/news"));
    await integrationResponse(new Request("https://radiosinta.com.br/api/news?bust=1"));
    assert.equal(newsCalls, 1);
    time += 900_000;
    const tasks: Promise<unknown>[] = [];
    const stale = await integrationResponse(
      new Request("https://radiosinta.com.br/api/news"),
      (p) => tasks.push(p),
    );
    assert.ok(stale);
    assert.equal((await stale.json()).stale, true);
    await Promise.all(tasks);
    assert.equal(newsCalls, 2);
    const fresh = await integrationResponse(new Request("https://radiosinta.com.br/api/news"));
    assert.ok(fresh);
    assert.equal((await fresh.json()).stale, false);
    assert.equal(
      await integrationResponse(new Request("https://radiosinta.com.br/radio.mp3")),
      null,
    );
    assert.equal(
      (
        await integrationResponse(
          new Request("https://radiosinta.com.br/api/news", { method: "POST" }),
        )
      )?.status,
      405,
    );
    assert.ok(
      originUrls.every(
        (url) =>
          url === "https://defatoonline.com.br/feed/" ||
          url === "https://play.radiosinta.com.br/api/nowplaying?sid=1",
      ),
    );
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
    if (descriptor) Object.defineProperty(globalThis, "caches", descriptor);
    else Reflect.deleteProperty(globalThis, "caches");
  }
});
