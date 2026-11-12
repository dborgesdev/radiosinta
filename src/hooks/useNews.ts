import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVisible } from "./useNowPlaying";
import { NEWS_QUERY_KEY, newsOptions } from "@/lib/news/rest";

export function useNews(source: "gospel" | "regional") {
  const visible = useVisible();
  const client = useQueryClient();
  useEffect(() => {
    if (!visible && document.visibilityState === "hidden")
      void client.cancelQueries({ queryKey: [...NEWS_QUERY_KEY, source] });
  }, [visible, client, source]);
  return useQuery(newsOptions(source, visible));
}
