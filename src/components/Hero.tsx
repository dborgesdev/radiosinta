import { Pause, Play, Smartphone, ArrowUpRight, LoaderCircle } from "lucide-react";
import { useRadio } from "@/hooks/useRadio";
import { NowPlayingCard } from "./NowPlayingCard";
import { useRadioConfig } from "@/hooks/useRadioConfig";

export function Hero() {
  const cfg = useRadioConfig();
  const { state, toggle } = useRadio();
  const Icon = state === "playing" ? Pause : state === "loading" ? LoaderCircle : Play;
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
          <p className="hero-description">
            Uma pausa para a alma. Louvores que acolhem e mensagens que renovam a sua fé, a qualquer
            hora do dia.
          </p>
          <div className="hero-actions">
            <button
              className="radio-primary"
              onClick={toggle}
              aria-label={state === "playing" ? "Pausar rádio" : "Ouvir rádio agora"}
            >
              <Icon size={19} className={state === "loading" ? "animate-spin" : ""} />
              {state === "playing"
                ? "Pausar rádio"
                : state === "loading"
                  ? "Conectando…"
                  : "Ouvir agora"}
            </button>
            <a
              className="radio-secondary"
              href="https://play.radiosinta.com.br/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Smartphone size={17} /> Instalar aplicativo <ArrowUpRight size={15} />
            </a>
          </div>
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
