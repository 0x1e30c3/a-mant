"use client";

import { SectionBlock } from "./primitives";

// ─── Marquee — infinite scrolling tech tags ───────────────────────────────────
export function Marquee() {
  const items = [
    "Autonomous AI", "Mantle L2", "USDY · RWA", "mETH · Staking", "LI.FI Routes",
    "ERC-8004 Agent", "Non-custodial", "24/7 Monitoring", "LLM",
  ];
  return (
    <SectionBlock>
      <div className="py-4 overflow-hidden" style={{ background: "rgba(194,138,30,0.04)" }}>
        <div className="flex gap-10 whitespace-nowrap w-max animate-marquee will-change-transform">
          {[...items, ...items, ...items].map((item, i) => (
            <span
              key={i}
              className="text-[11px] sm:text-[12px] uppercase tracking-[0.18em] font-medium"
              style={{ color: "rgba(194,138,30,0.6)" }}
            >
              {item}
              <span className="ml-10" style={{ color: "rgba(194,138,30,0.28)" }}>✦</span>
            </span>
          ))}
        </div>
      </div>
    </SectionBlock>
  );
}
