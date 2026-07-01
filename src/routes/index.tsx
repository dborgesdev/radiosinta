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

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
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
