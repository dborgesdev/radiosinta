import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Sprout, QrCode } from "lucide-react";
import { useRadioConfig } from "@/hooks/useRadioConfig";
import qrCode from "@/assets/qrcode-pix.png";

export function Semeadores() {
  const cfg = useRadioConfig();
  const [copied, setCopied] = useState(false);

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(cfg.pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  }

  return (
    <section id="semeadores" className="relative py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 sm:px-10 lg:grid-cols-[1.05fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4B25A]/30 bg-[#D4B25A]/5 px-3 py-1 text-xs text-[#E6C572]">
            <Sprout className="h-3.5 w-3.5" /> Seja um Semeador
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Apoie a Voz que <span className="text-gradient-brand">Leva Paz aos Corações</span>
          </h2>
          <p className="mt-6 text-lg text-white/70">
            A Rádio Sinta é um projeto movido por amor, propósito e pela generosidade voluntária de
            pessoas como você. Cada segundo que permanecemos no ar, cada mensagem de salvação
            entregue e cada vida tocada é fruto direto dessa colheita coletiva.
          </p>
          <p className="mt-4 text-white/60">
            Ajude-nos a manter essa chama acesa e a expandir o alcance da palavra de Deus para
            milhares de novos lares.
          </p>
        </motion.div>

        {/* Premium Membership Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div
            className="relative overflow-hidden rounded-[28px] border p-8 shadow-[0_40px_120px_-30px_rgba(212,178,90,0.4)]"
            style={{
              borderColor: "rgba(212,178,90,0.35)",
              background: "linear-gradient(135deg, #0d0f1c 0%, #12131f 50%, #1a1418 100%)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(212,178,90,0.35), transparent 65%)",
              }}
            />

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#E6C572]">
                  Cartão do Semeador
                </div>
                <div className="mt-1 font-display text-2xl font-bold">Rádio Sinta</div>
              </div>
              <div className="rounded-full border border-[#D4B25A]/40 bg-[#D4B25A]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#E6C572]">
                Premium
              </div>
            </div>

            {/* Fake QR block */}
            <div className="mt-8 flex items-center justify-center">
              <div className="relative rounded-2xl border border-[#D4B25A]/30 bg-white p-3">
                <img
                  src={qrCode}
                  alt="QR Code para doação via PIX"
                  className="h-full w-full rounded-lg object-cover"
                />
                <div className="absolute -bottom-2 -right-2 rounded-full bg-[#0d0f1c] p-1.5">
                  <QrCode className="h-4 w-4 text-[#E6C572]" />
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3 text-sm">
              <div className="flex items-start justify-between border-t border-white/10 pt-3">
                <span className="text-white/50">Chave PIX</span>
                <span className="font-mono font-semibold text-white">{cfg.pixKey}</span>
              </div>
              <div className="flex items-start justify-between border-t border-white/10 pt-3">
                <span className="text-white/50">Favorecido</span>
                <span className="text-right text-white/90">{cfg.pixHolder}</span>
              </div>
            </div>

            <button
              onClick={copyPix}
              className={`mt-8 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all duration-500 ${
                copied
                  ? "bg-[#00D2FF] text-[#031018]"
                  : "bg-linear-to-r from-[#D4B25A] to-[#E6C572] text-[#1a1200] hover:shadow-[0_10px_40px_-10px_rgba(212,178,90,0.7)]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copiado com sucesso!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copiar Chave PIX
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FakeQR() {
  // Deterministic pseudo-QR (visual only — real chave PIX shown above)
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21;
    const y = Math.floor(i / 21);
    const isFinder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    if (isFinder) {
      const cx = x < 7 ? 3 : 17;
      const cy = y < 7 ? 3 : 17;
      const d = Math.max(Math.abs(x - cx), Math.abs(y - cy));
      return d === 0 || d === 2 || d === 3;
    }
    return (x * 31 + y * 17 + 7) % 3 === 0;
  });
  return (
    <div
      className="grid h-32 w-32 grid-cols-21 gap-0"
      style={{ gridTemplateColumns: "repeat(21,1fr)" }}
    >
      {cells.map((on, i) => (
        <div key={i} className={on ? "bg-[#0a0a0a]" : "bg-white"} />
      ))}
    </div>
  );
}
