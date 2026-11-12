import { ALL_ENTITIES, EntityDecoder } from "@nodable/entities";
import { safeUrl } from "../radio/normalize.ts";
import type { ServiceResult } from "../radio/types.ts";
import { gospelHighlights, newsImageUrl, newsSummary, plainText } from "./normalize.ts";
import { feedSources, type FeedSource } from "./sources.ts";
import type { NewsItem } from "./types.ts";

export const newsEndpoints: Record<FeedSource, string> = {
  regional:
    "https://defatoonline.com.br/wp-json/wp/v2/posts?per_page=10&_fields=id,date,link,title,excerpt,featured_media,featured_image_url",
  gospel:
    "https://folhagospel.com/wp-json/wp/v2/posts?per_page=10&_fields=id,date,link,title,excerpt,featured_media,jetpack_featured_media_url",
};
export const NEWS_QUERY_KEY = ["news", "rest-v1"] as const;
const decoder = new EntityDecoder({ namedEntities: ALL_ENTITIES });
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};
const decoded = (value: unknown) => (typeof value === "string" ? decoder.decode(value) : "");

export function wordpressDate(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})?$/.test(value)
  )
    return null;
  // Public WP index: both publishers use UTC-03; date is in the site's timezone.
  const timestamp = Date.parse(value.length === 19 ? `${value}-03:00` : value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

export function normalizeWordPressPosts(payload: unknown, source: FeedSource): NewsItem[] {
  if (!Array.isArray(payload)) throw new Error("Resposta de notícias inválida");
  const seen = new Set<string>();
  const items = payload
    .slice(0, 10)
    .flatMap((value): NewsItem[] => {
      const post = record(value);
      const title = plainText(decoded(record(post.title).rendered));
      const url = safeUrl(decoded(post.link), [...feedSources[source].hosts]);
      if (!title || !url || seen.has(url)) return [];
      seen.add(url);
      return [
        {
          id: typeof post.id === "number" && Number.isSafeInteger(post.id) ? String(post.id) : url,
          title,
          url,
          publishedAt: wordpressDate(post.date),
          summary: newsSummary("", decoded(record(post.excerpt).rendered)),
          image: newsImageUrl(
            source === "gospel" ? post.jetpack_featured_media_url : post.featured_image_url,
            source,
          ),
          author: "",
          source: feedSources[source].name,
        },
      ];
    })
    .sort(
      (a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0),
    );
  if (!items.length) throw new Error("Sem notícias válidas");
  return items;
}

export async function readNews(
  source: FeedSource,
  signal: AbortSignal,
): Promise<ServiceResult<NewsItem[]>> {
  const controller = new AbortController();
  const cancel = () => controller.abort(signal.reason);
  if (signal.aborted) cancel();
  else signal.addEventListener("abort", cancel, { once: true });
  const timeout = setTimeout(
    () => controller.abort(new DOMException("Tempo de resposta excedido", "TimeoutError")),
    8_000,
  );
  try {
    const response = await fetch(newsEndpoints[source], {
      signal: controller.signal,
      credentials: "omit",
      mode: "cors",
      redirect: "error",
    });
    if (!response.ok) throw new Error(`Notícias indisponíveis (${response.status})`);
    const items = normalizeWordPressPosts(await response.json(), source);
    return {
      data: source === "gospel" ? gospelHighlights(items) : items,
      updatedAt: Date.now(),
      stale: false,
    };
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", cancel);
  }
}

export function newsOptions(source: FeedSource, visible: boolean) {
  return {
    queryKey: [...NEWS_QUERY_KEY, source],
    queryFn: ({ signal }: { signal: AbortSignal }) => readNews(source, signal),
    enabled: visible,
    staleTime: 900_000,
    gcTime: Infinity,
    refetchInterval: visible ? 900_000 : (false as const),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 1,
    retryDelay: 30_000,
  };
}
