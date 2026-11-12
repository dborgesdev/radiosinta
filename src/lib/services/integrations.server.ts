import { DevelopmentCache, IntegrationCache } from "./cache.ts";
import type { CacheStore, Entry, WaitUntil } from "./cache.ts";
import { normalizeNowPlaying } from "../radio/normalize.ts";
import { parseRss } from "../news/parser.ts";
import type { NewsItem } from "../news/types.ts";
import { feedSources, type FeedSource } from "../news/sources.ts";
import {
  completeGospelImages,
  gospelHighlights,
  normalizeWordPressImages,
} from "../news/gospel.ts";

export const policies = {
  radio: { ttl: 15, retention: 3600, retry: 15, swr: false },
  news: { ttl: 900, retention: 86400, retry: 60, swr: true },
  media: { ttl: 86400, retention: 604800, retry: 60, swr: false },
};
// No binding required: caches.default exists in the Cloudflare module runtime.
const developmentStore = new DevelopmentCache();
let service: IntegrationCache | undefined;
let shared = false;
function getService() {
  if (!service) {
    const storage = (globalThis as typeof globalThis & { caches?: { default?: CacheStore } }).caches
      ?.default;
    shared = Boolean(storage);
    service = new IntegrationCache(storage ?? developmentStore);
  }
  return service;
}

export async function limitedText(response: Response, max: number): Promise<string> {
  if (Number(response.headers.get("content-length")) > max)
    throw new Error("Resposta muito grande");
  if (!response.body) throw new Error("Resposta vazia");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let length = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > max) throw new Error("Resposta muito grande");
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

async function origin(url: string, max: number, headers?: HeadersInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    // Workers implements follow/manual, not the browser's redirect:"error".
    // Reject 3xx below instead of following an unvalidated destination.
    const response = await fetch(url, { headers, signal: controller.signal, redirect: "manual" });
    if (response.status === 304) return { response, body: "" };
    if (!response.ok) throw new Error("Origem indisponível");
    return { response, body: await limitedText(response, max) };
  } catch (error) {
    console.warn(
      "Integration origin unavailable",
      new URL(url).hostname,
      error instanceof Error
        ? error.message.replace(/https?:\/\/\S+/g, "[url]").slice(0, 180)
        : "Unknown error",
    );
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function integrationResponse(
  request: Request,
  waitUntil?: WaitUntil,
): Promise<Response | null> {
  const path = new URL(request.url).pathname;
  if (path !== "/api/nowplaying" && path !== "/api/news" && path !== "/api/news/gospel")
    return null;
  if (request.method !== "GET")
    return new Response(null, { status: 405, headers: { Allow: "GET" } });
  const cache = getService();
  const key = new Request(
    new URL(`/__integration-cache/${path === "/api/nowplaying" ? "v1" : "v2"}${path}`, request.url)
      .href,
  );
  const source: FeedSource = path === "/api/news/gospel" ? "gospel" : "regional";
  const enrich = (items: NewsItem[]) =>
    completeGospelImages(items, async (ids) => {
      const mediaKey = new Request(
        new URL(`/__integration-cache/v2/gospel-media/${ids.slice().sort().join("-")}`, request.url)
          .href,
      );
      const result = await cache.get(mediaKey, policies.media, async () => {
        const params = new URLSearchParams({
          include: ids.join(","),
          per_page: String(ids.length),
          _fields: "link,jetpack_featured_media_url",
        });
        const { body } = await origin(
          `https://folhagospel.com/wp-json/wp/v2/posts?${params}`,
          256_000,
        );
        const images = normalizeWordPressImages(JSON.parse(body));
        if (!Object.keys(images).length) throw new Error("WordPress sem imagens utilizáveis");
        return { data: images };
      });
      return result.data ?? {};
    });
  const result =
    path === "/api/nowplaying"
      ? await cache.get(
          key,
          policies.radio,
          async () => {
            const { body } = await origin(
              "https://play.radiosinta.com.br/api/nowplaying?sid=1",
              128_000,
            );
            return { data: normalizeNowPlaying(JSON.parse(body)) };
          },
          waitUntil,
        )
      : await cache.get(
          key,
          policies.news,
          async (previous?: Entry<NewsItem[]>) => {
            const headers = new Headers({
              Accept: "application/rss+xml, application/xml, text/xml",
            });
            if (previous?.etag) headers.set("If-None-Match", previous.etag);
            if (previous?.modified) headers.set("If-Modified-Since", previous.modified);
            const { response, body } = await origin(feedSources[source].url, 2_000_000, headers);
            const validators = {
              etag: response.headers.get("etag") ?? undefined,
              modified: response.headers.get("last-modified") ?? undefined,
            };
            if (response.status === 304) {
              // Retry optional missing media from its independent cache without reparsing XML.
              if (source === "gospel" && previous?.data)
                return { data: await enrich(previous.data), ...validators };
              return { notModified: true as const, ...validators };
            }
            const items = parseRss(body, source);
            return { data: source === "gospel" ? await enrich(items) : items, ...validators };
          },
          waitUntil,
        );
  const output =
    source === "gospel" && path !== "/api/nowplaying"
      ? { ...result, data: result.data ? gospelHighlights(result.data as NewsItem[]) : null }
      : result;
  return Response.json(output, {
    status: result.data ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Integration-Cache": shared ? "cloudflare-pop" : "development-process",
    },
  });
}
