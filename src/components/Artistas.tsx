import { motion } from "framer-motion";
import { useRadioConfig } from "@/hooks/useRadioConfig";

export function Artistas() {
  const { artists } = useRadioConfig();
  const loop = [...artists, ...artists];

  return (
    <section className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-5xl px-6 text-center sm:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display text-4xl font-bold leading-tight sm:text-5xl"
        >
          As Vozes que <span className="text-gradient-brand">Conectam Você ao Altar</span>
        </motion.h2>
        <p className="mt-6 text-white/70">
          Sintonize-se com os ministérios e artistas que marcam gerações e lideram a adoração no Brasil. Na nossa programação musical contínua, você ouve os maiores sucessos de...
        </p>
      </div>

      <div className="relative mt-16">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#060913] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#060913] to-transparent" />

        <div className="overflow-hidden">
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
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="group relative flex h-64 w-56 shrink-0 flex-col items-center justify-end overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] transition-all duration-500 hover:border-[#FF9100]/50">
      {/* Ambient hover backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,61,139,0.35),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Monochrome silhouette (SVG stand-in — respects background-removal intent) */}
      <svg
        viewBox="0 0 100 130"
        className="absolute inset-x-0 top-4 mx-auto h-44 text-white/25 grayscale transition-all duration-500 group-hover:scale-110 group-hover:text-white group-hover:grayscale-0"
        fill="currentColor"
        aria-hidden
      >
        <circle cx="50" cy="34" r="18" />
        <path d="M14 130c0-22 16-38 36-38s36 16 36 38z" />
      </svg>

      <div className="pointer-events-none absolute left-4 top-4 font-display text-3xl font-black text-white/10">
        {initials}
      </div>

      <div className="relative z-10 w-full border-t border-white/10 bg-black/40 px-4 py-3 backdrop-blur">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#00D2FF]">Toca aqui</div>
        <div className="mt-0.5 font-display text-base font-semibold text-white">{name}</div>
      </div>
    </div>
  );
}
