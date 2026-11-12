import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRss } from "../src/lib/news/parser.ts";
import { normalizeNowPlaying } from "../src/lib/radio/normalize.ts";
import { saoPauloDay, verseForDay } from "../src/lib/dailyVerse.ts";
import { dailyVerses } from "../src/data/dailyVerses.ts";
import { toggleAudio, STREAM_URL } from "../src/lib/radio/playback.ts";
import { limitedText } from "../src/lib/services/integrations.server.ts";
import { shareOrCopy } from "../src/lib/share.ts";

const item = (id: number, content = "", date = "Thu, 12 Nov 2026 10:00:00 GMT") =>
  `<item><title>Notícia &amp; fé ${id}</title><link>https://defatoonline.com.br/n${id}/</link><guid>${id}</guid><pubDate>${date}</pubDate>${content}</item>`;
const feed = (...items: string[]) =>
  `<rss xmlns:media="http://search.yahoo.com/mrss/" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>${items.join("")}</channel></rss>`;

test("sharing uses native share or copies real content, and handles cancellation/denial", async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const data = { title: "Rádio Sinta", text: "Palavra do dia", url: "https://radiosinta.com.br" };
  let copied = "";
  try {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { share: async (value: unknown) => assert.deepEqual(value, data) },
    });
    assert.equal(await shareOrCopy(data), "shared");
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        clipboard: {
          writeText: async (text: string) => {
            copied = text;
          },
        },
      },
    });
    assert.equal(await shareOrCopy(data), "copied");
    assert.equal(copied, "Palavra do dia\nhttps://radiosinta.com.br");
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        share: async () => {
          throw new DOMException("cancelled", "AbortError");
        },
      },
    });
    assert.equal(await shareOrCopy(data), "cancelled");
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        clipboard: {
          writeText: async () => {
            throw new Error("denied");
          },
        },
      },
    });
    assert.equal(await shareOrCopy(data), "failed");
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "navigator", descriptor);
    else Reflect.deleteProperty(globalThis, "navigator");
  }
});

