import { motion } from "framer-motion";
import { Play, Signal, Wifi } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useRadioConfig } from "@/hooks/useRadioConfig";

export function Sintonize() {
  const cfg = useRadioConfig();
  return (
    <section id="sintonize" className="relative overflow-hidden py-32">
      <div className="pointer-events-none absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-[#00D2FF]/10 blur-[130px]" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 sm:px-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#00D2FF]">
            <Wifi className="h-3.5 w-3.5" /> Streaming otimizado
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Leve a Sua <span className="text-gradient-brand">Paz para Onde Você For</span>
          </h2>
          <p className="mt-6 text-lg text-white/70">
            Sem complicações, sem downloads pesados e sem gastar a memória do seu aparelho. A Rádio Sinta é totalmente otimizada para o seu smartphone, tablet ou computador.
          </p>
          <p className="mt-4 text-white/60">
            Onde quer que você esteja — no trânsito, no escritório ou no seu momento de devoção secreta —, basta um clique para transformar o seu dispositivo em um canal direto de adoração. Salve nosso endereço nos seus favoritos e tenha um refúgio espiritual sempre ao alcance das suas mãos.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <MagneticButton href={cfg.iframeUrl}>
              <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#00D2FF] to-[#7B5CFF] px-6 py-3 text-sm font-semibold text-[#03111a] shadow-[0_10px_40px_-10px_rgba(0,210,255,0.6)]">
                <Play className="h-4 w-4 fill-current" /> Abrir Player Web
              </div>
            </MagneticButton>
            <MagneticButton href={cfg.whatsappLink}>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 hover:border-white/40">
                Compartilhar no WhatsApp
              </div>
            </MagneticButton>
          </div>
        </motion.div>

        {/* Smartphone parallax mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative mx-auto"
        >
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 -z-10 mx-auto h-full w-[70%] rounded-full bg-[#FF9100]/25 blur-[80px]"
          />
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto h-[560px] w-[280px] rounded-[46px] border border-white/15 bg-gradient-to-br from-[#101728] to-[#050810] p-3 shadow-[0_40px_100px_-20px_rgba(0,210,255,0.35)]"
          >
            <div className="absolute left-1/2 top-3 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
            <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[36px] bg-gradient-to-br from-[#0a0f1e] via-[#0a0a1a] to-[#1a0d1e]">
              <div className="flex items-center justify-between px-5 pt-8 text-[10px] text-white/60">
                <span>Rádio Sinta</span>
                <Signal className="h-3 w-3" />
              </div>

              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="relative mb-6">
                  <div className="pulse-ring absolute inset-0 rounded-full border border-[#00D2FF]/40" />
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#00D2FF] via-[#7B5CFF] to-[#FF3D8B] shadow-[0_10px_40px_-5px_rgba(0,210,255,0.6)]">
                    <Play className="ml-1 h-10 w-10 fill-white text-white" />
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-[#00D2FF]">Ao Vivo</div>
                <div className="mt-1 font-display text-lg font-bold text-white">
                  Conexão Viva
                </div>
                <div className="mt-1 text-[11px] text-white/50">Rádio Sinta · Gospel 24h</div>

                <div className="mt-8 flex items-end gap-1 h-8">
                  {[0.4, 0.7, 1, 0.6, 0.85, 0.5, 0.9, 0.55].map((h, i) => (
                    <span
                      key={i}
                      className="eq-bar w-1.5 rounded-full bg-gradient-to-t from-[#FF9100] to-[#00D2FF]"
                      style={{ height: `${h * 100}%`, animationDelay: `${i * 0.08}s` }}
                    />
                  ))}
                </div>
              </div>

              <div className="mx-5 mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-[10px] text-white/60">
                {cfg.domain}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
