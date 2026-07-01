import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Smartphone } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useRadioConfig } from "@/hooks/useRadioConfig";

type Slide = {
  tag: "h1" | "h2";
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaIcon: React.ReactNode;
  ctaHref: string;
};

export function Hero() {
  const cfg = useRadioConfig();

  const slides: Slide[] = [
    {
      tag: "h1",
      title: "Rádio Gospel Online que Toca o Coração e Alimenta a sua Fé",
      subtitle:
        "Pare por um instante. Respire profundamente. Em meio ao barulho do mundo cotidiano, encontre a frequência perfeita para acalmar a sua alma, restaurar as suas forças e se conectar com o alto.",
      ctaLabel: "Ouvir ao Vivo Agora",
      ctaIcon: <Play className="h-4 w-4 fill-current" />,
      ctaHref: "#sticky-player",
    },
    {
      tag: "h2",
      title: "Sinta a Presença de Deus em Cada Sintonia e Melodia",
      subtitle:
        "Uma seleção exclusiva de louvores selecionados a dedo para trazer paz ao seu ambiente, acompanhada de mensagens que edificam, transformam o seu dia e fortalecem o seu espírito.",
      ctaLabel: "Abrir Player Digital",
      ctaIcon: <Smartphone className="h-4 w-4" />,
      ctaHref: cfg.iframeUrl,
    },
  ];

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), 8500);
    return () => clearInterval(id);
  }, [slides.length]);

  const slide = slides[idx];

  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center overflow-hidden pt-24"
    >
      {/* Atmospheric celestial glow blobs */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-[#00D2FF] opacity-[0.18] blur-[140px]"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -50, 40, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-40 bottom-0 h-[560px] w-[560px] rounded-full bg-[#FF9100] opacity-[0.16] blur-[160px]"
      />
      <ParticleField />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-20 sm:px-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-white/70 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF3D8B] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF9100]" />
                </span>
                AO VIVO · 24H · Gospel Contínuo
              </div>

              {slide.tag === "h1" ? (
                <h1 className="font-display text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                  <span className="text-gradient-brand">{slide.title}</span>
                </h1>
              ) : (
                <h2 className="font-display text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                  <span className="text-gradient-brand">{slide.title}</span>
                </h2>
              )}

              <p className="mt-6 max-w-xl text-base text-white/70 sm:text-lg">
                {slide.subtitle}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <MagneticButton href={slide.ctaHref}>
                  <div className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#FFB347] via-[#FF9100] to-[#FF3D8B] px-7 py-4 text-sm font-semibold text-[#1a0a00] shadow-[0_10px_50px_-10px_rgba(255,145,0,0.7)] transition-transform duration-300 hover:scale-[1.03]">
                    {slide.ctaIcon}
                    {slide.ctaLabel}
                  </div>
                </MagneticButton>

                <div className="flex items-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      aria-label={`Ir para o slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === idx
                          ? "w-10 bg-[#00D2FF]"
                          : "w-4 bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Ambient play visual */}
        <div className="relative mx-auto flex h-[420px] w-full max-w-md items-center justify-center">
          <div className="pulse-ring absolute h-56 w-56 rounded-full border border-[#00D2FF]/40" />
          <div
            className="pulse-ring absolute h-56 w-56 rounded-full border border-[#FF9100]/40"
            style={{ animationDelay: "1s" }}
          />
          <motion.a
            href="#sticky-player"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD24C] via-[#FF9100] to-[#FF3D3D] shadow-[0_20px_80px_-10px_rgba(255,145,0,0.7)]"
          >
            <Play className="ml-2 h-14 w-14 fill-[#1a0a00] text-[#1a0a00]" />
            <span className="absolute -inset-1 rounded-full border border-white/20" />
          </motion.a>
        </div>
      </div>
    </section>
  );
}

/** Lightweight canvas of drifting particles — cheap, no deps. */
function ParticleField() {
  const dots = Array.from({ length: 40 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {dots.map((_, i) => {
        const size = Math.random() * 2 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const dur = 12 + Math.random() * 18;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              opacity: 0.35,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.15, 0.6, 0.15] }}
            transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}
