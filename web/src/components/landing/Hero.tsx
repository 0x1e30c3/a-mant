"use client";

import { SectionBlock, ShimmerButton, GhostButton, Sparkle, Reveal, T } from "./primitives";
import { PortfolioCard } from "./PortfolioCard";

// ─── Hero — 2-column on desktop, stacked on mobile ────────────────────────────
export function Hero() {
  return (
    <SectionBlock full>
      {/* ── Atmosphere background (spans the whole hero) ── */}
      <div className="relative overflow-hidden flex-1 flex items-center">
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(194,138,30,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(194,138,30,0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Amber radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 30% 25%, rgba(194,138,30,0.1) 0%, transparent 70%)" }}
        />
        {/* Decorative sparkles */}
        <div className="absolute top-8 right-8 z-10 hidden sm:block"><Sparkle size={36} opacity={0.5} /></div>
        <div className="absolute bottom-10 left-8 z-10 hidden lg:block"><Sparkle size={24} opacity={0.3} /></div>

        {/* ── Content grid ── */}
        <div className="relative w-full grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center px-5 sm:px-8 lg:px-16 py-14 lg:py-20">
          {/* Left column — copy */}
          <Reveal>
            {/* Live badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7"
              style={{ background: "rgba(194,138,30,0.07)", border: "1px solid rgba(194,138,30,0.28)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
              <span className="text-[11px] font-medium" style={{ color: "rgba(194,138,30,0.95)" }}>
                Axiom · Live on Mantle L2
              </span>
            </div>

            <h1 className="text-[3rem] sm:text-[4rem] lg:text-[4.5rem] leading-[0.95] font-light tracking-[-0.03em] mb-5">
              <span className="text-foreground">Your money,</span>
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #B5781A 0%, #D49A2A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                works for you.
              </span>
            </h1>

            <p className="text-[14px] sm:text-[15.5px] text-muted-foreground leading-relaxed mb-8 max-w-[420px]">
              Autonomous AI vault on Mantle L2. Deposits USDY and mETH, reads macro signals,
              rebalances — zero input from you.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 mb-8 max-w-[420px]">
              <ShimmerButton href="/onboard" className="flex-1 px-6">
                Protect your savings →
              </ShimmerButton>
              <GhostButton href="/app" className="flex-1 px-6">
                View demo dashboard
              </GhostButton>
            </div>

            {/* Built on badge */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Built on</span>
              <span
                className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                style={{ color: T.accent, background: "rgba(194,138,30,0.08)", border: "1px solid rgba(194,138,30,0.3)" }}
              >
                Mantle L2
              </span>
            </div>
          </Reveal>

          {/* Right column — portfolio card */}
          <Reveal delay={0.12} className="relative">
            {/* Floating stat chips — desktop only */}
            <div
              className="absolute -top-5 -left-4 z-20 hidden lg:block px-3 py-2 rounded-xl text-center"
              style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(194,138,30,0.25)", backdropFilter: "blur(10px)", boxShadow: "0 6px 20px rgba(20,20,30,0.1)" }}
            >
              <p className="text-[16px] font-light leading-none mb-0.5" style={{ color: T.accent }}>94</p>
              <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Health score</p>
            </div>
            <div
              className="absolute -bottom-4 -right-3 z-20 hidden lg:block px-3 py-2 rounded-xl text-center"
              style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(194,138,30,0.25)", backdropFilter: "blur(10px)", boxShadow: "0 6px 20px rgba(20,20,30,0.1)" }}
            >
              <p className="text-[16px] font-light leading-none mb-0.5" style={{ color: T.accent }}>247</p>
              <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Axiom decisions</p>
            </div>
            <PortfolioCard />
          </Reveal>
        </div>
      </div>
    </SectionBlock>
  );
}
