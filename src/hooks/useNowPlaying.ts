import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { RadioNowPlaying, ServiceResult } from "@/lib/radio/types";

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
  return useQuery({
    queryKey: ["radio", "nowplaying"],
    queryFn: ({ signal }) => readService<RadioNowPlaying>("/api/nowplaying", signal),
    enabled: visible,
    staleTime: 15_000,
    gcTime: 3_600_000,
    refetchInterval: visible ? 15_000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: false,
  });
}
