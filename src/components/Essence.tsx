import { motion } from "framer-motion";
import { Music4, BookOpen, Sparkles, Radio } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function Essence() {
  return (
    <section id="essencia" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#00D2FF]">
            <Sparkles className="h-3.5 w-3.5" /> A nossa essência
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Uma Atmosfera de{" "}
            <span className="text-gradient-brand">Louvor e Palavra</span>: Sem Interrupções
          </h2>
          <p className="mt-6 text-white/70">
            Esqueça o barulho, os comerciais excessivos e as conversas paralelas. A Rádio Sinta foi desenhada para ser a trilha sonora da sua vida espiritual. Entregamos uma transmissão digital contínua que combina harmoniosamente duas vertentes para alimentar o seu espírito:
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard glowColor="rgba(0, 210, 255, 0.28)" className="h-full min-h-[280px]">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00D2FF]/15 text-[#00D2FF]">
                <Music4 className="h-6 w-6" />
              </div>
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#00D2FF]">
                <span className="h-1 w-1 rounded-full bg-[#00D2FF]" /> Curadoria musical
              </div>
              <h3 className="font-display text-2xl font-bold sm:text-3xl">Música que Edifica</h3>
              <p className="mt-4 text-white/70">
                Uma curadoria cirúrgica dos maiores louvores nacionais e internacionais, selecionados para criar um ambiente de adoração genuína na sua casa, trabalho ou veículo.
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <GlassCard glowColor="rgba(255, 145, 0, 0.25)" className="h-full min-h-[280px]">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF9100]/15 text-[#FF9100]">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#00D2FF]">
                <span className="h-1 w-1 rounded-full bg-[#00D2FF]" /> Palavra que restaura
              </div>
              <h3 className="font-display text-2xl font-bold sm:text-3xl">Mensagens de Paz</h3>
              <p className="mt-4 text-white/70">
                Pílulas de sabedoria, passagens bíblicas e reflexões profundas que surgem de forma fluida entre as canções, funcionando como um bálsamo para acalmar o seu coração nos momentos em que você mais precisa.
              </p>
            </GlassCard>
          </motion.div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-white/50">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
            <Radio className="h-3.5 w-3.5 text-[#00D2FF]" /> Transmissão contínua 24/7
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
            Sem comerciais invasivos
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
            Otimizada para qualquer dispositivo
          </span>
        </div>
      </div>
    </section>
  );
}
