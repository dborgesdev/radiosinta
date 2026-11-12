import { Smartphone, ArrowUpRight } from "lucide-react";
import { PlaybackButton } from "./PlaybackButton";
import { HeroPlayer } from "./HeroPlayer";
import { NowPlayingCard } from "./NowPlayingCard";
import { useRadioConfig } from "@/hooks/useRadioConfig";

export function Hero() {
  const cfg = useRadioConfig();
  return (
    <section id="inicio" className="radio-hero">
      <div className="radio-container hero-grid">
        <div className="hero-copy">
          <p className="radio-eyebrow">
            <span className="live-dot" /> AO VIVO · 24/7
          </p>
          <h1>
            <span className="hero-radio-word">Rádio</span>{" "}
            <span className="hero-sinta-line">
              <span className="hero-sinta-word">Sinta</span>
              <span className="hero-period">.</span>
            </span>
          </h1>
          <p className="hero-slogan">{cfg.slogan}</p>
          <div className="hero-actions">
            <PlaybackButton className="radio-primary" label />
            <a
              className="radio-secondary"
              href="https://play.radiosinta.com.br/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Smartphone size={17} /> <span className="app-label">Instalar aplicativo</span>{" "}
              <ArrowUpRight size={15} />
            </a>
          </div>
          <HeroPlayer />
          <p className="hero-description">
            Uma pausa para a alma. Louvores que acolhem e mensagens que renovam a sua fé, a qualquer
            hora do dia.
          </p>
          <div className="hero-footnote">
            <span className="signal-bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>{" "}
            Música, fé e companhia. Sempre com você.
          </div>
        </div>
        <NowPlayingCard />
      </div>
    </section>
  );
}
