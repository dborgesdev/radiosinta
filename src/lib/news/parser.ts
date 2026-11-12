import { XMLParser, XMLValidator } from "fast-xml-parser";
import { safeUrl } from "../radio/normalize.ts";
import type { NewsItem } from "./types.ts";
import { feedSources, type FeedSource } from "./sources.ts";

import { plainText, decodeEntities, newsImageUrl, newsSummary } from "./normalize.ts";
export { plainText, decodeEntities, newsImageUrl, newsSummary } from "./normalize.ts";

const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};
const array = (v: unknown): unknown[] => (Array.isArray(v) ? v : v == null ? [] : [v]);
const scalar = (v: unknown): string =>
  typeof v === "string" || typeof v === "number" ? String(v) : String(record(v)["#text"] ?? "");

export function parseRss(xml: string, source: FeedSource = "regional"): NewsItem[] {
  if (
    xml.length > 2_000_000 ||
    /<!\s*(DOCTYPE|ENTITY)/i.test(xml) ||
    XMLValidator.validate(xml) !== true
  )
    throw new Error("RSS inválido");
  const parsed = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    trimValues: true,
  }).parse(xml);
  const items = array(record(record(record(parsed).rss).channel).item);
  const urls = new Set<string>();
  const ids = new Set<string>();
  const news = items
    .slice(0, 100)
    .flatMap((value): NewsItem[] => {
      const item = record(value);
      const url = safeUrl(decodeEntities(scalar(item.link)), [...feedSources[source].hosts]);
      const title = plainText(item.title);
      if (!url || !title) return [];
      const media = [
        ...array(item["media:content"]),
        ...array(item["media:thumbnail"]),
        ...array(item.enclosure).filter((v) => scalar(record(v)["@_type"]).startsWith("image/")),
      ];
      const embedded = scalar(item["content:encoded"]) + scalar(item.description);
      const embeddedImages = Array.from(
        embedded.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi),
      ).map((m) => m[1]);
      const image =
        [...media.map((v) => record(v)["@_url"]), ...embeddedImages]
          .map((v) => newsImageUrl(v, source))
          .find(Boolean) ?? null;
      const date = Date.parse(scalar(item.pubDate));
      return [
        {
          id: scalar(item.guid) || url,
          title,
          url,
          publishedAt: Number.isFinite(date) ? new Date(date).toISOString() : null,
          summary: newsSummary(item["content:encoded"], item.description),
          image,
          author: plainText(item["dc:creator"]),
          source: feedSources[source].name,
        },
      ];
    })
    .sort((a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0))
    .filter((item) => {
      if (urls.has(item.url) || ids.has(item.id)) return false;
      urls.add(item.url);
      ids.add(item.id);
      return true;
    })
    .slice(0, source === "gospel" ? 20 : 10);
  if (!news.length) throw new Error("RSS sem notícias válidas");
  return news;
}
