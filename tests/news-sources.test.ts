import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRss, newsImageUrl, newsSummary } from "../src/lib/news/parser.ts";
import {
  completeGospelImages,
  gospelHighlights,
  normalizeWordPressImages,
} from "../src/lib/news/gospel.ts";
import type { CacheStore } from "../src/lib/services/cache.ts";

const xmlItem = (id: number, image = "") =>
  `<item><title>Manchete ${id}</title><link>https://folhagospel.com/n${id}/</link><guid>https://folhagospel.com/?p=${id}</guid><pubDate>Thu, 12 Nov 2026 ${String(24 - id).padStart(2, "0")}:00:00 GMT</pubDate><content:encoded><![CDATA[<p>Informação real sobre os acontecimentos mais recentes da comunidade cristã.</p>${image ? `<img src="${image}"/>` : ""}]]></content:encoded></item>`;
const xml = (...items: string[]) =>
  `<rss xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>${items.join("")}</channel></rss>`;

test("Jetpack entities decode without losing query parameters and foreign image hosts/paths are rejected", () => {
  for (const entity of ["&amp;", "&#038;", "&#x26;"])
    assert.equal(
      newsImageUrl(
        `https://i0.wp.com/folhagospel.com/wp-content/a.jpg?resize=600%2C400${entity}ssl=1`,
        "gospel",
      ),
      "https://i0.wp.com/folhagospel.com/wp-content/a.jpg?resize=600%2C400&ssl=1",
    );
  for (const url of [
    "http://folhagospel.com/a.jpg",
    "https://i0.wp.com/evil.test/a.jpg",
    "https://folhagospel.com.evil.test/a.jpg",
    "javascript:alert(1)",
  ])
    assert.equal(newsImageUrl(url, "gospel"), null);
  assert.equal(newsImageUrl("https://cdn.defatoonline.com.br/a.jpg", "gospel"), null);
  const items = parseRss(
    xml(xmlItem(1, "https://i0.wp.com/folhagospel.com/a.jpg?resize=600%2C400&#038;ssl=1")),
    "gospel",
  );
  assert.ok(items[0].image?.endsWith("&ssl=1"));
});
test("summary uses the first relevant paragraph and removes embeds, shortcodes and republication notices", () => {
  const useful =
    "A comunidade se reuniu para uma ação solidária que levou alimentos e acolhimento às famílias da região.";
  const content = `<figure><p>Uma legenda muito comprida que não deve substituir o parágrafo principal da notícia.</p></figure><p>[links]</p><p>Leia também: outra matéria sobre a comunidade</p><p>${useful}</p><script>bad()</script>`;
  assert.equal(newsSummary(content, "Descrição secundária"), useful);
  assert.equal(
    newsSummary(
      "",
      `<p>Resumo real da notícia.</p>[links] The post Notícia first appeared on Folha Gospel.`,
    ),
    "Resumo real da notícia.",
  );
  const summary = newsSummary(`<p>${useful.repeat(4)}</p>`, "");
  assert.ok(summary.length >= 120 && summary.length <= 180);
  assert.equal(newsSummary("<iframe>embed</iframe>", ""), "");
});
test("only missing media among four newest candidates is looked up in one batch; failed lookup keeps valid RSS images", async () => {
  const items = parseRss(
    xml(
      ...Array.from({ length: 8 }, (_, i) =>
        xmlItem(i + 1, i === 0 || i === 5 ? `https://folhagospel.com/${i}.jpg` : ""),
      ),
    ),
    "gospel",
  );
  let calls = 0;
  const completed = await completeGospelImages(items, async (ids) => {
    calls++;
    assert.deepEqual(ids, ["2", "3", "4"]);
    return Object.fromEntries(
      ids.map((id) => [`https://folhagospel.com/n${id}/`, `https://folhagospel.com/${id}.jpg`]),
    );
  });
  assert.equal(calls, 1);
  assert.deepEqual(
    gospelHighlights(completed).map((item) => item.title),
    ["Manchete 1", "Manchete 2", "Manchete 3", "Manchete 4"],
  );
  await completeGospelImages(completed, async () => {
    throw new Error("must not request");
  });
  const failed = await completeGospelImages(items, async () => {
    throw new Error("REST disabled");
  });
  assert.equal(gospelHighlights(failed).length, 2);
  assert.equal(
    normalizeWordPressImages([
      { link: "https://evil.test", jetpack_featured_media_url: "https://folhagospel.com/a.jpg" },
    ])["https://evil.test"],
    undefined,
  );
});
test("two feeds have independent shared caches; concurrent visits add just one REST batch, then revalidate conditionally", async () => {
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
  let now = 1_800_000_000_000;
  let gospelCalls = 0;
  let localCalls = 0;
  let mediaCalls = 0;
  Object.defineProperty(globalThis, "caches", { configurable: true, value: { default: store } });
  Date.now = () => now;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.includes("/wp-json/")) {
      mediaCalls++;
      const parsed = new URL(url);
      assert.equal(parsed.searchParams.get("include"), "2,3,4");
      assert.equal(parsed.searchParams.get("per_page"), "3");
      assert.equal(parsed.searchParams.has("_embed"), false);
      return Response.json(
        [2, 3, 4].map((id) => ({
          link: `https://folhagospel.com/n${id}/`,
          jetpack_featured_media_url: `https://folhagospel.com/${id}.jpg`,
        })),
      );
    }
    if (url.includes("folhagospel")) {
      gospelCalls++;
      if (gospelCalls > 1) {
        assert.equal(new Headers(init?.headers).get("If-None-Match"), '"fg"');
        return new Response(null, { status: 304 });
      }
      return new Response(
        xml(
          ...[1, 2, 3, 4, 5].map((id) =>
            xmlItem(id, id === 1 ? "https://folhagospel.com/a.jpg" : ""),
          ),
        ),
        { headers: { ETag: '"fg"' } },
      );
    }
    localCalls++;
    if (localCalls > 1) throw new Error("regional offline");
    return new Response(
      "<rss><channel><item><title>Regional</title><link>https://defatoonline.com.br/real/</link><description>Resumo regional real.</description></item></channel></rss>",
    );
  };
  try {
    const { integrationResponse } = await import("../src/lib/services/integrations.server.ts");
    const responses = await Promise.all(
      Array.from({ length: 50 }, (_, i) =>
        integrationResponse(new Request(`https://radiosinta.com.br/api/news/gospel?v=${i}`)),
      ),
    );
    assert.equal(gospelCalls, 1);
    assert.equal(mediaCalls, 1);
    for (const response of responses) {
      assert.ok(response);
      const result = await response.json();
      assert.equal(result.data.length, 4);
      assert.ok(result.data.every((item: { image: string }) => item.image));
    }
    await integrationResponse(new Request("https://radiosinta.com.br/api/news"));
    assert.equal(localCalls, 1);
    now += 900_000;
    const tasks: Promise<unknown>[] = [];
    await integrationResponse(new Request("https://radiosinta.com.br/api/news/gospel"), (p) =>
      tasks.push(p),
    );
    await integrationResponse(new Request("https://radiosinta.com.br/api/news"), (p) =>
      tasks.push(p),
    );
    await Promise.all(tasks);
    assert.equal(gospelCalls, 2);
    assert.equal(localCalls, 2);
    assert.equal(mediaCalls, 1);
    const good = await integrationResponse(
      new Request("https://radiosinta.com.br/api/news/gospel"),
    );
    assert.ok(good);
    assert.equal((await good.json()).stale, false);
    const stale = await integrationResponse(new Request("https://radiosinta.com.br/api/news"));
    assert.ok(stale);
    assert.equal((await stale.json()).stale, true);
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
    if (descriptor) Object.defineProperty(globalThis, "caches", descriptor);
    else Reflect.deleteProperty(globalThis, "caches");
  }
});