test("RSS sorts newest first, deduplicates, preserves full headlines, caps ten items and strips remote HTML", () => {
  const xml = feed(
    item(1),
    item(
      2,
      "<description><![CDATA[<script>bad()</script><p>Boa notícia</p>]]></description>",
      "Thu, 12 Nov 2026 11:00:00 GMT",
    ),
    item(1),
  );
  const news = parseRss(xml);
  assert.equal(news.length, 2);
  assert.equal(news[0].id, "2");
  assert.equal(news[0].summary, "Boa notícia");
  assert.equal(news[0].title, "Notícia & fé 2");
  assert.equal(parseRss(feed(...Array.from({ length: 20 }, (_, i) => item(i)))).length, 10);
  const headline = "Uma manchete longa ".repeat(25);
  assert.equal(
    parseRss(feed(item(1).replace("Notícia &amp; fé 1", headline)))[0].title,
    headline.trim(),
  );
});
test("RSS image priority is media content, thumbnail, enclosure, then embedded image", () => {
  const image = "https://cdn.defatoonline.com.br/photo.jpg";
  for (const content of [
    `<media:content url="${image}"/>`,
    `<media:thumbnail url="${image}"/>`,
    `<enclosure url="${image}" type="image/jpeg"/>`,
    `<description><![CDATA[<img src="${image}"/>]]></description>`,
    `<content:encoded><![CDATA[<img src="${image}"/>]]></content:encoded>`,
  ])
    assert.equal(parseRss(feed(item(1, content)))[0].image, image);
  const news = parseRss(
    feed(
      item(
        1,
        `<media:content url="${image}"/><media:thumbnail url="https://cdn.defatoonline.com.br/other.jpg"/>`,
      ),
    ),
  );
  assert.equal(news[0].image, image);
});
test("RSS rejects invalid XML, entities, unsafe URLs and images", () => {
  for (const xml of [
    "<rss>",
    '<!DOCTYPE x [<!ENTITY e "x">]><rss/>',
    feed(item(1).replace("https://defatoonline.com.br/n1/", "javascript:alert(1)")),
    feed(
      item(1).replace(
        "https://defatoonline.com.br/n1/",
        "https://defatoonline.com.br.evil.test/n1/",
      ),
    ),
  ])
    assert.throws(() => parseRss(xml));
  assert.equal(parseRss(feed(item(1, '<media:content url="http://evil.test/x"/>')))[0].image, null);
});
test("Hostplay normalizes relative covers, nulls and whitespace without inverting historical artist/title", () => {
  const data = normalizeNowPlaying({
    title: "  Canção   de paz  ",
    artist: "Artista",
    cover: "/assets/a.webp",
    history: [{ title: "Cantor Youtube", artist: "Música", cover: null, played_at: "12:30" }, {}],
  });
  assert.equal(data.title, "Canção de paz");
  assert.equal(data.cover, "https://play.radiosinta.com.br/assets/a.webp");
  assert.equal(data.bitrate, null);
  assert.equal(data.history.length, 1);
  assert.equal(data.history[0].title, "Cantor Youtube");
  assert.equal(data.history[0].artist, "Música");
  assert.equal(normalizeNowPlaying({ title: "Live", cover: "javascript:alert(1)" }).cover, null);
  for (const data of [null, {}, { title: " " }, "bad"])
    assert.throws(() => normalizeNowPlaying(data));
});
test("365 local real references are unique, stable on reload, rotate at São Paulo midnight without consecutive repeats", () => {
  assert.equal(dailyVerses.length, 365);
  assert.equal(new Set(dailyVerses.map((v) => v.reference)).size, 365);
  assert.ok(
    dailyVerses.every(
      (v) => v.text.length >= 25 && /^Salmos \d+:\d+$/.test(v.reference) && !v.text.includes("\\"),
    ),
  );
  assert.equal(
    dailyVerses.find((v) => v.reference === "Salmos 23:1")?.text,
    "O SENHOR é meu pastor, nada me faltará.",
  );
  const before = saoPauloDay(new Date("2026-11-13T02:59:59Z"));
  const after = saoPauloDay(new Date("2026-11-13T03:00:00Z"));
  assert.equal(before, "2026-11-12");
  assert.equal(after, "2026-11-13");
  assert.deepEqual(verseForDay(before), verseForDay(before));
  assert.notEqual(verseForDay(before).reference, verseForDay(after).reference);
  for (let i = 1; i < 800; i++) {
    const day = new Date(Date.UTC(2024, 0, i)).toISOString().slice(0, 10);
    const next = new Date(Date.UTC(2024, 0, i + 1)).toISOString().slice(0, 10);
    assert.notEqual(verseForDay(day).reference, verseForDay(next).reference);
  }
});
test("global playback uses real play/pause, releases network on pause and resumes the same MP3", async () => {
  let plays = 0;
  let loads = 0;
  const audio = {
    src: "",
    paused: true,
    volume: 0.5,
    play: async () => {
      plays++;
      audio.paused = false;
    },
    pause: () => {
      audio.paused = true;
    },
    load: () => {
      loads++;
    },
    removeAttribute: () => {
      audio.src = "";
    },
  };
  await toggleAudio(audio);
  assert.equal(audio.src, STREAM_URL);
  assert.equal(plays, 1);
  normalizeNowPlaying({ title: "Changed song" });
  assert.equal(plays, 1);
  assert.equal(loads, 1);
  await toggleAudio(audio);
  assert.equal(audio.paused, true);
  assert.equal(audio.src, "");
  await toggleAudio(audio);
  assert.equal(audio.src, STREAM_URL);
  assert.equal(plays, 2);
  audio.paused = true;
  audio.play = async () => {
    throw new Error("stream unavailable");
  };
  await assert.rejects(() => toggleAudio(audio));
});
test("origin response reader enforces byte limits, including chunked bodies", async () => {
  assert.equal(await limitedText(new Response("abc"), 3), "abc");
  await assert.rejects(() => limitedText(new Response("abcd"), 3));
  await assert.rejects(() =>
    limitedText(new Response("x", { headers: { "content-length": "999" } }), 3),
  );
});
