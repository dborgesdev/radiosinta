import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { useNews } from "@/hooks/useNews";

export function NewsTicker() {
  const gospel = useNews("gospel");
  const regional = useNews("regional");
  const [paused, setPaused] = useState(false);
  const items = [...(gospel.data?.data ?? []), ...(regional.data?.data ?? [])]
    .filter((item, index, all) => all.findIndex((other) => other.url === item.url) === index)
    .sort((a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0))
    .slice(0, 10);
  const characters = items.reduce((sum, item) => sum + item.title.length + 4, 0);
  // Fill the strip even when only one feed item is available. Extra copies are visual only.
  const repeats = characters ? Math.max(1, Math.ceil(260 / characters)) : 1;
  const sequence = Array.from({ length: repeats }, () => items).flat();
  const duration = Math.max(40, (characters * repeats) / 8);
  return (
    <aside className={`news-ticker ${paused ? "ticker-paused" : ""}`} aria-label="Últimas notícias">
      <span className="ticker-label">ÚLTIMAS</span>
      <div className="ticker-window">
        {items.length ? (
          <div className="ticker-track" style={{ animationDuration: `${duration}s` }}>
            {[false, true].map((duplicate) => (
              <div
                className="ticker-group"
                key={String(duplicate)}
                aria-hidden={duplicate || undefined}
              >
                {sequence.map((item, index) => (
                  <a
                    key={`${item.url}-${index}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={duplicate || index >= items.length ? -1 : undefined}
                    aria-hidden={duplicate || index >= items.length || undefined}
                  >
                    {item.title}
                    <span aria-hidden="true">•</span>
                  </a>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <a className="ticker-placeholder" href="#noticias">
            {gospel.isPending || regional.isPending
              ? "Informação e companhia, todos os dias."
              : "Acompanhe as notícias dos nossos portais parceiros."}
          </a>
        )}
      </div>
      <button
        className="ticker-pause"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? "Retomar manchetes" : "Pausar manchetes"}
        aria-pressed={paused}
      >
        {paused ? <Play size={13} /> : <Pause size={13} />}
      </button>
    </aside>
  );
}
