import { useState, useRef, useEffect } from "react";
import ReactGA from "react-ga4";
import { motion } from "framer-motion";
import { Share2, Radio, ChevronUp, ChevronDown, Play, Pause, RefreshCw } from "lucide-react";
import { useRadioConfig } from "@/hooks/useRadioConfig";

export function StickyPlayer() {
  const cfg = useRadioConfig();
  const [expanded, setExpanded] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerMode, setPlayerMode] = useState<"native" | "backup">("native");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // URL fixa e estática extraída do arquivo de playlist M3U
  const NATIVE_STREAM_URL = "https://live9.livemus.com.br:28118/stream";

  // Reproduzir Audio Automaticamente na primeira interação do usuário (click ou touchstart)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!audioRef.current || isPlaying || playerMode === "backup") return;

      audioRef.current.src = NATIVE_STREAM_URL;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          document.removeEventListener("click", handleFirstInteraction);
          document.removeEventListener("touchstart", handleFirstInteraction);
        })
        .catch((err) => console.log("Autoplay ainda bloqueado pelo navegador:", err));
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [isPlaying, playerMode]);

  // 🔄 CONTROLE DE ECO: Isolamento cirúrgico dos barramentos de áudio ao alternar modos
  useEffect(() => {
    if (playerMode === "backup") {
      // 1. Mata instantaneamente o streaming nativo e libera a rede
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }
      setIsPlaying(false);
      setExpanded(true); // Garante que o backup abre expandido ao alternar
    } else {
      // 2. Ao voltar para o nativo, garante que o iframe de backup foi neutralizado e o player nativo inicia pausado
      setIsPlaying(false);
    }
  }, [playerMode]);

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

  const togglePlayPause = () => {
    if (playerMode === "backup") {
      const nextState = !isPlaying ? "play" : "pause";

      // 📊 EVENTO GA4 CONVERTIDO (Modo Contingência)
      ReactGA.event("player_interaction", {
        player_type: "backup_iframe",
        action_state: nextState,
        media_type: "Iframe RadiosNet",
      });

      setIsPlaying(!isPlaying);
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src"); // Mata o fluxo de rede e limpa o cache
      audioRef.current.load();
      setIsPlaying(false);

      // 📊 EVENTO GA4 CONVERTIDO (Pause Premium)
      ReactGA.event("player_interaction", {
        player_type: "premium_native",
        action_state: "pause",
        media_type: "Audio Nativo M3U",
      });
    } else {
      audioRef.current.src = NATIVE_STREAM_URL;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);

          // 📊 EVENTO GA4 CONVERTIDO (Play Premium - Sintaxe Nativa Segura)
          ReactGA.event("player_interaction", {
            player_type: "premium_native",
            action_state: "play",
            media_type: "Audio Nativo M3U",
          });
        })
        .catch((err) => console.error("Erro ao dar play:", err));
    }
  };

  const switchPlayerMode = () => {
    setPlayerMode((prev) => {
      const nextMode = prev === "native" ? "backup" : "native";

      // 📊 EVENTO GA4 CONVERTIDO (Alternância de Player)
      ReactGA.event("player_action", {
        action_name: "alternar_reprodutor",
        target_mode: nextMode,
      });

      return nextMode;
    });
  };

  return (
    <motion.div
      id="sticky-player"
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-4 left-1/2 z-50 w-[94%] max-w-3xl -translate-x-1/2"
    >
      {/* Tag de Áudio Nativo Oculta */}
      <audio ref={audioRef} preload="none" />

      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        style={{
          background: "rgba(6, 9, 19, 0.75)",
          backdropFilter: "blur(30px)",
        }}
      >
        {/* Ambient glow line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00D2FF] to-transparent opacity-70" />

        <div className="flex items-center justify-between gap-4 px-4 py-3">
          {/* Left Side: Controls & Identity */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Botão de Play/Pause Principal Customizado (Apenas no Modo Nativo) */}
            {playerMode === "native" && (
              <button
                onClick={togglePlayPause}
                className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-[#00D2FF] to-[#0047FF] text-white shadow-lg transition-all active:scale-95 cursor-pointer hover:opacity-90"
                aria-label={isPlaying ? "Pausar rádio" : "Tocar rádio"}
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7 fill-white" />
                ) : (
                  <Play className="h-7 w-7 fill-white ml-0.5" />
                )}
              </button>
            )}

            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10">
              <Radio
                className={`h-4 w-4 text-[#FF9100] ${isPlaying || playerMode === "backup" ? "animate-pulse" : ""}`}
              />
              {(isPlaying || playerMode === "backup") && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF3D8B] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF3D8B]" />
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-white/60 font-semibold">
                <span>Ao Vivo 24h</span>
              </div>
              <div className="truncate text-sm font-black text-white tracking-tight flex items-center gap-x-1">
                <div className="inline-flex font-black tracking-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)]">
                  <span className="bg-linear-to-b from-[#00D2FF] to-[#0047FF] bg-clip-text text-transparent pr-1">
                    Rádio
                  </span>
                  <span className="bg-linear-to-b from-[#FFD600] to-[#FF6B00] bg-clip-text text-transparent">
                    Sinta
                  </span>
                </div>
                <span className="text-white/60 font-normal italic ml-1 hidden sm:inline">
                  — Sinta a presença de Deus
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Actions & Mode Switch */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Botão de Alternância de Reprodutor */}
            {/* <button
              onClick={switchPlayerMode}
              title={
                playerMode === "native"
                  ? "Mudar para reprodutor alternativo"
                  : "Voltar para o reprodutor principal"
              }
              className="flex h-10 px-3 items-center gap-1.5 rounded-full border border-white/10 text-white/60 text-[11px] font-medium transition-all hover:border-white/20 hover:text-white hover:bg-white/5 active:scale-95 cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${playerMode === "backup" ? "text-amber-500 animate-spin-slow" : ""}`}
              />
              <span className="hidden md:inline">
                {playerMode === "native" ? "Alternar Reprodutor" : "Usar Player Principal"}
              </span>
            </button> */}

            {/* Botão de Compartilhar */}
            <button
              onClick={share}
              aria-label="Compartilhar Rádio"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition-all hover:border-white/30 hover:text-white hover:bg-white/5 active:scale-95 cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
            </button>

            {/* Botão Expandir/Recolher */}
            {playerMode === "backup" && (
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
            )}
          </div>
        </div>

        {/* Seção Dinâmica do Iframe de Backup (Garante a destruição real do elemento quando desativado) */}
        <motion.div
          animate={{ height: expanded && playerMode === "backup" ? 86 : 0 }}
          initial={{ height: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden border-t border-white/10 bg-black/40"
        >
          {playerMode === "backup" ? (
            <iframe
              src={cfg.iframeUrl}
              title="Rádio Sinta - Player de Contingência"
              className="h-32 w-full"
              allow="autoplay"
              loading="eager"
              style={{ border: 0 }}
            />
          ) : null}
        </motion.div>
      </div>
    </motion.div>
  );
}
