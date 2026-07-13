import { motion } from "framer-motion";
import { useRadioConfig } from "@/hooks/useRadioConfig";

export function Artistas() {
  const { artists } = useRadioConfig();
  const loop = [...artists, ...artists];

  return (
    <section className="relative overflow-hidden py-32 bg-[#060913]">
      {/* Imagem de Fundo Temática - O Palco Acesco */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-top bg-no-repeat opacity-50"
          style={{
            backgroundImage: "url('/bg-studio.webp')",
          }}
        />

        {/* Holofote de Luz Centralizado para "acender" a seção */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-100 bg-[radial-gradient(circle_at_top,rgba(255,145,0,0.18),transparent_65%)] pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center sm:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display text-4xl font-black leading-tight sm:text-5xl text-white tracking-tight drop-shadow-md"
        >
          As Vozes que <span className="text-gradient-brand shadow-sm">Conectam Você ao Altar</span>
        </motion.h2>
        <p className="mt-6 text-white/80 max-w-3xl mx-auto text-base sm:text-lg font-medium leading-relaxed drop-shadow-sm">
          Sintonize-se com os ministérios e artistas que marcam gerações e lideram a adoração no
          Brasil. Na nossa programação musical contínua, você ouve os maiores sucessos de...
        </p>
      </div>

      {/* Seção do Carrossel com Laterais Suavizadas */}
      <div className="relative mt-20 z-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-40 bg-linear-to-r from-[#060913] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-40 bg-linear-to-l from-[#060913] to-transparent" />

        <div className="overflow-hidden py-4">
          <div className="marquee-track flex w-max gap-6">
            {loop.map((name, i) => (
              <ArtistCard key={`${name}-${i}`} name={name} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArtistCard({ name }: { name: string }) {
  const initials = name;
  // .split(" ")
  // .map((n) => n[0])
  // .slice(0, 2)
  // .join("");

  // Helper cirúrgico para formatar o nome do arquivo de imagem eliminando acentos e espaços
  const imageFileName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");

  const imagePath = `/artistas/${imageFileName}.webp`;

  return (
    <div className="group relative flex h-64 w-56 shrink-0 flex-col items-center justify-end overflow-hidden rounded-3xl border border-white/10 bg-[#0c101f]/60 backdrop-blur-md transition-all duration-500 hover:border-[#FF9100]/60 hover:scale-[1.03] hover:shadow-[0_15px_40px_-10px_rgba(255,145,0,0.25)]">
      {/* Efeito Neon interno no Hover */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,210,255,0.2),transparent_50%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(255,61,139,0.15),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Container e Imagem do Artista em PNG Transparente */}
      <div className="absolute inset-x-0 top-2 bottom-14 flex items-end justify-center overflow-hidden pointer-events-none">
        <img
          src={imagePath}
          alt={name}
          className="h-[92%] w-auto object-contain transition-all duration-500 filter grayscale-0 brightness-90 group-hover:grayscale-0 group-hover:brightness-110 group-hover:scale-105 drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_12px_25px_rgba(0,210,255,0.2)]"
          loading="lazy"
          onError={(e) => {
            // Fallback caso falte alguma foto no diretório do cliente
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Iniciais estilizadas de fundo */}
      <div className="pointer-events-none absolute left-5 top-4 font-display text-3xl font-black text-white/5 transition-colors duration-500 group-hover:text-white/10">
        {initials}
      </div>

      {/* Rodapé do Card com desfoque de vidro premium */}
      <div className="relative z-10 w-full border-t border-white/10 bg-black/50 px-4 py-3.5 backdrop-blur-sm transition-colors duration-500 group-hover:bg-black/70">
        <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#00D2FF] transition-colors duration-500 group-hover:text-[#FF9100]">
          Toca aqui
        </div>
        <div className="mt-0.5 font-display text-base font-bold text-white tracking-tight">
          {name}
        </div>
      </div>
    </div>
  );
}
