import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Radio, ChevronUp, ChevronDown } from "lucide-react";
import { useRadioConfig } from "@/hooks/useRadioConfig";

export function StickyPlayer() {
  const cfg = useRadioConfig();
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
      className="fixed bottom-4 left-1/2 z-50 w-[94%] max-w-3xl -translate-x-1/2"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        style={{
          background: "rgba(6, 9, 19, 0.75)",
          backdropFilter: "blur(30px)",
        }}
      >
        {/* Ambient glow line matching the site aesthetics */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00D2FF] to-transparent opacity-70" />

        <div className="flex items-center justify-between gap-4 px-4 py-3">
          {/* Left Side: Live Indicator & Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10">
              <Radio className="h-4 w-4 text-[#FF9100] animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF3D8B] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF3D8B]" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-[#00D2FF] font-semibold">
                <span>AO VIVO 24H</span>
              </div>
              <div className="truncate text-sm font-bold text-white tracking-tight">
                {cfg.name || "Rádio Sinta"} —{" "}
                <span className="text-white/60 font-normal italic">Sinta a presença de Deus</span>
              </div>
            </div>
          </div>

          {/* Right Side: Shared Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={share}
              aria-label="Compartilhar Rádio"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition-all hover:border-white/30 hover:text-white hover:bg-white/5 active:scale-95"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-2 rounded-full bg-linear-to-r from-[#FFB347] to-[#FF9100] px-5 h-10 text-xs font-bold text-black shadow-[0_4px_20px_rgba(255,145,0,0.3)] transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <span>{expanded ? "Ocultar Player" : "Abrir Player"}</span>
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Safe Mount Section for External Iframe */}
        <motion.div
          animate={{ height: expanded ? 86 : 0 }}
          initial={{ height: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden border-t border-white/10 bg-black/40"
        >
          <iframe
            src={cfg.iframeUrl}
            title="Rádio Sinta - Player ao Vivo"
            className="h-32 w-full"
            allow="autoplay"
            loading="eager" // Alterado para eager para forçar o carregamento imediato em background
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
