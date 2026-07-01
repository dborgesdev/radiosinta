import { useRef, useState, type ReactNode, type MouseEvent } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  glowColor?: string;
};

/**
 * GlassCard — frosted dark panel with a cursor-tracked light sheen.
 * Uses pointer events + CSS variables to keep re-renders zero-cost.
 */
export function GlassCard({
  children,
  className = "",
  glowColor = "rgba(0, 210, 255, 0.28)",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-500 hover:border-white/20 ${className}`}
      style={{
        backgroundImage: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, ${glowColor}, transparent 45%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.04] via-transparent to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
