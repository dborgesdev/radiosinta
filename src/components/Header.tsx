import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useRadioConfig } from "@/hooks/useRadioConfig";
import { PlaybackButton } from "./PlaybackButton";
import { NewsTicker } from "./NewsTicker";
import logoAsset from "@/assets/logo-radio-sinta.webp";

export function Header() {
  const cfg = useRadioConfig();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <NewsTicker />
      <div className="radio-container header-main">
        <a href="#inicio" className="header-logo" aria-label="Rádio Sinta — início">
          <img src={logoAsset} alt="Rádio Sinta" width={80} height={80} />
        </a>
        <nav className="header-nav" aria-label="Navegação principal">
          {cfg.nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-donate" href="#doadores">
            Seja um Doador
          </a>
          <PlaybackButton className="header-play" label />
          <button
            className="header-menu"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      <nav
        id="mobile-navigation"
        className="mobile-navigation"
        aria-label="Navegação mobile"
        hidden={!menuOpen}
        onKeyDown={(event) => {
          if (event.key === "Escape") setMenuOpen(false);
        }}
      >
        {cfg.nav.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
        <a href="#doadores" onClick={() => setMenuOpen(false)}>
          Seja um Doador
        </a>
      </nav>
    </header>
  );
}
