import { Instagram, MessageCircle, Heart } from "lucide-react";
import { useRadioConfig } from "@/hooks/useRadioConfig";
import logoAsset from "@/assets/logo-radio-sinta.png.asset.json";

export function Footer() {
  const cfg = useRadioConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-[#04060f] pb-40 pt-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 sm:px-10 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={logoAsset.url}
              alt="Rádio Sinta"
              className="h-12 w-12 rounded-full drop-shadow-[0_0_20px_rgba(0,210,255,0.4)]"
              width={48}
              height={48}
            />
            <span className="font-display text-xl font-bold">{cfg.name}</span>
          </div>
          <p className="mt-5 max-w-md text-sm text-white/60">
            Rádio Sinta — A rádio online gospel focada em transmitir a presença de Deus e tocar o que acalma o seu coração.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={cfg.instagramLink}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram @radiosinta"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition-all hover:border-[#FF3D8B]/50 hover:text-[#FF3D8B]"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={cfg.whatsappLink}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Fale no WhatsApp"
              className="flex h-10 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-white/70 transition-all hover:border-[#25D366]/50 hover:text-[#25D366]"
            >
              <MessageCircle className="h-4 w-4" /> {cfg.phoneFormatted}
            </a>
          </div>
        </div>

        <div>
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#00D2FF]">
            Navegar
          </div>
          <ul className="space-y-3 text-sm text-white/70">
            {cfg.nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition-colors hover:text-white">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#00D2FF]">
            Apoie
          </div>
          <p className="mb-4 text-sm text-white/60">
            Ajude a manter a rádio no ar. Seja um semeador da paz.
          </p>
          <a
            href="#semeadores"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF9100] to-[#FF3D8B] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_10px_30px_-10px_rgba(255,61,139,0.6)]"
          >
            <Heart className="h-3.5 w-3.5 fill-current" /> Doar agora
          </a>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-7xl border-t border-white/5 px-6 pt-6 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-3 text-xs text-white/50 sm:flex-row sm:items-center">
          <div>
            © {year} {cfg.name}. Todos os direitos reservados. {cfg.slogan}
          </div>
          <a
            href={cfg.credits.url}
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-white/80"
          >
            {cfg.credits.text}
          </a>
        </div>
      </div>
    </footer>
  );
}
