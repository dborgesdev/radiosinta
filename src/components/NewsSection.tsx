import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useNews } from "@/hooks/useNews";
import type { NewsItem } from "@/lib/news/types";

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
export function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const hasImage = item.image && failedImage !== item.image;
  return (
    <article
      className={`news-card ${featured ? "news-featured" : "news-secondary"} ${hasImage ? "" : "image-unavailable"}`}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${item.title} (abre em nova aba)`}
      >
        {hasImage && (
          <div className="news-image">
            <img
              src={item.image!}
              alt=""
              width={900}
              height={600}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setFailedImage(item.image)}
            />
          </div>
        )}
        <div className="news-copy">
          {item.publishedAt && (
            <time dateTime={item.publishedAt}>{dateLabel(item.publishedAt)}</time>
          )}
          <h3>{item.title}</h3>
          <span className="news-read">
            Ler reportagem <ArrowUpRight size={16} />
          </span>
        </div>
      </a>
    </article>
  );
}
export function NewsSection() {
  const gospel = useNews("gospel");
  const regional = useNews("regional");
  const highlights = gospel.data?.data ?? [];
  const local = regional.data?.data?.slice(0, 6) ?? [];
  return (
    <section className="radio-container news-section" id="noticias" aria-labelledby="news-title">
      <div className="section-heading">
        <div>
          <p className="radio-eyebrow">INFORMAÇÃO QUE CONECTA</p>
          <h2 id="news-title">
            Últimas Notícias<span className="accent-period">.</span>
          </h2>
        </div>
      </div>
      <div className="news-group-heading">
        <h3>Universo gospel</h3>
        <a href="https://folhagospel.com/" target="_blank" rel="noopener noreferrer">
          Mais notícias <ArrowUpRight size={16} />
        </a>
      </div>
      {gospel.data?.stale || (gospel.isError && highlights.length) ? (
        <p className="news-status">Exibindo a última seleção gospel recebida.</p>
      ) : null}
      {highlights.length ? (
        <div className="news-highlights" data-count={highlights.length}>
          <NewsCard item={highlights[0]} featured />
          {highlights.length > 1 && (
            <div className="news-side">
              {highlights.slice(1, 4).map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="section-empty">
          {gospel.isPending ? (
            "Buscando as notícias gospel…"
          ) : (
            <>
              As notícias gospel com imagens estão temporariamente indisponíveis.{" "}
              <a href="https://folhagospel.com/" target="_blank" rel="noopener noreferrer">
                Acompanhe no portal ↗
              </a>
            </>
          )}
        </p>
      )}
      <div className="news-group-heading regional-heading">
        <h3>Itabira e região</h3>
        <a href="https://defatoonline.com.br/" target="_blank" rel="noopener noreferrer">
          Notícias da região <ArrowUpRight size={16} />
        </a>
      </div>
      {regional.data?.stale || (regional.isError && local.length) ? (
        <p className="news-status">Exibindo a última seleção regional recebida.</p>
      ) : null}
      {local.length ? (
        <div className="news-headlines">
          {local.map((item) => (
            <article key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.title} (abre em nova aba)`}
              >
                {item.publishedAt && (
                  <time dateTime={item.publishedAt}>{dateLabel(item.publishedAt)}</time>
                )}
                <h3>{item.title}</h3>
                {item.summary && <p>{item.summary}</p>}
                <span className="news-read">
                  Ler reportagem <ArrowUpRight size={16} />
                </span>
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className="section-empty">
          {regional.isPending ? (
            "Buscando as notícias da região…"
          ) : (
            <>
              As notícias regionais estão temporariamente indisponíveis.{" "}
              <a href="https://defatoonline.com.br/" target="_blank" rel="noopener noreferrer">
                Acompanhe no portal ↗
              </a>
            </>
          )}
        </p>
      )}
    </section>
  );
}
