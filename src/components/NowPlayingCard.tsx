import { Headphones } from "lucide-react";
import { useRadio } from "@/hooks/useRadio";
import { CoverArt } from "./CoverArt";

export function NowPlayingCard() {
  const { nowPlaying, metadataStale, metadataLoading } = useRadio();
  return (
    <div className="now-playing-card">
      <div className="now-card-heading">
        <span>
          <Headphones size={16} /> Tocando agora
        </span>
        <span className="live-badge">AO VIVO</span>
      </div>
      <div className="now-cover-wrap">
        <CoverArt
          key={nowPlaying?.cover}
          src={nowPlaying?.cover ?? nowPlaying?.coverXl ?? null}
          eager
        />
        <span className="cover-label">SINTA A MÚSICA. VIVA A FÉ.</span>
      </div>
      <div className="now-card-copy" key={`${nowPlaying?.title}-${nowPlaying?.artist}`}>
        <h2>{nowPlaying?.title ?? "Programação ao vivo"}</h2>
        <p>{nowPlaying?.artist || "Rádio Sinta"}</p>
      </div>
      <p className="metadata-note">
        {metadataStale
          ? "Atualização indisponível · última informação recebida"
          : metadataLoading
            ? "Sintonizando as informações da rádio…"
            : "Uma trilha sonora para estar mais perto de Deus."}
      </p>
    </div>
  );
}
