"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <Hero />
      <StatsStrip />
      <Problem />
      <HowItWorks />
      <Pillars />
      <SignalFeed />
      <TechStack />
      <FooterCTA />
    </div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3.5 bg-background/90 backdrop-blur-md border-b border-border/50">
      <span className="text-sm font-medium tracking-wide text-foreground">a-MANT</span>
      <Link
        href="/onboard"
        className="text-xs font-medium bg-accent text-background px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
      >
        Get started
      </Link>
    </nav>
  );
}

function Hero() {
  return (
    <section className="pt-20 px-5">
      <div className="max-w-sm mx-auto pt-8 pb-6">

        {/* Live badge */}
        <div className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface-elevated">
          <span className="w-1.5 h-1.5 rounded-full bg-positive" />
          <span className="text-xs text-muted-foreground">Axiom is live on Mantle</span>
        </div>

        {/* Headline */}
        <h1 className="text-[2.6rem] leading-[1.1] font-light text-foreground mb-4">
          Your savings,
          <br />
          <span className="text-accent">protected by AI.</span>
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed mb-7 max-w-[280px]">
          An autonomous AI vault on Mantle — rebalances your USDY and mETH,
          responds to real macro signals, 24/7 with no input from you.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-2.5 mb-10">
          <Link
            href="/onboard"
            className="flex items-center justify-center py-4 bg-accent text-background rounded-xl text-sm font-medium hover:bg-accent/90 transition-all active:scale-[0.98]"
          >
            Start protecting your savings
          </Link>
          <Link
            href="/app"
            className="flex items-center justify-center py-3.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-xl border border-border"
          >
            View demo dashboard
          </Link>
        </div>
      </div>

      {/* Portfolio card mockup — no opacity animation so it's always visible */}
      <div className="max-w-sm mx-auto rounded-t-2xl border border-b-0 border-border bg-surface-elevated overflow-hidden shadow-[0_-8px_40px_rgba(0,0,0,0.4)]">

        {/* Header row */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-widest">Portfolio value</p>
            <p className="text-[28px] font-light text-foreground leading-none">$2,847.50</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end mb-1">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-1.5 h-1.5 rounded-full bg-positive"
              />
              <span className="text-[11px] text-muted-foreground">Axiom active</span>
            </div>
            <p className="text-xs text-positive">+$38.20 this week</p>
          </div>
        </div>

        {/* Goal progress */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex justify-between text-xs text-muted-foreground mb-2.5">
            <span>Savings goal</span>
            <span>$2,847 / $5,000</span>
          </div>
          <div className="h-1 w-full bg-border rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: "57%" }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">57% · 5 months remaining</p>
        </div>

        {/* Allocation */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          <div className="px-5 py-4">
            <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-widest">USDY</p>
            <p className="text-lg font-light text-foreground">$1,624.30</p>
            <p className="text-xs text-positive mt-0.5">4.5% APY · RWA</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-widest">mETH</p>
            <p className="text-lg font-light text-foreground">0.4821</p>
            <p className="text-xs text-positive mt-0.5">3.8% APY · LST</p>
          </div>
        </div>

        {/* Latest chapter */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Latest chapter</p>
            <span className="text-[10px] text-accent px-2 py-0.5 rounded-full border border-accent/30 bg-accent/5">
              Rebalance
            </span>
          </div>
          <p className="text-sm font-medium text-foreground mb-1">A Calculated Move</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            ETH staking yield fell to 3.1%. Axiom shifted 35% of your mETH to USDY,
            capturing an extra 1.4% APY on $623.
          </p>
          <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  const stats = [
    { n: "15 min", label: "Monitoring cycle" },
    { n: "4.5%", label: "USDY base APY" },
    { n: "0", label: "Input after setup" },
    { n: "100%", label: "Non-custodial" },
  ];

  return (
    <FadeUp className="border-y border-border bg-surface-elevated mt-0">
      <div className="flex overflow-x-auto">
        {stats.map((s, i) => (
          <div
            key={s.n}
            className={cn(
              "flex-1 min-w-[110px] px-5 py-5",
              i < stats.length - 1 && "border-r border-border"
            )}
          >
            <p className="text-xl font-light text-foreground mb-0.5">{s.n}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}

function Problem() {
  return (
    <section className="py-16 px-5">
      <div className="max-w-sm mx-auto">
        <FadeUp>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-6">
            The problem
          </p>
          <h2 className="text-[1.6rem] font-light text-foreground leading-snug mb-5">
            Inflation doesn&apos;t announce itself.
            <br />It just erodes.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            In emerging markets, currencies can lose 8–40% of value in a year.
            DeFi yields require expertise most people don&apos;t have. a-MANT
            closes that gap — one deposit, AI handles the rest.
          </p>
        </FadeUp>

        <div className="grid grid-cols-2 gap-3">
          {[
            { n: "66%", label: "of stablecoin users in emerging markets seeking dollar access" },
            { n: "8–40%", label: "annual currency loss in high-inflation economies" },
          ].map((s, i) => (
            <FadeUp key={s.n} delay={i * 0.07}>
              <div className="p-4 rounded-xl border border-border bg-surface-elevated h-full">
                <p className="text-2xl font-light text-accent mb-2">{s.n}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Set a goal", body: "Amount, timeline, and risk mode. Takes 2 minutes." },
    { n: "02", title: "Deposit once", body: "USDY or mETH into your non-custodial vault." },
    { n: "03", title: "Axiom takes over", body: "Rebalances, protects, and compounds — autonomously." },
  ];

  return (
    <section className="py-4 px-5 border-t border-border">
      <div className="max-w-sm mx-auto py-12">
        <FadeUp>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-10">
            How it works
          </p>
        </FadeUp>
        {steps.map((s, i) => (
          <FadeUp key={s.n} delay={i * 0.08}>
            <div className="flex gap-5 py-6 border-b border-border last:border-0">
              <span className="text-xs text-muted-foreground mt-0.5 font-medium w-5 flex-shrink-0 tabular-nums">
                {s.n}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground mb-1.5">{s.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

function Pillars() {
  const pillars = [
    {
      tag: "HORIZON",
      color: "text-accent border-accent/20 bg-accent/5",
      title: "Macro signal monitoring",
      body: "Fed rate trends, Ondo Finance health scores, ETH staking rates, global volatility — read every 15 minutes.",
    },
    {
      tag: "CHRONICLE",
      color: "text-positive border-positive/20 bg-positive/5",
      title: "Your savings story",
      body: "Every rebalance narrated in plain language. Not a transaction log — a story you can read and share.",
    },
    {
      tag: "SAGE",
      color: "text-protective border-protective/20 bg-protective/5",
      title: "Ask anything",
      body: "Why did you move my funds? Axiom explains every decision in plain terms, any time.",
    },
  ];

  return (
    <section className="py-16 px-5 border-t border-border bg-surface">
      <div className="max-w-sm mx-auto">
        <FadeUp>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-8">
            The architecture
          </p>
        </FadeUp>
        <div className="space-y-3">
          {pillars.map((p, i) => (
            <FadeUp key={p.tag} delay={i * 0.08}>
              <div className="p-5 rounded-xl border border-border bg-background space-y-3">
                <span className={cn("text-[10px] font-semibold tracking-widest px-2 py-1 rounded-md border", p.color)}>
                  {p.tag}
                </span>
                <p className="text-sm font-medium text-foreground pt-0.5">{p.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function SignalFeed() {
  const signals = [
    { label: "Fed rate", value: "5.25%", status: "stable", ok: true },
    { label: "Ondo health", value: "94 / 100", status: "healthy", ok: true },
    { label: "ETH staking", value: "3.8%", status: "watch", ok: false },
    { label: "Volatility index", value: "38 / 100", status: "low", ok: true },
  ];

  return (
    <section className="py-16 px-5 border-t border-border">
      <div className="max-w-sm mx-auto">
        <FadeUp>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
            HORIZON layer
          </p>
          <h2 className="text-xl font-light text-foreground mb-2">What Axiom watches</h2>
          <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
            Real signals. Acts only when confidence exceeds 70%.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Live signal feed</p>
              <div className="flex items-center gap-1.5">
                <motion.span
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="w-1.5 h-1.5 rounded-full bg-positive"
                />
                <span className="text-xs text-muted-foreground">updating</span>
              </div>
            </div>

            {signals.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0"
              >
                <p className="text-sm text-foreground">{s.label}</p>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-foreground tabular-nums">{s.value}</p>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                      s.ok
                        ? "text-positive border-positive/25 bg-positive/8"
                        : "text-warning border-warning/25 bg-warning/8"
                    )}
                  >
                    {s.status}
                  </span>
                </div>
              </div>
            ))}

            <div className="px-4 py-3.5 bg-background/50 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Current decision:{" "}
                <span className="text-foreground font-medium">HOLD</span>
                <span className="text-muted-foreground"> — all signals within normal range</span>
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function TechStack() {
  const items = [
    { label: "Mantle L2", sub: "EVM L2 — fast, low cost" },
    { label: "USDY (Ondo)", sub: "US Treasury-backed RWA" },
    { label: "mETH", sub: "Mantle liquid staking token" },
    { label: "LI.FI", sub: "DEX aggregator — best route" },
    { label: "Claude AI", sub: "Narrative + SAGE chat" },
    { label: "ERC-8004", sub: "Soulbound AI agent identity" },
  ];

  return (
    <section className="py-16 px-5 border-t border-border bg-surface">
      <div className="max-w-sm mx-auto">
        <FadeUp>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-8">Built on</p>
        </FadeUp>
        <div className="grid grid-cols-2 gap-2">
          {items.map((t, i) => (
            <FadeUp key={t.label} delay={i * 0.05}>
              <div className="p-4 rounded-lg border border-border bg-background h-full">
                <p className="text-sm font-medium text-foreground mb-1">{t.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.sub}</p>
              </div>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={0.3}>
          <p className="text-xs text-muted-foreground mt-6 leading-relaxed border-t border-border pt-6">
            Non-custodial. The agent wallet only calls vault functions — it never holds your funds.
            All positions are on-chain and fully auditable.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section className="py-20 px-5 border-t border-border">
      <div className="max-w-sm mx-auto text-center">
        <FadeUp>
          {/* Pulse orb */}
          <div className="relative w-14 h-14 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-accent/10 border border-accent/20" />
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.4, 0.15] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-accent/15"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
            </div>
          </div>

          <h2 className="text-2xl font-light text-foreground mb-3 leading-snug">
            Two minutes to set up.
            <br />
            <span className="text-muted-foreground">Then Axiom handles the rest.</span>
          </h2>

          <p className="text-sm text-muted-foreground mb-10 leading-relaxed max-w-[260px] mx-auto">
            No spreadsheets. No monitoring dashboards.
            No DeFi expertise required.
          </p>

          <Link
            href="/onboard"
            className="flex items-center justify-center py-4 bg-accent text-background rounded-xl text-sm font-medium hover:bg-accent/90 transition-all active:scale-[0.98] w-full mb-10"
          >
            Activate Axiom
          </Link>

          <div className="pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Built for the Mantle Turing Test Hackathon 2026 · AI × RWA track
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
