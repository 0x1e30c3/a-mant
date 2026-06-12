"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Design tokens ────────────────────────────────────────────────────────────
export const T = {
  bracket: "rgba(194,138,30,0.4)",
  rail: "rgba(194,138,30,0.14)",
  sep: "rgba(194,138,30,0.14)",
  innerBorder: "rgba(20,20,30,0.06)",
  cardBg: "rgba(194,138,30,0.035)",
  accent: "hsl(var(--accent))",
};

// ─── Container — centers content with a max width + responsive gutters ─────────
//   This is the fix for "sections sprawling edge-to-edge" — every section now
//   lives inside one consistent, centered column instead of full-bleed.
export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12", className)}>
      {children}
    </div>
  );
}

// ─── SectionBlock — signature section wrapper (rails + corner brackets) ────────
//   Left/right rail lines + 4 corner brackets + top/bottom separator lines.
//   Sits inside <Container>, so the rails frame the centered column.
export function SectionBlock({
  children,
  className,
  innerClass,
  full,
}: {
  children: React.ReactNode;
  className?: string;
  innerClass?: string;
  /** Make the section fill the viewport height + register it as a snap target. */
  full?: boolean;
}) {
  const bs = (pos: "tl" | "tr" | "bl" | "br"): React.CSSProperties => ({
    position: "absolute",
    zIndex: 10,
    width: 18,
    height: 18,
    ...(pos === "tl" && {
      top: -1,
      left: -1,
      borderTop: `1.5px solid ${T.bracket}`,
      borderLeft: `1.5px solid ${T.bracket}`,
    }),
    ...(pos === "tr" && {
      top: -1,
      right: -1,
      borderTop: `1.5px solid ${T.bracket}`,
      borderRight: `1.5px solid ${T.bracket}`,
    }),
    ...(pos === "bl" && {
      bottom: -1,
      left: -1,
      borderBottom: `1.5px solid ${T.bracket}`,
      borderLeft: `1.5px solid ${T.bracket}`,
    }),
    ...(pos === "br" && {
      bottom: -1,
      right: -1,
      borderBottom: `1.5px solid ${T.bracket}`,
      borderRight: `1.5px solid ${T.bracket}`,
    }),
  });

  return (
    <div
      className={cn("relative", full && "min-h-[100svh] flex flex-col", className)}
      {...(full ? { "data-snap": "" } : {})}
    >
      {/* Rail lines */}
      <div className="absolute left-0 top-0 bottom-0 w-px pointer-events-none" style={{ background: T.rail }} />
      <div className="absolute right-0 top-0 bottom-0 w-px pointer-events-none" style={{ background: T.rail }} />
      {/* Sep lines */}
      <div className="absolute top-0 inset-x-0 h-px pointer-events-none" style={{ background: T.sep }} />
      <div className="absolute bottom-0 inset-x-0 h-px pointer-events-none" style={{ background: T.sep }} />
      {/* Brackets */}
      <div style={bs("tl")} />
      <div style={bs("tr")} />
      <div style={bs("bl")} />
      <div style={bs("br")} />
      {/* Inner content — vertically centered when full-height */}
      <div
        className={cn(full && "flex-1 flex flex-col justify-center", innerClass)}
        style={{ borderTop: `1px solid ${T.innerBorder}` }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── SectionHeading — shared eyebrow + title + optional intro ──────────────────
export function SectionHeading({
  eyebrow,
  title,
  intro,
  live,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  live?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <div className="flex items-center gap-2 mb-4">
        {live && <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />}
        <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(20,20,30,0.4)" }}>
          {eyebrow}
        </p>
      </div>
      <h2 className="text-[1.9rem] sm:text-[2.4rem] font-light leading-[1.12] tracking-tight text-foreground">
        {title}
      </h2>
      {intro && (
        <p className="mt-4 text-[13.5px] sm:text-[15px] text-muted-foreground leading-relaxed max-w-[460px]">
          {intro}
        </p>
      )}
    </div>
  );
}

// ─── Shimmer CTA ─────────────────────────────────────────────────────────────
export function ShimmerButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative overflow-hidden flex items-center justify-center gap-2 py-4 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98]",
        className
      )}
      style={{ background: T.accent, color: "hsl(var(--accent-foreground))" }}
    >
      <motion.span
        animate={{ x: ["-120%", "220%"] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", repeatDelay: 1.2 }}
        className="absolute inset-y-0 w-1/2 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)",
          transform: "skewX(-15deg)",
        }}
      />
      {children}
    </Link>
  );
}

// ─── GhostButton — secondary outline action ───────────────────────────────────
export function GhostButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-center py-4 rounded-xl text-[13px] text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
      style={{ border: "1px solid rgba(20,20,30,0.12)" }}
    >
      {children}
    </Link>
  );
}

// ─── Sparkle (decorative star) ─────────────────────────────────────────────────
export function Sparkle({ size = 32, opacity = 0.6 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ opacity }}>
      <path
        d="M20 2L22 18L38 20L22 22L20 38L18 22L2 20L18 18L20 2Z"
        fill="hsl(var(--accent))"
        fillOpacity="0.9"
      />
      <circle cx="20" cy="20" r="3" fill="hsl(var(--accent))" />
    </svg>
  );
}

// ─── Reveal — fade/slide-in on scroll (shared motion wrapper) ──────────────────
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
