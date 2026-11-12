import type { RadioNowPlaying } from "./types.ts";

export const cleanText = (value: unknown): string =>
  typeof value === "string"
    ? value
        // eslint-disable-next-line no-control-regex -- strip untrusted metadata controls
        .replace(/[\u0000-\u001f<>]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";

export function safeUrl(value: unknown, hosts: string[], base?: string): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, base);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      (url.port && url.port !== "443")
    )
      return null;
    if (!hosts.includes(url.hostname)) return null;
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

export function normalizeNowPlaying(input: unknown): RadioNowPlaying {
  if (!input || typeof input !== "object") throw new Error("Metadados inválidos");
  const data = input as Record<string, unknown>;
  const title = cleanText(data.title);
  if (!title) throw new Error("Título ausente");
  const cover = (value: unknown) =>
    safeUrl(
      value,
      [
        "play.radiosinta.com.br",
        "cdn-images.dzcdn.net",
        "e-cdns-images.dzcdn.net",
        "is1-ssl.mzstatic.com",
      ],
      "https://play.radiosinta.com.br",
    );
  return {
    raw: cleanText(data.raw),
    title,
    artist: cleanText(data.artist),
    cover: cover(data.cover),
    coverXl: cover(data.coverXl),
    bitrate:
      typeof data.bitrate === "number" && Number.isFinite(data.bitrate) && data.bitrate > 0
        ? data.bitrate
        : null,
    history: (Array.isArray(data.history) ? data.history : [])
      .slice(0, 20)
      .flatMap((value) => {
        if (!value || typeof value !== "object") return [];
        const item = value as Record<string, unknown>;
        const title = cleanText(item.title);
        if (!title) return [];
        return [
          {
            title,
            artist: cleanText(item.artist),
            cover: cover(item.cover),
            coverXl: cover(item.coverXl),
            played_at: /^\d{2}:\d{2}$/.test(String(item.played_at)) ? String(item.played_at) : "",
          },
        ];
      })
      .slice(0, 6),
  };
}
