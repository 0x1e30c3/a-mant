"use client";

import { cn } from "@/lib/utils";

// ─── Shared app design tokens (aligned with the landing design language) ──────
export const A = {
  accent: "hsl(var(--accent))",
  bracket: "rgba(255,239,197,0.28)",
  cardBg: "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.016) 100%)",
  cardBorder: "rgba(255,255,255,0.08)",
  subtle: "rgba(255,255,255,0.022)",
  hairline: "rgba(255,255,255,0.06)",
};

// ─── Page atmosphere — fixed grid + amber glow behind everything ──────────────
export function AppBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" style={{ background: "#080810" }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,239,197,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,239,197,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, black 0%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, black 0%, transparent 80%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[420px]"
        style={{ background: "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,239,197,0.07) 0%, transparent 70%)" }}
      />
    </div>
  );
}

// ─── Corner brackets (decorative) ─────────────────────────────────────────────
export function Brackets({ all = false }: { all?: boolean }) {
  const c = A.bracket;
  return (
    <>
      <span className="absolute top-0 left-0 w-3 h-3 pointer-events-none" style={{ borderTop: `1.5px solid ${c}`, borderLeft: `1.5px solid ${c}` }} />
      <span className="absolute bottom-0 right-0 w-3 h-3 pointer-events-none" style={{ borderBottom: `1.5px solid ${c}`, borderRight: `1.5px solid ${c}` }} />
      {all && (
        <>
          <span className="absolute top-0 right-0 w-3 h-3 pointer-events-none" style={{ borderTop: `1.5px solid ${c}`, borderRight: `1.5px solid ${c}` }} />
          <span className="absolute bottom-0 left-0 w-3 h-3 pointer-events-none" style={{ borderBottom: `1.5px solid ${c}`, borderLeft: `1.5px solid ${c}` }} />
        </>
      )}
    </>
  );
}

// ─── Glass card — the standard surface across the app ─────────────────────────
export function GlassCard({
  children,
  className,
  brackets,
  glow,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  brackets?: boolean | "all";
  glow?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("relative rounded-2xl overflow-hidden", className)}
      style={{
        background: A.cardBg,
        border: `1px solid ${A.cardBorder}`,
        ...(glow ? { boxShadow: "0 0 60px rgba(255,239,197,0.06)" } : {}),
        ...style,
      }}
    >
      {brackets && <Brackets all={brackets === "all"} />}
      {children}
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────
type Tone = "positive" | "warning" | "accent" | "neutral";
const TONES: Record<Tone, { color: string; bg: string; border: string }> = {
  positive: { color: "hsl(var(--positive))", bg: "rgba(64,200,120,0.08)", border: "rgba(64,200,120,0.22)" },
  warning: { color: "hsl(var(--warning))", bg: "rgba(250,140,50,0.08)", border: "rgba(250,140,50,0.22)" },
  accent: { color: "hsl(var(--accent))", bg: "rgba(255,239,197,0.08)", border: "rgba(255,239,197,0.2)" },
  neutral: { color: "rgba(255,255,255,0.55)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)" },
};

export function Pill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full", className)}
      style={{ color: t.color, background: t.bg, border: `1px solid ${t.border}` }}
    >
      {children}
    </span>
  );
}

// ─── Section label — uppercase eyebrow ────────────────────────────────────────
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[10px] uppercase tracking-[0.18em]", className)} style={{ color: "rgba(255,255,255,0.3)" }}>
      {children}
    </p>
  );
}

// ─── Live dot ─────────────────────────────────────────────────────────────────
export function LiveDot({ className }: { className?: string }) {
  return <span className={cn("w-1.5 h-1.5 rounded-full bg-positive animate-pulse", className)} />;
}
