import type { NewsItem } from "./types.ts";
import { newsImageUrl } from "./normalize.ts";
import { safeUrl } from "../radio/normalize.ts";
import { feedSources } from "./sources.ts";

export function gospelPostId(item: NewsItem): string | null {
  try {
    const url = new URL(item.id);
    const id = url.searchParams.get("p");
    return feedSources.gospel.hosts.some((host) => host === url.hostname) &&
      /^\d{1,10}$/.test(id ?? "")
      ? id
      : null;
  } catch {
    return null;
  }
}
export function normalizeWordPressImages(input: unknown): Record<string, string> {
  if (!Array.isArray(input)) throw new Error("Resposta WordPress inválida");
  const images: Record<string, string> = {};
  for (const post of input.slice(0, 4)) {
    if (!post || typeof post !== "object") continue;
    const url = safeUrl(post.link, [...feedSources.gospel.hosts]);
    const image = newsImageUrl(post.jetpack_featured_media_url, "gospel");
    if (url && image) images[url] = image;
  }
  return images;
}
export async function completeGospelImages(
  items: NewsItem[],
  lookup: (ids: string[]) => Promise<Record<string, string>>,
): Promise<NewsItem[]> {
  // Only the four newest candidates can trigger complementary requests.
  const ids = items
    .slice(0, 4)
    .filter((item) => !item.image)
    .map(gospelPostId)
    .filter((id): id is string => Boolean(id));
  if (!ids.length) return items;
  try {
    const images = await lookup([...new Set(ids)]);
    return items.map((item) => ({ ...item, image: item.image ?? images[item.url] ?? null }));
  } catch {
    return items;
  } // RSS stays usable if the optional REST API fails.
}
export { gospelHighlights } from "./normalize.ts";
