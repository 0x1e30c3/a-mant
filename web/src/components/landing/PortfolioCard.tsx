"use client";

import { T } from "./primitives";

// ─── Portfolio card — glass-morphism product showcase ─────────────────────────
export function PortfolioCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 0 60px rgba(255,239,197,0.06)",
      }}
    >
      <div className="flex items-start justify-between px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <p className="text-[9px] uppercase tracking-[0.14em] mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Portfolio value</p>
          <p className="text-[36px] font-light leading-none tracking-tight text-foreground">
            $2,847<span className="text-[22px]" style={{ color: "rgba(255,255,255,0.35)" }}>.50</span>
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
            <span className="text-[11px] text-muted-foreground">Axiom active</span>
          </div>
          <p className="text-[14px] font-semibold text-positive">+$38.20</p>
          <p className="text-[10px] text-muted-foreground">this week</p>
        </div>
      </div>

      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex justify-between text-[11px] text-muted-foreground mb-2">
          <span>Savings goal</span><span className="text-foreground font-medium">57%</span>
        </div>
        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full" style={{ width: "57%", background: "linear-gradient(90deg, hsl(var(--accent)) 0%, rgba(255,190,60,0.45) 100%)" }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">$2,847 of $5,000 · 5 months left</p>
      </div>

      <div className="grid grid-cols-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-5 py-4" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.accent }} />
            <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.3)" }}>USDY</p>
          </div>
          <p className="text-[20px] font-light text-foreground leading-none mb-1">$1,624</p>
          <p className="text-[11px] text-positive">4.5% APY · Treasury</p>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--protective))" }} />
            <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.3)" }}>mETH</p>
          </div>
          <p className="text-[20px] font-light text-foreground leading-none mb-1">0.4821</p>
          <p className="text-[11px] text-positive">3.8% APY · Staking</p>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.3)" }}>Latest chapter</p>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ color: T.accent, background: "rgba(255,239,197,0.08)", border: "1px solid rgba(255,239,197,0.18)" }}>Rebalance</span>
        </div>
        <p className="text-[13px] font-medium text-foreground mb-1.5">A Calculated Move</p>
        <p className="text-[12px] text-muted-foreground leading-relaxed">ETH staking fell to 3.1%. Axiom shifted 35% to USDY, securing +1.4% APY on $623.</p>
        <p className="text-[11px] text-muted-foreground mt-2">2 hours ago</p>
      </div>
    </div>
  );
}
