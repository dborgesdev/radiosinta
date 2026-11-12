import { XMLParser, XMLValidator } from "fast-xml-parser";
import { safeUrl } from "../radio/normalize.ts";
import type { NewsItem } from "./types.ts";
import { feedSources, type FeedSource } from "./sources.ts";

const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};
const array = (v: unknown): unknown[] => (Array.isArray(v) ? v : v == null ? [] : [v]);
const scalar = (v: unknown): string =>
  typeof v === "string" || typeof v === "number" ? String(v) : String(record(v)["#text"] ?? "");
export function plainText(value: unknown): string {
  return (
    scalar(value)
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&(?:nbsp|amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, (entity) => {
        const basic: Record<string, string> = {
          "&nbsp;": " ",
          "&amp;": "&",
          "&lt;": "<",
          "&gt;": ">",
          "&quot;": '"',
          "&apos;": "'",
        };
        const key = entity.toLowerCase();
        if (basic[key]) return basic[key];
        const code = key.startsWith("&#x")
          ? parseInt(key.slice(3, -1), 16)
          : parseInt(key.slice(2, -1), 10);
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : " ";
      })
      // eslint-disable-next-line no-control-regex -- strip untrusted RSS controls
      .replace(/[\u0000-\u001f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}
export function decodeEntities(text: string): string {
  return text.replace(/&(?:amp|quot|apos|lt|gt|nbsp|#\d+|#x[\da-f]+);/gi, (entity) => {
    const basic: Record<string, string> = {
      "&amp;": "&",
      "&quot;": '"',
      "&apos;": "'",
      "&lt;": "<",
      "&gt;": ">",
      "&nbsp;": " ",
    };
    const key = entity.toLowerCase();
    if (basic[key]) return basic[key];
    const code = key.startsWith("&#x")
      ? parseInt(key.slice(3, -1), 16)
      : parseInt(key.slice(2, -1), 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : " ";
  });
}
export function newsImageUrl(value: unknown, source: FeedSource): string | null {
  const url = safeUrl(decodeEntities(scalar(value)), [...feedSources[source].imageHosts]);
  if (!url) return null;
  const parsed = new URL(url);
  if (/^i[0-3]\.wp\.com$/.test(parsed.hostname) && !parsed.pathname.startsWith("/folhagospel.com/"))
    return null;
  return url;
}
function cleanArticleText(html: string): string {
  return plainText(
    html
      .replace(/<(script|style|iframe|figure|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
      .replace(/\[[^\]]*\]/g, " "),
  )
    .replace(
      /(?:The post|O post|Esta notícia|Este artigo)[\s\S]*?(?:first appeared on|apareceu primeiro em|foi publicado originalmente)[\s\S]*$/i,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}
export function newsSummary(content: unknown, description: unknown): string {
  const articleHtml = scalar(content).replace(
    /<(script|style|iframe|figure|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    " ",
  );
  const paragraphs = Array.from(articleHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/gi)).map(
    (match) => cleanArticleText(match[1]),
  );
  const relevant = paragraphs.find(
    (text) =>
      text.length >= 45 &&
      !/^(?:leia (?:também|mais)|veja também|publicidade|continua após|assista|foto:|crédito:)/i.test(
        text,
      ),
  );
  const text =
    relevant || cleanArticleText(scalar(description)) || cleanArticleText(scalar(content));
  if (text.length <= 180) return text;
  const end = text.lastIndexOf(" ", 177);
  return text.slice(0, end >= 120 ? end : 177).trimEnd() + "…";
}

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
