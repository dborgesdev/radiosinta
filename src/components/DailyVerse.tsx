import { useEffect, useState } from "react";
import { BookOpen, Share2 } from "lucide-react";
import { saoPauloDay, verseForDay } from "@/lib/dailyVerse";
import { shareOrCopy } from "@/lib/share";

export function DailyVerse({ initialDay }: { initialDay: string }) {
  const [day, setDay] = useState(initialDay);
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    const update = () => {
      if (document.visibilityState === "visible") setDay(saoPauloDay());
    };
    update();
    // Local check, not an external request; covers suspended tabs and midnight.
    const timer = setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  const verse = verseForDay(day);
  async function share() {
    const result = await shareOrCopy({
      title: "Uma Palavra para o Seu Dia",
      text: `“${verse.text}” — ${verse.reference}\nBíblia Livre · Diego Santos, Mario Sérgio e Marco Teles · CC BY 3.0 BR\nhttps://github.com/blivre/BibliaLivre\nRádio Sinta`,
    });
    setFeedback(
      result === "copied"
        ? "Mensagem copiada!"
        : result === "failed"
          ? "Não foi possível compartilhar. Tente copiar o texto."
          : "",
    );
  }
  return (
    <section className="daily-verse radio-container" id="palavra" aria-labelledby="verse-title">
      <div className="verse-panel">
        <div className="verse-intro">
          <span className="verse-icon">
            <BookOpen size={24} />
          </span>
          <p className="radio-eyebrow">FÉ PARA RECOMEÇAR</p>
          <h2 id="verse-title">
            Uma Palavra
            <br /> para o Seu Dia
          </h2>
        </div>
        <div className="verse-content">
          <span className="verse-quote" aria-hidden="true">
            “
          </span>
          <blockquote key={day}>
            <p>{verse.text}</p>
            <footer>{verse.reference}</footer>
          </blockquote>
          <div className="verse-bottom">
            <button className="radio-secondary" onClick={share}>
              <Share2 size={15} /> Compartilhar palavra
            </button>
          </div>
          <span className="verse-feedback" role="status">
            {feedback}
          </span>
        </div>
      </div>
    </section>
  );
}
