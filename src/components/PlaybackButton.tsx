import { LoaderCircle, Pause, Play } from "lucide-react";
import { useRadio } from "@/hooks/useRadio";

export function PlaybackButton({
  className = "player-toggle",
  label = false,
}: {
  className?: string;
  label?: boolean;
}) {
  const { state, toggle } = useRadio();
  const loading = state === "loading";
  const playing = state === "playing";
  const Icon = loading ? LoaderCircle : playing ? Pause : Play;
  const text = loading ? "Conectando…" : playing ? "Pausar rádio" : "Ouvir ao vivo";
  return (
    <button
      className={className}
      onClick={toggle}
      aria-label={text}
      aria-pressed={playing}
      aria-busy={loading}
    >
      <Icon size={20} aria-hidden="true" className={loading ? "animate-spin" : ""} />
      {label && <span>{text}</span>}
    </button>
  );
}
