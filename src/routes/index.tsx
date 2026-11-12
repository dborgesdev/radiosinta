import { useEffect } from "react";
import ReactGA from "react-ga4";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Essence } from "@/components/Essence";
import { RadioHistory } from "@/components/RadioHistory";
import { DailyVerse } from "@/components/DailyVerse";
import { NewsSection } from "@/components/NewsSection";
import { saoPauloDay } from "@/lib/dailyVerse";
import { Sintonize } from "@/components/Sintonize";
import { Cvv } from "@/components/Cvv";
import { Semeadores } from "@/components/Semeadores";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  loader: () => ({ verseDay: saoPauloDay() }),
  staleTime: 0,
  component: Index,
});

function Index() {
  const { verseDay } = Route.useLoaderData();
  useEffect(() => {
    if (!ReactGA.isInitialized) ReactGA.initialize("G-Z78HCJ5RY4");
    // Dispara o pageview cirurgicamente quando a rota de fato monta na tela
    ReactGA.send({
      hitType: "pageview",
      page: window.location.pathname + window.location.search,
      title: "Home - Rádio Sinta",
    });
  }, []); // Array de dependências vazio garante execução única por montagem

  return (
    <div className="radio-page grain-overlay relative min-h-screen bg-[#060913] text-white">
      <Header />
      <main>
        <Hero />
        <RadioHistory />
        <DailyVerse initialDay={verseDay} />
        <NewsSection />
        <Essence />
        <Sintonize />
        <Cvv />
        <Semeadores />
      </main>
      <Footer />
    </div>
  );
}
