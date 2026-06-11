"use client";

import { SectionBlock, SectionHeading, Reveal, T } from "./primitives";

// ─── Signal feed — live macro readout ─────────────────────────────────────────
export function SignalFeed() {
  const signals = [
    { label: "Fed funds rate", value: "5.25%", status: "Stable", good: true },
    { label: "Ondo Finance health", value: "94 / 100", status: "Healthy", good: true },
    { label: "ETH staking yield", value: "3.8%", status: "Watch", good: false },
    { label: "Volatility index", value: "38 / 100", status: "Low", good: true },
  ];
  return (
    <SectionBlock full>
      <div id="signals" className="w-full px-5 sm:px-8 lg:px-16 py-16 lg:py-24 scroll-mt-24" style={{ background: T.cardBg }}>
        <SectionHeading
          eyebrow="HORIZON · Live feed"
          live
          title={<>What Axiom sees <span className="text-muted-foreground">right now.</span></>}
        />

        <Reveal delay={0.1} className="mt-10">
          <div className="rounded-2xl overflow-hidden max-w-3xl" style={{ background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {signals.map((s, i) => (
              <div key={s.label} className="flex items-center justify-between px-5 sm:px-6 py-4" style={{ borderBottom: i < signals.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <p className="text-[13px] sm:text-[14px] text-foreground">{s.label}</p>
                <div className="flex items-center gap-2.5">
                  <p className="text-[13px] sm:text-[14px] font-medium tabular-nums text-foreground">{s.value}</p>
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
            <div className="px-5 sm:px-6 py-4 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="text-[12px] sm:text-[13px] text-muted-foreground">Decision: <span className="text-foreground font-semibold">HOLD</span></p>
              <p className="text-[11px] text-muted-foreground">All signals normal</p>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionBlock>
  );
}
