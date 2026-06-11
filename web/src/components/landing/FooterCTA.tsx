"use client";

import { SectionBlock, ShimmerButton, GhostButton, Reveal, T } from "./primitives";

// ─── Footer CTA — final pitch + ghost wordmark ────────────────────────────────
export function FooterCTA() {
  return (
    <SectionBlock full>
      <div className="relative w-full flex-1 flex flex-col justify-center overflow-hidden" style={{ background: "linear-gradient(160deg, rgba(255,239,197,0.04) 0%, rgba(255,239,197,0.015) 100%)" }}>
        {/* Glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center bottom, rgba(255,239,197,0.08) 0%, transparent 70%)" }}
        />

        <Reveal>
          <div className="relative px-5 sm:px-8 lg:px-12 pt-20 pb-16 flex flex-col items-center text-center">
            {/* Orb */}
            <div className="relative w-10 h-10 mb-8">
              <div className="absolute inset-0 rounded-full" style={{ background: "rgba(255,239,197,0.08)", border: "1px solid rgba(255,239,197,0.2)" }} />
              <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: T.accent }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: T.accent }} />
              </div>
            </div>

            <h2 className="text-[2.4rem] sm:text-[3.2rem] font-light leading-[1.08] tracking-tight mb-5 max-w-2xl">
              <span className="text-foreground">Two minutes to set up. </span>
              <span
                style={{
                  background: "linear-gradient(135deg, hsl(var(--accent)) 0%, rgba(255,190,60,0.6) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Then Axiom handles it.
              </span>
            </h2>
            <p className="text-[13.5px] sm:text-[15px] text-muted-foreground mb-10 leading-relaxed max-w-[340px]">
              No dashboards. No monitoring. No DeFi expertise required.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md">
              <ShimmerButton href="/onboard" className="flex-1 px-6">Activate Axiom →</ShimmerButton>
              <GhostButton href="/app" className="flex-1 px-6">Explore dashboard</GhostButton>
            </div>
          </div>
        </Reveal>

        {/* Ghost wordmark */}
        <div className="px-4 text-[18vw] lg:text-[10rem] font-bold tracking-[-0.04em] leading-none select-none pointer-events-none overflow-hidden text-center" style={{ color: "rgba(255,239,197,0.04)" }}>
          a-MANT
        </div>

        {/* Footer bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-12 py-6 mt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-[12px] font-medium text-foreground">a-MANT</span>
          <p className="text-[11px] text-muted-foreground">Mantle Turing Test · 2026</p>
        </div>
      </div>
    </SectionBlock>
  );
}
