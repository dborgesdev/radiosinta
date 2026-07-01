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
  bgImage: string;
};

export function Hero() {
  const cfg = useRadioConfig();

  const slides: Slide[] = [
    {
      tag: "h1",
      title: "Rádio Sinta. Sinta a Presença de Deus em Cada Melodia",
      subtitle:
        "Uma seleção exclusiva de louvores selecionados a dedo para trazer paz ao seu ambiente, acompanhada de mensagens que edificam, transformam o seu dia e fortalecem o seu espírito.",
      ctaLabel: "Ouça Agora",
      ctaIcon: <Play className="h-4 w-4 fill-current" />,
      ctaHref: "#sticky-player",
      bgImage: "/hero-worship.webp", // Caminho da imagem gerada pelo Prompt 1
    },
    {
      tag: "h2",
      title: "A Rádio Online que Toca o seu Coração e Alimenta a sua Fé",
      subtitle:
        "Pare por um instante. Respire profundamente. Em meio ao barulho do mundo cotidiano, encontre a frequência perfeita para acalmar a sua alma, restaurar as suas forças e se conectar com o alto.",
      ctaLabel: "Ouça Agora",
      ctaIcon: <Smartphone className="h-4 w-4" />,
      ctaHref: cfg.iframeUrl,
      bgImage: "/hero-peace.webp", // Caminho da imagem gerada pelo Prompt 2
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
      className="relative flex min-h-screen items-center overflow-hidden pt-24 bg-[#060913]"
    >
      {/* Dynamic Background Image Layers */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${slide.bgImage})`,
              backgroundPosition: "right center",
            }}
          />
        </AnimatePresence>

        {/* Strict Linear Vignette to protect text readability on the left */}
        <div className="absolute inset-0 bg-linear-to-r from-[#060913] via-[#060913]/80 to-transparent w-full lg:w-3/4" />
        <div className="absolute inset-0 bg-linear-to-t from-[#060913] via-transparent to-transparent bottom-0" />
      </div>

      {/* Atmospheric celestial glow blobs */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-40 top-20 h-130 w-130 rounded-full bg-[#00D2FF] opacity-[0.12] blur-[140px] z-10"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -30, 30, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-40 bottom-0 h-140 w-140 rounded-full bg-[#FF9100] opacity-[0.10] blur-[160px] z-10"
      />

      <ParticleField />

      <div className="relative z-20 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-20 sm:px-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF3D8B] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF9100]" />
            </span>
            AO VIVO · 24/7
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {slide.tag === "h1" ? (
                <h1 className="font-display text-4xl font-black sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.1]">
                  <span className="text-gradient-brand">{slide.title}</span>
                </h1>
              ) : (
                <h2 className="font-display text-4xl font-black sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.1]">
                  <span className="text-gradient-brand">{slide.title}</span>
                </h2>
              )}

              <p className="mt-6 max-w-xl text-base text-white/80 sm:text-lg leading-relaxed">
                {slide.subtitle}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                {/* <MagneticButton href={slide.ctaHref}>
                  <div className="group inline-flex items-center gap-3 rounded-full bg-linear-to-r from-[#FFB347] via-[#FF9100] to-[#FF3D8B] px-7 py-4 text-sm font-semibold text-black shadow-[0_10px_40px_-10px_rgba(255,145,0,0.5)] transition-transform duration-300 hover:scale-[1.02] cursor-pointer">
                    {slide.ctaIcon}
                    {slide.ctaLabel}
                  </div>
                </MagneticButton> */}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Ir para o slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === idx ? "w-10 bg-[#00D2FF]" : "w-4 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Ambient play visual aligning perfectly with image_266523.jpg */}
        <div className="hidden relative mx-auto lg:flex h-105 w-full max-w-md items-center justify-center lg:mt-0 mt-8">
          <div className="pulse-ring absolute h-64 w-64 rounded-full border border-[#00D2FF]/30 animate-pulse" />
          <div
            className="pulse-ring absolute h-64 w-64 rounded-full border border-[#FF9100]/20 animate-pulse"
            style={{ animationDelay: "1.5s" }}
          />
          {/* <motion.a
            href="#sticky-player"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD24C] via-[#FF9100] to-[#FF3D3D] shadow-[0_20px_60px_-10px_rgba(255,145,0,0.6)] z-20 group"
          >
            <Play className="ml-2 h-16 w-16 fill-black text-black transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute -inset-1 rounded-full border border-white/20 pointer-events-none" />
          </motion.a> */}
        </div>
      </div>
    </section>
  );
}

function ParticleField() {
  const dots = Array.from({ length: 30 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
      {dots.map((_, i) => {
        const size = Math.random() * 2 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const dur = 15 + Math.random() * 15;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white/40"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
            }}
            animate={{ y: [0, -40, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}
