"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bracket: "rgba(255,239,197,0.28)",
  rail: "rgba(255,239,197,0.07)",
  sep: "rgba(255,239,197,0.07)",
  innerBorder: "rgba(255,255,255,0.05)",
  cardBg: "rgba(255,255,255,0.022)",
  accent: "hsl(var(--accent))",
};

// ─── SectionBlock — iNMerge's signature section wrapper (adapted dark) ────────
//   Left/right rail lines + 4 corner brackets + top/bottom separator lines
function SectionBlock({
  children,
  className,
  innerClass,
}: {
  children: React.ReactNode;
  className?: string;
  innerClass?: string;
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
    <div className={cn("relative px-3 py-0", className)}>
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
      {/* Inner content */}
      <div className={cn(innerClass)} style={{ borderTop: `1px solid ${T.innerBorder}` }}>
        {children}
      </div>
    </div>
  );
}

// ─── Shimmer CTA ─────────────────────────────────────────────────────────────
function ShimmerButton({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn("relative overflow-hidden flex items-center justify-center gap-2 py-4 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98]", className)}
      style={{ background: T.accent, color: "hsl(var(--background))" }}
    >
      <motion.span
        animate={{ x: ["-120%", "220%"] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", repeatDelay: 1.2 }}
        className="absolute inset-y-0 w-1/2 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)", transform: "skewX(-15deg)" }}
      />
      {children}
    </Link>
  );
}

