import { ArrowRight } from "lucide-react";
import { useRadio } from "@/hooks/useRadio";
import { CoverArt } from "./CoverArt";

export function RadioHistory() {
  const { nowPlaying, metadataLoading } = useRadio();
  return (
    <section
      className="radio-container radio-history"
      id="historico"
      aria-labelledby="history-title"
    >
      <div className="section-heading">
        <div>
          <p className="radio-eyebrow">NA NOSSA FREQUÊNCIA</p>
          <h2 id="history-title">Tocou agora há pouco</h2>
        </div>
        <ArrowRight className="history-arrow" aria-hidden="true" />
      </div>
      {nowPlaying?.history.length ? (
        <div
          className="history-strip"
          tabIndex={0}
          aria-label="Músicas recentes, role para ver mais"
        >
          {nowPlaying.history.map((item, i) => (
            <article className="history-card" key={`${item.title}-${item.played_at}-${i}`}>
              <div className="history-art">
                <CoverArt src={item.cover ?? item.coverXl} />
                {item.played_at && <span>{item.played_at}</span>}
              </div>
              <h3 title={item.title}>{item.title}</h3>
              <p>{item.artist || "Rádio Sinta"}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="section-empty">
          {metadataLoading
            ? "Carregando as últimas músicas…"
            : "O histórico da programação estará aqui assim que estiver disponível."}
        </p>
      )}
    </section>
  );
}
