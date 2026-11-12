import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ServiceResult } from "@/lib/radio/types";
import { metadataSource, METADATA_QUERY_KEY, nowPlayingOptions } from "@/lib/radio/metadata";

export function useVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}
export async function readService<T>(path: string, signal: AbortSignal): Promise<ServiceResult<T>> {
  const response = await fetch(path, { signal });
  if (!response.ok) throw new Error("Atualização temporariamente indisponível");
  const result = (await response.json()) as ServiceResult<T>;
  if (!result.data) throw new Error("Sem dados disponíveis");
  return result;
}
export function useNowPlaying() {
  const visible = useVisible();
  const client = useQueryClient();
  const source = metadataSource(import.meta.env.VITE_RADIO_METADATA_SOURCE);
  useEffect(() => {
    if (!visible) void client.cancelQueries({ queryKey: METADATA_QUERY_KEY });
  }, [visible, client]);
  return useQuery(nowPlayingOptions(source, visible));
}