// ─── Sparkle star (iNMerge decorative element) ────────────────────────────────
function Sparkle({ size = 32, opacity = 0.6 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ opacity }}>
      <path d="M20 2L22 18L38 20L22 22L20 38L18 22L2 20L18 18L20 2Z" fill="hsl(var(--accent))" fillOpacity="0.9" />
      <circle cx="20" cy="20" r="3" fill="hsl(var(--accent))" />
    </svg>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="text-foreground overflow-x-hidden min-h-screen" style={{ background: "#080810" }}>
      <Navbar />
      {/* pt-[4.5rem] = below fixed navbar height */}
      <div className="pt-[4.5rem]">
        <Hero />
        <Marquee />
        <Stats />
        <HowItWorks />
        <Pillars />
        <SignalFeed />
        <TechStack />
        <FooterCTA />
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <div className="fixed top-0 inset-x-0 z-50 px-3 pt-3">
      <nav
        className="flex items-center justify-between px-4 h-12 rounded-xl"
        style={{ background: "rgba(8,8,16,0.92)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(255,239,197,0.1)", border: "1px solid rgba(255,239,197,0.3)" }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.accent }} />
          </div>
          <span className="text-[13px] font-semibold tracking-tight">a-MANT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Link href="/app" className="text-[12px] text-muted-foreground px-3 py-1.5 rounded-lg hover:text-foreground transition-colors hidden sm:block">
            Dashboard
          </Link>
          {/* Nav item with corner brackets — iNMerge pattern */}
          <Link
            href="/onboard"
            className="relative text-[12px] font-semibold px-4 py-1.5 rounded-lg transition-all active:scale-95"
            style={{ background: "rgba(255,239,197,0.1)", border: "1px solid rgba(255,239,197,0.22)", color: T.accent }}
          >
            <span className="absolute top-0 left-0 w-2.5 h-2.5" style={{ borderTop: `1.5px solid ${T.bracket}`, borderLeft: `1.5px solid ${T.bracket}` }} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5" style={{ borderTop: `1.5px solid ${T.bracket}`, borderRight: `1.5px solid ${T.bracket}` }} />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5" style={{ borderBottom: `1.5px solid ${T.bracket}`, borderLeft: `1.5px solid ${T.bracket}` }} />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5" style={{ borderBottom: `1.5px solid ${T.bracket}`, borderRight: `1.5px solid ${T.bracket}` }} />
            Get started
          </Link>
        </div>
      </nav>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <SectionBlock>
      {/* ── Atmosphere area (iNMerge image slot) ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: 240, background: "linear-gradient(160deg, #0d0d1a 0%, #080810 60%, #0a0a14 100%)" }}
      >
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,239,197,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,239,197,0.03) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Amber radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(255,239,197,0.07) 0%, transparent 70%)" }} />

        {/* Decorative sparkles — top corners (iNMerge pattern) */}
        <div className="absolute top-8 left-6 z-10"><Sparkle size={36} opacity={0.55} /></div>
        <div className="absolute top-8 right-6 z-10"><Sparkle size={28} opacity={0.35} /></div>

        {/* Floating stat chips */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="flex gap-3">
            {[
              { label: "Axiom decisions", val: "247" },
              { label: "Avg APY", val: "4.2%" },
              { label: "Health score", val: "94" },
            ].map((chip) => (
              <div
                key={chip.label}
                className="px-3 py-2 rounded-xl text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,239,197,0.1)", backdropFilter: "blur(8px)" }}
              >
                <p className="text-[18px] font-light text-foreground leading-none mb-0.5" style={{ color: T.accent }}>{chip.val}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{chip.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(255,239,197,0.05)", border: "1px solid rgba(255,239,197,0.12)" }}>
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 rounded-full bg-positive" />
            <span className="text-[11px] font-medium" style={{ color: "rgba(255,239,197,0.65)" }}>Axiom · Live on Mantle L2</span>
          </div>
        </div>
      </div>

      {/* ── Content area (below image) ── */}
      <div className="px-5 py-7" style={{ background: T.cardBg }}>
        <h1 className="text-[3.5rem] leading-[0.97] font-light tracking-[-0.025em] mb-4">
          <span className="text-foreground">Your money,</span>
          <br />
          <span style={{ background: "linear-gradient(135deg, hsl(var(--accent)) 0%, rgba(255,190,60,0.6) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            works for you.
          </span>
        </h1>

        <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-7 max-w-[300px]">
          Autonomous AI vault on Mantle L2. Deposits USDY and mETH, reads macro signals,
          rebalances — zero input from you.
        </p>

        <div className="flex flex-col gap-2.5 mb-7">
          <ShimmerButton href="/onboard" className="w-full">
            Protect your savings →
          </ShimmerButton>
          <Link href="/app" className="flex items-center justify-center py-3.5 rounded-xl text-[13px] text-muted-foreground hover:text-foreground transition-colors" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            View demo dashboard
          </Link>
        </div>

        {/* Built on badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Built on</span>
          <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ color: T.accent, background: "rgba(255,239,197,0.06)", border: "1px solid rgba(255,239,197,0.15)" }}>
            Mantle L2
          </span>
        </div>
      </div>

      {/* ── Portfolio card — below content ── */}
      <div className="px-3 pb-3" style={{ background: T.cardBg }}>
        <PortfolioCard />
      </div>
    </SectionBlock>
  );
}

// ─── Portfolio card ───────────────────────────────────────────────────────────
function PortfolioCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 0 60px rgba(255,239,197,0.06)" }}>
      <div className="flex items-start justify-between px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <p className="text-[9px] uppercase tracking-[0.14em] mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Portfolio value</p>
          <p className="text-[36px] font-light leading-none tracking-tight text-foreground">
            $2,847<span className="text-[22px]" style={{ color: "rgba(255,255,255,0.35)" }}>.50</span>
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 mb-1.5">
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} className="w-1.5 h-1.5 rounded-full bg-positive" />
            <span className="text-[11px] text-muted-foreground">Axiom active</span>
          </div>
          <p className="text-[14px] font-semibold text-positive">+$38.20</p>
          <p className="text-[10px] text-muted-foreground">this week</p>
        </div>
      </div>

      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex justify-between text-[11px] text-muted-foreground mb-2">
          <span>Savings goal</span><span className="text-foreground font-medium">57%</span>
        </div>
        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full" style={{ width: "57%", background: "linear-gradient(90deg, hsl(var(--accent)) 0%, rgba(255,190,60,0.45) 100%)" }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">$2,847 of $5,000 · 5 months left</p>
      </div>

      <div className="grid grid-cols-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-5 py-4" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.accent }} />
            <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.3)" }}>USDY</p>
          </div>
          <p className="text-[20px] font-light text-foreground leading-none mb-1">$1,624</p>
          <p className="text-[11px] text-positive">4.5% APY · Treasury</p>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--protective))" }} />
            <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.3)" }}>mETH</p>
          </div>
          <p className="text-[20px] font-light text-foreground leading-none mb-1">0.4821</p>
          <p className="text-[11px] text-positive">3.8% APY · Staking</p>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.3)" }}>Latest chapter</p>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ color: T.accent, background: "rgba(255,239,197,0.08)", border: "1px solid rgba(255,239,197,0.18)" }}>Rebalance</span>
        </div>
        <p className="text-[13px] font-medium text-foreground mb-1.5">A Calculated Move</p>
        <p className="text-[12px] text-muted-foreground leading-relaxed">ETH staking fell to 3.1%. Axiom shifted 35% to USDY, securing +1.4% APY on $623.</p>
        <p className="text-[11px] text-muted-foreground mt-2">2 hours ago</p>
      </div>
    </div>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function Marquee() {
  const items = ["Autonomous AI", "Mantle L2", "USDY · RWA", "mETH · Staking", "LI.FI Routes", "ERC-8004 Agent", "Non-custodial", "24/7 Monitoring", "Claude AI"];
  return (
    <SectionBlock>
      <div className="py-3.5 overflow-hidden" style={{ background: "rgba(255,239,197,0.015)" }}>
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
          className="flex gap-10 whitespace-nowrap w-max"
        >
          {[...items, ...items, ...items].map((item, i) => (
            <span key={i} className="text-[11px] uppercase tracking-[0.18em] font-medium" style={{ color: "rgba(255,239,197,0.38)" }}>
              {item}<span className="ml-10" style={{ color: "rgba(255,239,197,0.1)" }}>✦</span>
            </span>
          ))}
        </motion.div>
      </div>
    </SectionBlock>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { n: "66%", label: "of EM users need USD-safe savings" },
    { n: "40%", label: "annual purchasing power lost to inflation" },
    { n: "$0", label: "extra input after your first deposit" },
    { n: "15m", label: "Axiom's autonomous check interval" },
  ];
  return (
    <SectionBlock>
      <div className="px-5 py-12" style={{ background: T.cardBg }}>
        <p className="text-[10px] uppercase tracking-[0.18em] mb-4" style={{ color: "rgba(255,255,255,0.28)" }}>The problem</p>
        <h2 className="text-[1.85rem] font-light leading-[1.15] tracking-tight text-foreground mb-3">
          Inflation doesn&apos;t pause.
          <br /><span className="text-muted-foreground">Your savings shouldn&apos;t either.</span>
        </h2>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-10 max-w-[310px]">
          DeFi has the answer — but demands expertise. a-MANT closes that gap. Deposit once, Axiom does the rest.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((s) => (
            <div key={s.n} className="relative p-5 rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Mini bracket decorations on each stat card */}
              <span className="absolute top-0 left-0 w-3 h-3" style={{ borderTop: `1.5px solid ${T.bracket}`, borderLeft: `1.5px solid ${T.bracket}` }} />
              <span className="absolute bottom-0 right-0 w-3 h-3" style={{ borderBottom: `1.5px solid ${T.bracket}`, borderRight: `1.5px solid ${T.bracket}` }} />
              <p className="text-[2.7rem] font-light leading-none mb-2.5 tracking-tight" style={{ color: T.accent }}>{s.n}</p>
              <p className="text-[11px] text-muted-foreground leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionBlock>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
const STEP_ICONS = [
  <svg key="s" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L3 5v4c0 3.3 2.5 5.8 6 6.5 3.5-.7 6-3.2 6-6.5V5L9 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.5 9l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  <svg key="d" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v9M6.5 8.5L9 11l2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 14h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
  <svg key="l" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10.5 2L4 10h5.5L7.5 16 14 8H8.5L10.5 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

const STEP_GRAD = [
  "linear-gradient(135deg, rgba(20,15,5,1) 0%, rgba(12,10,2,1) 100%)",
  "linear-gradient(135deg, rgba(5,12,20,1) 0%, rgba(2,8,16,1) 100%)",
  "linear-gradient(135deg, rgba(5,18,10,1) 0%, rgba(2,12,6,1) 100%)",
];

function HowItWorks() {
  const steps = [
    { n: "01", title: "Set a goal", body: "How much, by when, and your risk comfort. Two minutes, done once." },
    { n: "02", title: "Deposit once", body: "Move USDY or mETH into the vault. The contract holds it — not Axiom, not us." },
    { n: "03", title: "Axiom runs", body: "Every 15 min: reads signals, decides, acts. Every move in Chronicle." },
  ];
  return (
    <SectionBlock>
      <div style={{ background: T.cardBg }}>
        <div className="px-5 pt-10 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(255,255,255,0.28)" }}>How it works</p>
          <p className="text-[1.55rem] font-light text-foreground leading-snug">
            Three steps.<br /><span className="text-muted-foreground">Then nothing.</span>
          </p>
        </div>

        {/* Step cards — iNMerge Work section pattern */}
        <div className="px-5 py-6 space-y-3">
          {steps.map((s, i) => (
            <div key={s.n} className="rounded-xl overflow-hidden" style={{ background: STEP_GRAD[i], border: "1px solid rgba(255,255,255,0.07)" }}>
              {/* Step visual area */}
              <div className="relative px-5 pt-6 pb-4 flex items-end justify-between" style={{ minHeight: 80 }}>
                <div className="text-[3rem] font-light leading-none" style={{ color: "rgba(255,239,197,0.08)" }}>{s.n}</div>
                <div style={{ color: "rgba(255,239,197,0.4)" }}>{STEP_ICONS[i]}</div>
              </div>
              {/* Step content */}
              <div className="px-5 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-2 mt-4 mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "rgba(255,239,197,0.1)", border: "1px solid rgba(255,239,197,0.22)", color: T.accent }}>{i + 1}</div>
                  <p className="text-[14px] font-medium text-foreground">{s.title}</p>
                </div>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed pl-8">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionBlock>
  );
}

// ─── Pillars ─────────────────────────────────────────────────────────────────
function Pillars() {
  const pillars = [
    { tag: "HORIZON", color: T.accent, bg: "rgba(255,239,197,0.04)", border: "rgba(255,239,197,0.1)", tagBg: "rgba(255,239,197,0.08)", tagBorder: "rgba(255,239,197,0.2)", title: "Macro signal monitoring", body: "Fed rate, Ondo health, ETH staking, Fear & Greed — read every 15 min. Acts only when confidence > 70%." },
    { tag: "CHRONICLE", color: "hsl(var(--positive))", bg: "rgba(64,200,120,0.03)", border: "rgba(64,200,120,0.1)", tagBg: "rgba(64,200,120,0.08)", tagBorder: "rgba(64,200,120,0.22)", title: "Your savings story", body: "Every rebalance narrated in plain language. Not raw logs — a chapter you can actually read." },
    { tag: "SAGE", color: "hsl(var(--protective))", bg: "rgba(100,160,255,0.03)", border: "rgba(100,160,255,0.1)", tagBg: "rgba(100,160,255,0.08)", tagBorder: "rgba(100,160,255,0.22)", title: "Ask anything", body: "Why did Axiom move my funds? What signal triggered it? Answers in plain language, always." },
  ];
  return (
    <SectionBlock>
      <div style={{ background: T.cardBg }}>
        <div className="px-5 pt-10 pb-6">
          <p className="text-[10px] uppercase tracking-[0.18em] mb-8" style={{ color: "rgba(255,255,255,0.28)" }}>Three layers</p>
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", WebkitMaskImage: "linear-gradient(to right, black 80%, transparent 100%)", maskImage: "linear-gradient(to right, black 80%, transparent 100%)" }}
          >
            {pillars.map((p) => (
              <div
                key={p.tag}
                className="flex-none w-[270px] rounded-2xl p-5"
                style={{ background: p.bg, border: `1px solid ${p.border}`, scrollSnapAlign: "start" }}
              >
                <span className="text-[9px] font-bold tracking-[0.18em] px-2.5 py-1.5 rounded-full inline-block mb-4" style={{ color: p.color, background: p.tagBg, border: `1px solid ${p.tagBorder}` }}>{p.tag}</span>
                <p className="text-[14px] font-medium text-foreground mb-2.5">{p.title}</p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionBlock>
  );
}

// ─── Signal feed ─────────────────────────────────────────────────────────────
function SignalFeed() {
  const signals = [
    { label: "Fed funds rate", value: "5.25%", status: "Stable", good: true },
    { label: "Ondo Finance health", value: "94 / 100", status: "Healthy", good: true },
    { label: "ETH staking yield", value: "3.8%", status: "Watch", good: false },
    { label: "Volatility index", value: "38 / 100", status: "Low", good: true },
  ];
  return (
    <SectionBlock>
      <div style={{ background: T.cardBg }}>
        <div className="px-5 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2 mb-3">
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} className="w-1.5 h-1.5 rounded-full bg-positive" />
            <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.28)" }}>HORIZON · Live feed</p>
          </div>
          <p className="text-[1.45rem] font-light text-foreground leading-snug">What Axiom sees<br />right now</p>
        </div>
        {signals.map((s, i) => (
          <div key={s.label} className="flex items-center justify-between px-5 py-4" style={{ borderBottom: i < signals.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <p className="text-[13px] text-foreground">{s.label}</p>
            <div className="flex items-center gap-2.5">
              <p className="text-[13px] font-medium tabular-nums text-foreground">{s.value}</p>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ color: s.good ? "hsl(var(--positive))" : "hsl(var(--warning))", background: s.good ? "rgba(64,200,120,0.08)" : "rgba(250,140,50,0.08)", border: `1px solid ${s.good ? "rgba(64,200,120,0.2)" : "rgba(250,140,50,0.2)"}` }}>{s.status}</span>
            </div>
          </div>
        ))}
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-[12px] text-muted-foreground">Decision: <span className="text-foreground font-semibold">HOLD</span></p>
          <p className="text-[11px] text-muted-foreground">All signals normal</p>
        </div>
      </div>
    </SectionBlock>
  );
}

// ─── Tech stack ───────────────────────────────────────────────────────────────
function TechStack() {
  const items = [
    { label: "Mantle L2", sub: "Chain · 5000" }, { label: "USDY · Ondo", sub: "RWA stablecoin" },
    { label: "mETH", sub: "Liquid staking" }, { label: "LI.FI", sub: "DEX aggregator" },
    { label: "Claude AI", sub: "Narrative + SAGE" }, { label: "ERC-8004", sub: "AI identity NFT" },
  ];
  return (
    <SectionBlock>
      <div className="px-5 py-10" style={{ background: T.cardBg }}>
        <p className="text-[10px] uppercase tracking-[0.18em] mb-8" style={{ color: "rgba(255,255,255,0.28)" }}>Built on</p>
        <div className="grid grid-cols-2 gap-2">
          {items.map((t) => (
            <div key={t.label} className="px-4 py-4 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[13px] font-medium text-foreground mb-0.5">{t.label}</p>
              <p className="text-[11px] text-muted-foreground">{t.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-2.5 px-4 py-3.5 rounded-xl" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[12px] text-muted-foreground leading-relaxed">Non-custodial. Agent wallet only triggers vault functions — it never holds your funds. Fully on-chain.</p>
        </div>
      </div>
    </SectionBlock>
  );
}

// ─── Footer CTA ───────────────────────────────────────────────────────────────
function FooterCTA() {
  return (
    <SectionBlock>
      <div style={{ background: "linear-gradient(160deg, rgba(255,239,197,0.04) 0%, rgba(255,239,197,0.015) 100%)" }}>
        {/* Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none" style={{ background: "radial-gradient(ellipse at center bottom, rgba(255,239,197,0.08) 0%, transparent 70%)" }} />

        <div className="relative px-5 pt-12 pb-10">
          {/* Orb */}
          <div className="relative w-10 h-10 mb-8">
            <div className="absolute inset-0 rounded-full" style={{ background: "rgba(255,239,197,0.08)", border: "1px solid rgba(255,239,197,0.2)" }} />
            <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.05, 0.2, 0.05] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="absolute inset-0 rounded-full" style={{ background: T.accent }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: T.accent }} />
            </div>
          </div>

          <h2 className="text-[2.2rem] font-light leading-[1.1] tracking-tight mb-4">
            <span className="text-foreground">Two minutes</span><br />
            <span className="text-muted-foreground">to set up. Then</span><br />
            <span style={{ background: "linear-gradient(135deg, hsl(var(--accent)) 0%, rgba(255,190,60,0.6) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Axiom handles it.</span>
          </h2>
          <p className="text-[13px] text-muted-foreground mb-10 leading-relaxed max-w-[260px]">No dashboards. No monitoring. No DeFi expertise required.</p>

          <ShimmerButton href="/onboard" className="w-full mb-3">Activate Axiom →</ShimmerButton>
          <Link href="/app" className="flex items-center justify-center py-3.5 rounded-xl text-[13px] text-muted-foreground hover:text-foreground w-full transition-colors" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            Explore dashboard
          </Link>
        </div>

        {/* Ghost wordmark — iNMerge footer pattern */}
        <div className="px-4 text-[5.8rem] font-bold tracking-[-0.04em] leading-none select-none pointer-events-none overflow-hidden" style={{ color: "rgba(255,239,197,0.04)" }}>
          a-MANT
        </div>

        {/* Footer bar */}
        <div className="flex items-center justify-between px-5 py-5 mt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-[12px] font-medium text-foreground">a-MANT</span>
          <p className="text-[11px] text-muted-foreground">Mantle Turing Test · 2026</p>
        </div>
      </div>
    </SectionBlock>
  );
}
