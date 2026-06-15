"use client";

import { SectionBlock, SectionHeading, Reveal, T } from "./primitives";

// ─── Tech stack — what it's built on ──────────────────────────────────────────
export function TechStack() {
  const items = [
    { label: "Mantle L2", sub: "Chain · 5000" },
    { label: "USDY · Ondo", sub: "RWA stablecoin" },
    { label: "mETH", sub: "Liquid staking" },
    { label: "LI.FI", sub: "DEX aggregator" },
    { label: "LLM", sub: "Narrative + SAGE" },
    { label: "ERC-8004", sub: "AI identity NFT" },
  ];
  return (
    <SectionBlock full>
      <div className="w-full px-5 sm:px-8 lg:px-16 py-16 lg:py-24" style={{ background: T.cardBg }}>
        <SectionHeading eyebrow="Built on" title={<>A stack you can <span className="text-muted-foreground">verify.</span></>} />

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          {items.map((t, i) => (
            <Reveal key={t.label} delay={i * 0.06}>
              <div className="h-full px-4 sm:px-5 py-4 sm:py-5 rounded-xl" style={{ background: "rgba(20,20,30,0.04)", border: "1px solid rgba(20,20,30,0.08)" }}>
                <p className="text-[13px] sm:text-[14px] font-medium text-foreground mb-0.5">{t.label}</p>
                <p className="text-[11px] sm:text-[12px] text-muted-foreground">{t.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-3 px-4 sm:px-5 py-4 rounded-xl" style={{ background: "rgba(20,20,30,0.025)", border: "1px solid rgba(20,20,30,0.07)" }}>
          <p className="text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed max-w-2xl">
            Non-custodial. Agent wallet only triggers vault functions — it never holds your funds. Fully on-chain.
          </p>
        </div>
      </div>
    </SectionBlock>
  );
}
