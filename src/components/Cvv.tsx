import { motion } from "framer-motion";
import { Heart, Phone, ExternalLink } from "lucide-react";

export function Cvv() {
  return (
    <section className="relative overflow-hidden py-32 bg-[#f4f9fc] border-y border-slate-200/80">
      {/* Efeitos Cirúrgicos de Sombreamento e Iluminação de Fundo (Integração CVV + Rádio) */}
      <div
        className="absolute inset-0 opacity-80 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 12% 20%, rgba(0, 210, 255, 0.18) 0%, transparent 55%),
            radial-gradient(circle at 88% 82%, rgba(123, 92, 255, 0.08) 0%, transparent 50%)
          `,
        }}
      />
      {/* Sombra de Vinheta sutil nas bordas para delimitar a seção claro-premium */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-200/30 via-transparent to-slate-200/30 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
          {/* Coluna da Esquerda: Container da Imagem com Sombreamento Avançado */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 relative group"
          >
            {/* Sombra Projetada Suave com matiz azulado (Soft Drop Shadow) */}
            <div className="absolute inset-4 bg-[#00D2FF]/10 rounded-3xl blur-3xl opacity-80 group-hover:opacity-100 transition-all duration-700 -z-10 group-hover:scale-105" />

            <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl border border-white bg-white p-2 shadow-[0_30px_70px_-15px_rgba(0,168,204,0.12)] transition-all duration-500 group-hover:shadow-[0_45px_90px_-15px_rgba(0,168,204,0.18)]">
              <img
                src="/bg-cvv.webp" // Substitua pelo arquivo gerado pelo novo prompt
                alt="Apoio Emocional Ilustrativo"
                className="h-full w-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-[1.01]"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Coluna da Direita: Conteúdo Textual Otimizado (Escala de Azuis e Cinzas Profundos) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            {/* Badge de Destaque Acolhedor com Azul CVV */}
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white border border-cyan-100 text-[#00A8CC] shadow-xs mb-6">
              <Heart className="h-5 w-5 fill-current" />
            </div>

            <h2 className="font-display text-4xl font-black leading-tight sm:text-5xl text-slate-900 tracking-tight">
              Você Não Está Só. <br />
              <span className="bg-linear-to-r from-[#007A99] via-[#00A8CC] to-[#7B5CFF] bg-clip-text text-transparent">
                Como Vai Você?
              </span>
            </h2>

            <div className="mt-6 space-y-4 text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              <p>
                Há momentos em que o peso dos dias parece insuportável e o silêncio ao redor se
                torna doloroso. Se o seu coração precisa de alento, de uma palavra amiga ou
                simplesmente de alguém para ouvir o seu desabafo com total sigilo e respeito, saiba
                que existe um caminho seguro.
              </p>
              <p className="text-sm sm:text-base text-slate-500 border-l-2 border-cyan-400 pl-4 italic">
                O CVV (Centro de Valorização da Vida) oferece apoio emocional gratuito, humanizado e
                totalmente confidencial, disponível 24 horas por dia.
              </p>
            </div>

            {/* Bloco de Ações Estilizado Integrando o DNA da Rádio */}
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="tel:188"
                className="inline-flex items-center gap-3 rounded-full bg-linear-to-r from-[#00D2FF] to-[#7B5CFF] px-8 py-4 text-base font-bold text-white shadow-[0_15px_35px_rgba(0,210,255,0.25)] hover:scale-[1.02] active:scale-98 transition-all hover:shadow-[0_20px_45px_rgba(123,92,255,0.35)]"
              >
                <Phone className="h-5 w-5 fill-current text-[#03111a]" />
                <span className="text-[#03111a]">Ligar Grátis: 188</span>
              </a>

              <a
                href="https://cvv.org.br/chat"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-700 shadow-xs hover:border-cyan-200 hover:bg-slate-50 hover:text-cyan-700 transition-all"
              >
                <span>Acessar Chat Online</span>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </a>
            </div>

            <p className="mt-6 text-xs text-slate-400 font-medium">
              * A ligação é 100% gratuita a partir de qualquer telefone fixo ou celular no Brasil.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
