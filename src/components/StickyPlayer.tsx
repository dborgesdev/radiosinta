import { useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, Share2, Volume2, Radio } from "lucide-react";
import { useRadioConfig } from "@/hooks/useRadioConfig";

export function StickyPlayer() {
  const cfg = useRadioConfig();
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [expanded, setExpanded] = useState(false);

  async function share() {
    const data = {
      title: cfg.name,
      text: cfg.slogan,
      url: `https://${cfg.domain}`,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(data.url);
    } catch {
      /* user cancelled */
    }
  }

  return (
    <motion.div
      id="sticky-player"
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-4 left-1/2 z-50 w-[94%] max-w-5xl -translate-x-1/2"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
        style={{
          background: "rgba(6,9,19,0.72)",
          backdropFilter: "blur(30px)",
        }}
      >
        {/* Ambient glow bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00D2FF] to-transparent opacity-60" />

        <div className="flex items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3">
          {/* Play/Pause */}
          <button
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pausar" : "Tocar"}
            className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] via-[#FF7A3D] to-[#FF3D3D] shadow-[0_10px_30px_-5px_rgba(255,122,61,0.7)] transition-transform hover:scale-105 active:scale-95"
          >
            {playing ? (
              <Pause className="h-5 w-5 fill-[#1a0a00] text-[#1a0a00]" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-[#1a0a00] text-[#1a0a00]" />
            )}
          </button>

          {/* Metadata + equalizer */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#FF9100]">
              <Radio className="h-3 w-3" />
              <span>Ao Vivo</span>
              <span className="hidden text-white/30 sm:inline">·</span>
              <span className="hidden text-white/50 sm:inline">{cfg.domain}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="truncate text-sm font-semibold text-white sm:text-base">
                {cfg.nowPlaying}
              </div>
              {playing && (
                <div className="flex h-4 items-end gap-0.5">
                  {[0.4, 0.9, 0.6, 1, 0.5].map((h, i) => (
                    <span
                      key={i}
                      className="eq-bar w-0.5 rounded-full bg-gradient-to-t from-[#FF9100] to-[#00D2FF]"
                      style={{ height: `${h * 100}%`, animationDelay: `${i * 0.09}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Volume */}
          <div className="hidden items-center gap-2 md:flex">
            <Volume2 className="h-4 w-4 text-white/50" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/15 accent-[#00D2FF]"
              aria-label="Volume"
            />
          </div>

          <button
            onClick={share}
            aria-label="Compartilhar"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-white/30 hover:text-white sm:flex"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => setExpanded((e) => !e)}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            {expanded ? "Fechar" : "Player"}
          </button>
        </div>

        {/* Native embed — mounted once, hidden vs visible */}
        <div
          className={`overflow-hidden border-t border-white/10 transition-[max-height] duration-500 ${
            expanded ? "max-h-40" : "max-h-0"
          }`}
        >
          <iframe
            src={cfg.iframeUrl}
            title="Rádio Sinta - Player ao Vivo"
            className="h-32 w-full"
            allow="autoplay"
            loading="lazy"
          />
        </div>
      </div>
    </motion.div>
  );
}
