import { useState } from "react";
import { Play, Pause, Share2, Volume2, LoaderCircle } from "lucide-react";
import { useRadio } from "@/hooks/useRadio";
import { CoverArt } from "./CoverArt";
import { useRadioConfig } from "@/hooks/useRadioConfig";
import { shareOrCopy } from "@/lib/share";

export function StickyPlayer() {
  const cfg = useRadioConfig();
  const { nowPlaying, state, volume, setVolume, toggle } = useRadio();
  const [feedback, setFeedback] = useState("");
  const [volumeOpen, setVolumeOpen] = useState(false);
  const Icon = state === "playing" ? Pause : state === "loading" ? LoaderCircle : Play;
  async function share() {
    const result = await shareOrCopy({
      title: cfg.name,
      text: cfg.slogan,
      url: `https://${cfg.domain}`,
    });
    setFeedback(
      result === "copied"
        ? "Link copiado!"
        : result === "failed"
          ? "Não foi possível compartilhar."
          : "",
    );
  }
  return (
    <aside id="sticky-player" className="sticky-radio" aria-label="Player da Rádio Sinta">
      <div className="radio-container sticky-radio-inner">
        <CoverArt src={nowPlaying?.cover ?? nowPlaying?.coverXl ?? null} />
        <div className="sticky-track">
          <span className="sticky-live">
            <span className="live-dot" /> AO VIVO
          </span>
          <strong title={nowPlaying?.title}>{nowPlaying?.title ?? "Programação ao vivo"}</strong>
          <span>{nowPlaying?.artist || cfg.name}</span>
        </div>
        <p className="playback-status" role="status">
          {state === "error"
            ? "Falha na conexão. Toque para tentar novamente."
            : state === "loading"
              ? "Conectando…"
              : ""}
        </p>
        <button
          className="player-toggle"
          aria-label={state === "playing" ? "Pausar transmissão" : "Reproduzir transmissão"}
          onClick={toggle}
        >
          <Icon size={21} className={state === "loading" ? "animate-spin" : ""} />
        </button>
        <button
          className="mobile-volume-toggle"
          aria-label="Ajustar volume"
          aria-expanded={volumeOpen}
          aria-controls="radio-volume"
          onClick={() => setVolumeOpen((open) => !open)}
        >
          <Volume2 size={17} />
        </button>
        <label id="radio-volume" className={`radio-volume ${volumeOpen ? "volume-open" : ""}`}>
          <Volume2 size={17} />
          <span className="sr-only">Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </label>
        <button className="player-share" onClick={share} aria-label="Compartilhar Rádio Sinta">
          <Share2 size={19} />
        </button>
        <span className="share-feedback" role="status">
          {feedback}
        </span>
      </div>
    </aside>
  );
}
