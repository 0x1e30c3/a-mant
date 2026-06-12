"use client";

import { SectionBlock, SectionHeading, Reveal, T } from "./primitives";

// ─── Pillars — 3 layers; grid on desktop, horizontal snap-scroll on mobile ────
export function Pillars() {
  const pillars = [
    { tag: "HORIZON", color: T.accent, bg: "rgba(194,138,30,0.06)", border: "rgba(194,138,30,0.12)", tagBg: "rgba(194,138,30,0.1)", tagBorder: "rgba(194,138,30,0.32)", title: "Macro signal monitoring", body: "Fed rate, Ondo health, ETH staking, Fear & Greed — read every 15 min. Acts only when confidence > 70%." },
    { tag: "CHRONICLE", color: "hsl(var(--positive))", bg: "rgba(64,200,120,0.03)", border: "rgba(64,200,120,0.1)", tagBg: "rgba(64,200,120,0.08)", tagBorder: "rgba(64,200,120,0.22)", title: "Your savings story", body: "Every rebalance narrated in plain language. Not raw logs — a chapter you can actually read." },
    { tag: "SAGE", color: "hsl(var(--protective))", bg: "rgba(100,160,255,0.03)", border: "rgba(100,160,255,0.1)", tagBg: "rgba(100,160,255,0.08)", tagBorder: "rgba(100,160,255,0.22)", title: "Ask anything", body: "Why did Axiom move my funds? What signal triggered it? Answers in plain language, always." },
  ];
  return (
    <SectionBlock full>
      <div id="pillars" className="w-full px-5 sm:px-8 lg:px-16 py-16 lg:py-24 scroll-mt-24" style={{ background: T.cardBg }}>
        <SectionHeading
          eyebrow="Three layers"
          title={<>One vault, <span className="text-muted-foreground">three minds.</span></>}
        />

        <div
          className="mt-12 flex gap-3 sm:gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible"
          style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
        >
          {pillars.map((p, i) => (
            <Reveal key={p.tag} delay={i * 0.1} className="flex-none w-[280px] md:w-auto">
              <div
                className="h-full rounded-2xl p-6"
                style={{ background: p.bg, border: `1px solid ${p.border}`, scrollSnapAlign: "start" }}
              >
                <span className="text-[9px] font-bold tracking-[0.18em] px-2.5 py-1.5 rounded-full inline-block mb-5" style={{ color: p.color, background: p.tagBg, border: `1px solid ${p.tagBorder}` }}>{p.tag}</span>
                <p className="text-[15px] font-medium text-foreground mb-2.5">{p.title}</p>
                <p className="text-[12.5px] sm:text-[13px] text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionBlock>
  );
}
