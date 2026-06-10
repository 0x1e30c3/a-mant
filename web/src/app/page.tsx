"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="bg-[#080810] text-foreground overflow-x-hidden min-h-screen">
      <Navbar />
      <Hero />
      <Marquee />
      <Stats />
      <HowItWorks />
      <Pillars />
      <SignalFeed />
      <TechStack />
      <FooterCTA />
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 h-14"
      style={{ background: "linear-gradient(to bottom, rgba(8,8,16,0.95) 0%, rgba(8,8,16,0.0) 100%)", backdropFilter: "blur(12px)" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
        </div>
        <span className="text-[13px] font-semibold tracking-tight text-foreground">a-MANT</span>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/app" className="text-[12px] text-muted-foreground px-3 py-1.5 rounded-lg hover:text-foreground transition-colors hidden sm:block">
          Dashboard
        </Link>
        <Link
          href="/onboard"
          className="text-[12px] font-semibold px-4 py-2 rounded-lg transition-all active:scale-95"
          style={{ background: "hsl(var(--accent))", color: "hsl(var(--background))" }}
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative pt-14 overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,239,197,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative px-5 pt-10 pb-0">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
          style={{ background: "rgba(255,239,197,0.06)", border: "1px solid rgba(255,239,197,0.15)" }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1.5 h-1.5 rounded-full bg-positive"
          />
          <span className="text-[11px] text-accent/80 font-medium">Axiom · Live on Mantle L2</span>
        </div>

        {/* Headline */}
        <h1 className="text-[3.6rem] leading-[0.98] font-light tracking-[-0.02em] mb-5">
          <span className="text-foreground">Your money,</span>
          <br />
          <span style={{
            background: "linear-gradient(135deg, hsl(var(--accent)) 0%, rgba(255,200,80,0.6) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            works for you.
          </span>
        </h1>

        <p className="text-[14px] text-muted-foreground leading-relaxed mb-8 max-w-[300px]">
          Autonomous AI vault on Mantle L2.
          Monitors macro signals, rebalances between USDY
          and mETH — zero input required from you.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-2.5 mb-10">
          <Link
            href="/onboard"
            className="flex items-center justify-center gap-2 py-4 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98]"
            style={{ background: "hsl(var(--accent))", color: "hsl(var(--background))" }}
          >
            Protect your savings
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/app"
            className="flex items-center justify-center py-3.5 rounded-xl text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            View demo →
          </Link>
        </div>
      </div>

      {/* Portfolio card — prominent, full width, glow */}
      <div className="relative mx-4">
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: "0 0 60px rgba(255,239,197,0.08), 0 0 120px rgba(255,239,197,0.04)" }}
        />
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {/* Card header */}
          <div className="flex items-start justify-between px-5 py-5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.12em] mb-2">Portfolio value</p>
              <p className="text-[38px] font-light leading-none tracking-tight text-foreground">$2,847<span className="text-[24px] text-muted-foreground">.50</span></p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 mb-1.5">
                <motion.div
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="w-1.5 h-1.5 rounded-full bg-positive"
                />
                <span className="text-[11px] text-muted-foreground">Axiom active</span>
              </div>
              <p className="text-[13px] font-semibold text-positive">+$38.20</p>
              <p className="text-[10px] text-muted-foreground">this week</p>
            </div>
          </div>

          {/* Goal progress */}
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex justify-between text-[11px] text-muted-foreground mb-2">
              <span>Goal progress</span>
              <span className="text-foreground font-medium">57%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: "57%", background: "linear-gradient(90deg, hsl(var(--accent)) 0%, rgba(255,200,80,0.5) 100%)" }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">$2,847 of $5,000 · 5 months left</p>
          </div>

          {/* Allocation */}
          <div className="grid grid-cols-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-5 py-4" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">USDY</p>
              </div>
              <p className="text-[22px] font-light text-foreground leading-none mb-1">$1,624</p>
              <p className="text-[11px] text-positive">4.5% APY · Treasury</p>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-protective" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">mETH</p>
              </div>
              <p className="text-[22px] font-light text-foreground leading-none mb-1">0.4821</p>
              <p className="text-[11px] text-positive">3.8% APY · Staking</p>
            </div>
          </div>

          {/* Latest chapter */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Latest chapter</p>
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ color: "hsl(var(--accent))", background: "rgba(255,239,197,0.08)", border: "1px solid rgba(255,239,197,0.15)" }}
              >
                Rebalance
              </span>
            </div>
            <p className="text-[13px] font-medium text-foreground mb-1">A Calculated Move</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              ETH staking fell to 3.1%. Axiom shifted 35% to USDY, locking +1.4% APY on $623.
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">2 hours ago</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────

function Marquee() {
  const items = [
    "Autonomous AI", "Mantle L2", "USDY · RWA", "mETH · Staking",
    "LI.FI Routes", "ERC-8004", "Non-custodial", "24/7 Monitoring",
  ];

  return (
    <div className="mt-10 py-3.5 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,239,197,0.02)" }}>
      <motion.div
        animate={{ x: [0, -1100] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="flex gap-10 whitespace-nowrap w-max"
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="text-[11px] uppercase tracking-[0.15em] font-medium" style={{ color: "rgba(255,239,197,0.4)" }}>
            {item}
            <span className="ml-10" style={{ color: "rgba(255,255,255,0.08)" }}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  const stats = [
    { n: "66%", label: "of users in emerging markets need USD-safe savings" },
    { n: "40%", label: "annual currency depreciation in high-inflation markets" },
    { n: "$0", label: "extra input needed after your first deposit" },
    { n: "15m", label: "how often Axiom checks and acts on macro signals" },
  ];

  return (
    <section className="px-5 py-16">
      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-4">The problem</p>
      <h2 className="text-[1.9rem] font-light leading-[1.15] tracking-tight text-foreground mb-3">
        Inflation doesn&apos;t pause.
        <br />
        <span className="text-muted-foreground">Your savings shouldn&apos;t either.</span>
      </h2>
      <p className="text-[13px] text-muted-foreground leading-relaxed mb-10 max-w-[320px]">
        DeFi offers protection, but demands expertise. a-MANT closes that gap — one deposit, full automation.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div
            key={s.n}
            className="p-5 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p
              className="text-[2.4rem] font-light leading-none mb-2 tracking-tight"
              style={{ color: "hsl(var(--accent))" }}
            >
              {s.n}
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Set your goal",
      body: "Tell Axiom how much you want to grow, by when, and how aggressive. Two minutes, once.",
      detail: "Min. $100 · No expertise needed",
    },
    {
      n: "02",
      title: "Deposit once",
      body: "Move USDY or mETH into your vault. The smart contract holds it — not Axiom, not us.",
      detail: "Fully non-custodial · On-chain",
    },
    {
      n: "03",
      title: "Axiom takes over",
      body: "Every 15 minutes: read macro signals → decide → act. Every move narrated in Chronicle.",
      detail: "24/7 autonomous · Fully auditable",
    },
  ];

  return (
    <section className="py-2 pb-14">
      <div
        className="mx-4 rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="px-5 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-3">How it works</p>
          <p className="text-[1.5rem] font-light text-foreground leading-snug">Three steps.<br />Then nothing.</p>
        </div>

        {steps.map((s, i) => (
          <div
            key={s.n}
            className="flex gap-5 px-5 py-6"
            style={{ borderBottom: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
          >
            <span
              className="text-[11px] font-semibold tabular-nums mt-0.5 flex-shrink-0 w-6"
              style={{ color: "rgba(255,239,197,0.4)" }}
            >
              {s.n}
            </span>
            <div>
              <p className="text-[14px] font-medium text-foreground mb-1.5">{s.title}</p>
              <p className="text-[12px] text-muted-foreground leading-relaxed mb-2">{s.body}</p>
              <p className="text-[11px]" style={{ color: "rgba(255,239,197,0.5)" }}>{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Pillars ──────────────────────────────────────────────────────────────────

function Pillars() {
  const pillars = [
    {
      tag: "HORIZON",
      color: "hsl(var(--accent))",
      bg: "rgba(255,239,197,0.05)",
      border: "rgba(255,239,197,0.12)",
      accentBg: "rgba(255,239,197,0.06)",
      accentBorder: "rgba(255,239,197,0.15)",
      title: "Macro signal monitoring",
      body: "Fed rate, Ondo Finance health, ETH staking yield, Fear & Greed index — read every 15 min. Axiom acts only when confidence exceeds 70%.",
    },
    {
      tag: "CHRONICLE",
      color: "hsl(var(--positive))",
      bg: "rgba(64,200,120,0.04)",
      border: "rgba(64,200,120,0.12)",
      accentBg: "rgba(64,200,120,0.06)",
      accentBorder: "rgba(64,200,120,0.2)",
      title: "Your savings story",
      body: "Every rebalance is written as a chapter. Not raw logs — a narrative. Understand what Axiom did and why, in plain language.",
    },
    {
      tag: "SAGE",
      color: "hsl(var(--protective))",
      bg: "rgba(100,160,255,0.04)",
      border: "rgba(100,160,255,0.12)",
      accentBg: "rgba(100,160,255,0.06)",
      accentBorder: "rgba(100,160,255,0.2)",
      title: "Ask anything, anytime",
      body: "Why did you move my funds? What signal triggered it? Axiom answers in clear language — backed by real data.",
    },
  ];

  return (
    <section className="px-5 pb-16">
      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-10">Three layers</p>

      <div className="space-y-3">
        {pillars.map((p) => (
          <div
            key={p.tag}
            className="rounded-2xl overflow-hidden"
            style={{ background: p.bg, border: `1px solid ${p.border}` }}
          >
            <div className="px-5 pt-5 pb-5">
              <span
                className="text-[10px] font-bold tracking-[0.15em] px-2.5 py-1.5 rounded-full inline-block mb-4"
                style={{ color: p.color, background: p.accentBg, border: `1px solid ${p.accentBorder}` }}
              >
                {p.tag}
              </span>
              <p className="text-[15px] font-medium text-foreground mb-2.5">{p.title}</p>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Signal feed ──────────────────────────────────────────────────────────────

function SignalFeed() {
  const signals = [
    { label: "Fed funds rate", value: "5.25%", status: "Stable", good: true },
    { label: "Ondo Finance health", value: "94 / 100", status: "Healthy", good: true },
    { label: "ETH staking yield", value: "3.8%", status: "Watch", good: false },
    { label: "Volatility index", value: "38 / 100", status: "Low", good: true },
  ];

  return (
    <section className="pb-16">
      <div
        className="mx-4 rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="px-5 pt-7 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="w-1.5 h-1.5 rounded-full bg-positive"
            />
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">HORIZON · Live feed</p>
          </div>
          <p className="text-[1.4rem] font-light text-foreground leading-snug">What Axiom sees<br />right now</p>
        </div>

        {signals.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: i < signals.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
          >
            <p className="text-[13px] text-foreground">{s.label}</p>
            <div className="flex items-center gap-2.5">
              <p className="text-[13px] font-medium text-foreground tabular-nums">{s.value}</p>
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  color: s.good ? "hsl(var(--positive))" : "hsl(var(--warning))",
                  background: s.good ? "rgba(64,200,120,0.08)" : "rgba(250,140,50,0.08)",
                  border: `1px solid ${s.good ? "rgba(64,200,120,0.2)" : "rgba(250,140,50,0.2)"}`,
                }}
              >
                {s.status}
              </span>
            </div>
          </div>
        ))}

        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[12px] text-muted-foreground">
            Current decision: <span className="text-foreground font-semibold">HOLD</span>
          </p>
          <p className="text-[11px] text-muted-foreground">All signals normal</p>
        </div>
      </div>
    </section>
  );
}

// ─── Tech stack ───────────────────────────────────────────────────────────────

function TechStack() {
  const items = [
    { label: "Mantle L2", sub: "Chain · 5000" },
    { label: "USDY · Ondo", sub: "RWA stablecoin" },
    { label: "mETH", sub: "Liquid staking" },
    { label: "LI.FI", sub: "DEX aggregator" },
    { label: "Claude AI", sub: "Narrative + SAGE" },
    { label: "ERC-8004", sub: "AI identity NFT" },
  ];

  return (
    <section className="px-5 pb-16">
      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-8">Built on</p>

      <div className="grid grid-cols-2 gap-2">
        {items.map((t) => (
          <div
            key={t.label}
            className="px-4 py-4 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-[13px] font-medium text-foreground mb-0.5">{t.label}</p>
            <p className="text-[11px] text-muted-foreground">{t.sub}</p>
          </div>
        ))}
      </div>

      <div
        className="mt-3 px-4 py-4 rounded-xl"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          Non-custodial — your funds stay in the smart contract. The agent wallet only triggers vault functions. Fully auditable on-chain.
        </p>
      </div>
    </section>
  );
}

// ─── Footer CTA ───────────────────────────────────────────────────────────────

function FooterCTA() {
  return (
    <section className="relative overflow-hidden pb-16">
      {/* Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center bottom, rgba(255,239,197,0.07) 0%, transparent 70%)" }}
      />

      <div
        className="relative mx-4 rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(160deg, rgba(255,239,197,0.06) 0%, rgba(255,239,197,0.02) 100%)", border: "1px solid rgba(255,239,197,0.12)" }}
      >
        <div className="px-6 pt-10 pb-10">
          {/* Pulsing orb */}
          <div className="relative w-10 h-10 mb-8">
            <div className="absolute inset-0 rounded-full" style={{ background: "rgba(255,239,197,0.1)", border: "1px solid rgba(255,239,197,0.2)" }} />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.08, 0.25, 0.08] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full"
              style={{ background: "hsl(var(--accent))" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--accent))" }} />
            </div>
          </div>

          <h2 className="text-[2.2rem] font-light leading-[1.1] tracking-tight mb-4">
            <span className="text-foreground">Two minutes</span>
            <br />
            <span className="text-muted-foreground">to set up. Then</span>
            <br />
            <span style={{
              background: "linear-gradient(135deg, hsl(var(--accent)) 0%, rgba(255,200,80,0.6) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Axiom handles it.
            </span>
          </h2>

          <p className="text-[13px] text-muted-foreground mb-10 leading-relaxed">
            No dashboards. No monitoring. No DeFi expertise required.
          </p>

          <Link
            href="/onboard"
            className="flex items-center justify-center gap-2 py-4 rounded-xl text-[14px] font-semibold mb-3 w-full transition-all active:scale-[0.98]"
            style={{ background: "hsl(var(--accent))", color: "hsl(var(--background))" }}
          >
            Activate Axiom
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/app"
            className="flex items-center justify-center py-3.5 rounded-xl text-[13px] text-muted-foreground hover:text-foreground border w-full transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            Explore dashboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 mt-10">
        <span className="text-[12px] font-medium text-foreground">a-MANT</span>
        <p className="text-[11px] text-muted-foreground">Mantle Turing Test · 2026</p>
      </div>
    </section>
  );
}
