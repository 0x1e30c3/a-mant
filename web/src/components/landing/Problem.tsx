"use client";

import { SectionBlock, SectionHeading, Reveal, T } from "./primitives";

// ─── Problem — the "why" + stat grid (4-up on desktop) ────────────────────────
export function Problem() {
  const stats = [
    { n: "66%", label: "of EM users need USD-safe savings" },
    { n: "40%", label: "annual purchasing power lost to inflation" },
    { n: "$0", label: "extra input after your first deposit" },
    { n: "15m", label: "Axiom's autonomous check interval" },
  ];
  return (
    <SectionBlock full>
      <div className="w-full px-5 sm:px-8 lg:px-16 py-16 lg:py-24" style={{ background: T.cardBg }}>
        <SectionHeading
          eyebrow="The problem"
          title={
            <>
              Inflation doesn&apos;t pause.
              <br />
              <span className="text-muted-foreground">Your savings shouldn&apos;t either.</span>
            </>
          }
          intro="DeFi has the answer — but demands expertise. a-MANT closes that gap. Deposit once, Axiom does the rest."
        />

        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {stats.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div
                className="relative h-full p-5 sm:p-6 rounded-xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="absolute top-0 left-0 w-3 h-3" style={{ borderTop: `1.5px solid ${T.bracket}`, borderLeft: `1.5px solid ${T.bracket}` }} />
                <span className="absolute bottom-0 right-0 w-3 h-3" style={{ borderBottom: `1.5px solid ${T.bracket}`, borderRight: `1.5px solid ${T.bracket}` }} />
                <p className="text-[2.6rem] sm:text-[3.2rem] font-light leading-none mb-3 tracking-tight" style={{ color: T.accent }}>{s.n}</p>
                <p className="text-[11px] sm:text-[12px] text-muted-foreground leading-snug">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionBlock>
  );
}
