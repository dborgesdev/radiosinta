import { ArrowUpRight, Play } from "lucide-react";

export function ListenLink() {
  return (
    <a
      className="floating-listen"
      href="https://play.radiosinta.com.br/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ouvir agora na Hostplay (abre em nova aba)"
    >
      <Play size={15} fill="currentColor" aria-hidden="true" /> Ouvir agora{" "}
      <ArrowUpRight size={15} aria-hidden="true" />
    </a>
  );
}
