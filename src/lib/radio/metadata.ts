import { normalizeNowPlaying } from "./normalize.ts";
import type { RadioNowPlaying, ServiceResult } from "./types.ts";

export const HOSTPLAY_METADATA_URL = "https://play.radiosinta.com.br/api/nowplaying?sid=1";
export const METADATA_QUERY_KEY = ["radio", "nowplaying"] as const;
export type MetadataSource = "hostplay" | "worker";

// Only the explicit value "worker" enables rollback. Errors never change transports.
export const metadataSource = (configured?: string): MetadataSource =>
  configured === "worker" ? "worker" : "hostplay";

export async function readNowPlaying(
  signal: AbortSignal,
  source: MetadataSource = "hostplay",
): Promise<ServiceResult<RadioNowPlaying>> {
  const controller = new AbortController();
  const cancel = () => controller.abort(signal.reason);
  if (signal.aborted) cancel();
  else signal.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(
    () => controller.abort(new DOMException("Tempo de resposta excedido", "TimeoutError")),
    8_000,
  );
  try {
    const response = await fetch(source === "worker" ? "/api/nowplaying" : HOSTPLAY_METADATA_URL, {
      signal: controller.signal,
      cache: "no-store",
      credentials: "omit",
      mode: "cors",
      redirect: "error",
    });
    if (!response.ok)
      throw new Error(`Metadados temporariamente indisponíveis (${response.status})`);
    const payload: unknown = await response.json();
    if (source === "worker") {
      const result = payload as ServiceResult<unknown> | null;
      return {
        data: normalizeNowPlaying(result?.data),
        updatedAt:
          typeof result?.updatedAt === "number" && Number.isFinite(result.updatedAt)
            ? result.updatedAt
            : Date.now(),
        stale: Boolean(result?.stale),
      };
    }
    return { data: normalizeNowPlaying(payload), updatedAt: Date.now(), stale: false };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", cancel);
  }
}

export function nowPlayingOptions(source: MetadataSource, visible: boolean) {
  return {
    queryKey: [...METADATA_QUERY_KEY, source],
    queryFn: ({ signal }: { signal: AbortSignal }) => readNowPlaying(signal, source),
    enabled: visible,
    staleTime: 15_000,
    // Keep the last valid snapshot throughout the browser session, including outages.
    gcTime: Infinity,
    refetchInterval: (query: { state: { status: string } }): number | false =>
      visible ? (query.state.status === "error" ? 120_000 : 15_000) : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    // Two retries at 15/30 seconds; after exhaustion, space polling by two minutes.
    retry: 2,
    retryDelay: (attempt: number) => Math.min(15_000 * 2 ** attempt, 60_000),
  };
}
