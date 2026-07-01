import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRadioConfig } from "@/hooks/useRadioConfig";
import { MagneticButton } from "@/components/ui/MagneticButton";
import logoAsset from "@/assets/logo-radio-sinta.webp";

export function Header() {
  const cfg = useRadioConfig();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 z-50 w-full backdrop-blur-2xl transition-colors duration-500 ${
        scrolled ? "bg-[#060913]/70" : "bg-[#060913]/30"
      }`}
      style={{
        borderBottom: scrolled
          ? "1px solid rgba(0, 210, 255, 0.35)"
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: scrolled ? "0 0 40px -20px rgba(0, 210, 255, 0.5)" : "none",
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-2 sm:px-8">
        <a href="#inicio" className="flex flex-1 items-center gap-3">
          <img
            src={logoAsset}
            alt="Rádio Sinta"
            className={`w-auto object-cocover drop-shadow-[0_0_20px_rgba(0,210,255,0.35)] transition-all duration-300 ${scrolled ? "h-16 sm:h-20" : "h-20 sm:h-24"}`}
            width={44}
            height={44}
          />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {cfg.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative text-sm lg:text-md font-medium text-white/70 transition-colors hover:text-white"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-linear-to-r from-[#00D2FF] to-[#FF9100] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex flex-1 justify-end">
          <MagneticButton href="#semeadores">
            <div className="border-gradient-brand relative overflow-hidden rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,145,0,0.6)]">
              <span className="relative z-10">Seja um Semeador</span>
              <span className="absolute inset-0 z-0 translate-y-full bg-linear-to-r from-[#00D2FF] via-[#FF3D8B] to-[#FF9100] transition-transform duration-500 hover:translate-y-0" />
            </div>
          </MagneticButton>
        </div>
      </div>
    </motion.header>
  );
}
