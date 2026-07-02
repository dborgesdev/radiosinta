import { motion } from "framer-motion";
import { Music4, BookOpen, Sparkles, Radio, Instagram } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRadioConfig } from "@/hooks/useRadioConfig";

export function Essence() {
  const cfg = useRadioConfig();

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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-xs text-[#00D2FF]">
            <Sparkles className="h-3.5 w-3.5" /> A nossa essência
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Uma Atmosfera de <span className="text-gradient-brand">Louvor e Palavra</span> para Você
            Sentir a Presença de Deus
          </h2>
          <p className="mt-6 text-white/70">
            A Rádio Sinta foi desenhada para ser a trilha sonora da sua vida espiritual. Entregamos
            uma transmissão digital contínua que combina harmoniosamente vertentes para alimentar o
            seu espírito:
          </p>
        </motion.div>

        {/* Grid Ajustado Cirurgicamente para 3 Colunas no Desktop */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {/* Card 1: Música */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard
              glowColor="rgba(0, 210, 255, 0.28)"
              className="flex h-full min-h-70 flex-col justify-between"
            >
              <div>
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00D2FF]/15 text-[#00D2FF]">
                  <Music4 className="h-6 w-6" />
                </div>
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#00D2FF]">
                  <span className="h-1 w-1 rounded-full bg-[#00D2FF]" /> Curadoria musical
                </div>
                <h3 className="font-display text-2xl font-bold sm:text-3xl">Música que Edifica</h3>
                <p className="mt-4 text-white/70 text-sm sm:text-base">
                  Uma curadoria cirúrgica dos maiores louvores nacionais e internacionais,
                  selecionados para criar um ambiente de adoração genuína.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Card 2: Palavra */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <GlassCard
              glowColor="rgba(255, 145, 0, 0.25)"
              className="flex h-full min-h-70 flex-col justify-between"
            >
              <div>
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF9100]/15 text-[#FF9100]">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#00D2FF]">
                  <span className="h-1 w-1 rounded-full bg-[#00D2FF]" /> Palavra que restaura
                </div>
                <h3 className="font-display text-2xl font-bold sm:text-3xl">Mensagens de Paz</h3>
                <p className="mt-4 text-white/70 text-sm sm:text-base">
                  Pílulas de sabedoria, passagens bíblicas e reflexões profundas que surgem de forma
                  fluida entre as canções para acalmar o seu coração.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* NOVO Card 3: Redes Sociais / Instagram */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard
              glowColor="rgba(255, 61, 139, 0.25)"
              className="flex h-full min-h-70 flex-col justify-between"
            >
              <div>
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF3D8B]/15 text-[#FF3D8B]">
                  <Instagram className="h-6 w-6" />
                </div>
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#FF3D8B]">
                  <span className="h-1 w-1 rounded-full bg-[#FF3D8B]" /> Comunidade Digital
                </div>
                <h3 className="font-display text-2xl font-bold sm:text-3xl">Conexão Diária</h3>
                <p className="mt-4 text-white/70 text-sm sm:text-base">
                  Sinta a presença de Deus também no Instagram. Acompanhe nossos bastidores,
                  interaja e edifique seu feed seguindo a <strong>@radiosinta</strong>.
                </p>
              </div>

              {/* Botão com o Degradê Colorido Premium da Rádio */}
              <div className="mt-8">
                <a
                  href={cfg.instagramLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#00D2FF] via-[#7B5CFF] to-[#FF3D8B] px-5 py-3.5 text-xs font-bold text-white shadow-[0_10px_25px_rgba(123,92,255,0.25)] hover:scale-[1.02] active:scale-98 transition-all hover:shadow-[0_15px_35px_rgba(255,61,139,0.35)] cursor-pointer"
                >
                  <Instagram className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Siga a @radiosinta</span>
                </a>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Indicadores de Plataforma */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3 text-xs text-white/50">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
            <Radio className="h-3.5 w-3.5 text-[#00D2FF]" /> Transmissão contínua 24/7
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
            Otimizada para todos os dispositivos
          </span>
        </div>
      </div>
    </section>
  );
}
