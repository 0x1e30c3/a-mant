"use client";

import { SectionBlock, SectionHeading, Reveal, T } from "./primitives";

const STEP_ICONS = [
  <svg key="s" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L3 5v4c0 3.3 2.5 5.8 6 6.5 3.5-.7 6-3.2 6-6.5V5L9 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.5 9l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  <svg key="d" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v9M6.5 8.5L9 11l2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 14h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
  <svg key="l" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10.5 2L4 10h5.5L7.5 16 14 8H8.5L10.5 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

const STEP_GRAD = [
  "linear-gradient(135deg, #FFF8EA 0%, #FDF3DC 100%)",
  "linear-gradient(135deg, #EEF4FF 0%, #E4EEFF 100%)",
  "linear-gradient(135deg, #ECFAF1 0%, #E0F5E8 100%)",
];

// ─── How it works — 3 steps, grid on desktop ──────────────────────────────────
export function HowItWorks() {
  const steps = [
    { title: "Set a goal", body: "How much, by when, and your risk comfort. Two minutes, done once." },
    { title: "Deposit once", body: "Move USDY or mETH into the vault. The contract holds it — not Axiom, not us." },
    { title: "Axiom runs", body: "Every 15 min: reads signals, decides, acts. Every move in Chronicle." },
  ];
  return (
    <SectionBlock full>
      <div id="how" className="w-full px-5 sm:px-8 lg:px-16 py-16 lg:py-24 scroll-mt-24" style={{ background: T.cardBg }}>
        <SectionHeading
          eyebrow="How it works"
          title={<>Three steps.<span className="text-muted-foreground"> Then nothing.</span></>}
        />

        <div className="mt-12 grid md:grid-cols-3 gap-3 sm:gap-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="h-full rounded-xl overflow-hidden" style={{ background: STEP_GRAD[i], border: "1px solid rgba(20,20,30,0.1)" }}>
                {/* Step visual area */}
                <div className="relative px-5 pt-6 pb-4 flex items-end justify-between" style={{ minHeight: 90 }}>
                  <div className="text-[3.4rem] font-light leading-none" style={{ color: "rgba(194,138,30,0.1)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ color: "rgba(194,138,30,0.6)" }}>{STEP_ICONS[i]}</div>
                </div>
                {/* Step content */}
                <div className="px-5 pb-6" style={{ borderTop: "1px solid rgba(20,20,30,0.07)" }}>
                  <div className="flex items-center gap-2 mt-4 mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "rgba(194,138,30,0.12)", border: "1px solid rgba(194,138,30,0.32)", color: T.accent }}>{i + 1}</div>
                    <p className="text-[15px] font-medium text-foreground">{s.title}</p>
                  </div>
                  <p className="text-[12.5px] sm:text-[13px] text-muted-foreground leading-relaxed pl-8">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionBlock>
  );
}
