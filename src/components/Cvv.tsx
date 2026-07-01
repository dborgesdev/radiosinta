import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function Cvv() {
  return (
    <section className="relative overflow-hidden py-28">
      {/* Dawn gradient psychological rest */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f7d9c4] via-[#f0b8c8] to-[#c7c4ec]" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(600px circle at 20% 30%, rgba(255,255,255,0.6), transparent 60%), radial-gradient(600px circle at 80% 70%, rgba(255,200,150,0.5), transparent 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center sm:px-10"
      >
        <div className="mx-auto mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/50 text-[#c44569] backdrop-blur">
          <Heart className="h-6 w-6" />
        </div>
        <h2 className="font-display text-4xl font-bold leading-tight text-[#2d1b3d] sm:text-5xl">
          Você Não Está Só. Como Vai Você?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[#3a2740]/85">
          Há momentos em que o peso dos dias parece insuportável e o silêncio ao redor se torna doloroso. Se o seu coração precisa de alento, de uma palavra amiga ou simplesmente de alguém para ouvir o seu desabafo com total sigilo e respeito, saiba que existe um caminho. O CVV (Centro de Valorização da Vida) oferece apoio emocional gratuito, humanizado e disponível 24 horas por dia.
        </p>
        <p className="mx-auto mt-8 max-w-xl font-display text-xl font-bold text-[#2d1b3d] sm:text-2xl">
          Ligue{" "}
          <a href="tel:188" className="underline decoration-[#c44569] decoration-2 underline-offset-4">
            188
          </a>{" "}
          ou acesse{" "}
          <a
            href="https://cvv.org.br"
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-[#c44569] decoration-2 underline-offset-4"
          >
            cvv.org.br
          </a>
          . Permita-se receber esse cuidado. Sua vida tem um valor incomensurável.
        </p>
      </motion.div>
    </section>
  );
}
