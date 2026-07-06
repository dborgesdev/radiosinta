import { useEffect } from "react";
import ReactGA from "react-ga4";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Essence } from "@/components/Essence";
import { Artistas } from "@/components/Artistas";
import { Sintonize } from "@/components/Sintonize";
import { Cvv } from "@/components/Cvv";
import { Semeadores } from "@/components/Semeadores";
import { StickyPlayer } from "@/components/StickyPlayer";
import { Footer } from "@/components/Footer";

// Inicialização segura no escopo global (roda apenas uma vez no carregamento do app)
ReactGA.initialize("G-Z78HCJ5RY4");

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  useEffect(() => {
    // Dispara o pageview cirurgicamente quando a rota de fato monta na tela
    ReactGA.send({
      hitType: "pageview",
      page: window.location.pathname + window.location.search,
      title: "Home - Rádio Sinta",
    });
  }, []); // Array de dependências vazio garante execução única por montagem

  return (
    <div className="grain-overlay relative min-h-screen bg-[#060913] text-white">
      <Header />
      <main>
        <Hero />
        <Essence />
        <Artistas />
        <Sintonize />
        <Cvv />
        <Semeadores />
      </main>
      <Footer />
      <StickyPlayer />
    </div>
  );
}
