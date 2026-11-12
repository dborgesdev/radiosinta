import { useQuery } from "@tanstack/react-query";
import { readService, useVisible } from "./useNowPlaying";
import type { NewsItem } from "@/lib/news/types";

export function useNews(source: "gospel" | "regional") {
  const visible = useVisible();
  return useQuery({
    queryKey: ["news", source],
    queryFn: ({ signal }) =>
      readService<NewsItem[]>(source === "gospel" ? "/api/news/gospel" : "/api/news", signal),
    enabled: visible,
    staleTime: 900_000,
    gcTime: 86_400_000,
    refetchInterval: visible ? 900_000 : false,
    refetchIntervalInBackground: false,
    retry: false,
  });
}
