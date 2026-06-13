"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpRight, ShieldCheck, Coins, Zap, TrendingUp, BookOpen, Lock } from "lucide-react";
import { GlassCard, Pill, SectionLabel, LiveDot, A } from "@/components/app/ui";
import { DepositModal } from "@/components/app/DepositModal";
import { GrowthChart } from "@/components/app/GrowthChart";
import { useTotalValue, useVaultPosition, usePendingYield } from "@/hooks/useVault";
import { useAgentProfile, useChapters } from "@/hooks/useAgent";
import { CHAPTER_TYPE_LABELS, RISK_LABELS, RiskMode } from "@/types";
import { formatUnits } from "viem";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const fmt = (n: string) =>
  parseFloat(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [depositOpen, setDepositOpen] = useState(false);

  useEffect(() => {
    if (!isConnected) router.replace("/onboard");
  }, [isConnected, router]);

  const { totalFormatted, isLoading: valueLoading } = useTotalValue();
  const { position } = useVaultPosition();
  const { yieldFormatted } = usePendingYield();
  const { profile, hasAgent } = useAgentProfile();
  const { latestChapter } = useChapters();

  const goalPct =
    position?.active && position.goalAmount > 0n
      ? Math.min(100, (parseFloat(totalFormatted) / parseFloat(formatUnits(position.goalAmount, 18))) * 100)
      : 0;

  const hasYield = parseFloat(yieldFormatted) > 0;

  return (
    <div className="pt-6 lg:pt-8">
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />

      {/* ── Two-column grid ── */}
      <div className="grid lg:grid-cols-3 gap-4 lg:items-stretch">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Balance hero */}
          <motion.div {...fade(0)}>
            <GlassCard glow className="p-6 sm:p-8" brackets="all">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 70% 80% at 80% 0%, rgba(255,205,90,0.16) 0%, transparent 60%)" }}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel>Portfolio value</SectionLabel>
                  <Pill tone="positive">
                    <LiveDot /> Live
                  </Pill>
                </div>

                <div className="text-[3.25rem] sm:text-[4rem] leading-none font-light tracking-tight text-foreground">
                  {valueLoading ? (
                    <span style={{ color: "rgba(20,20,30,0.2)" }}>—</span>
                  ) : (
                    <>
                      <span className="text-[1.6rem] sm:text-[2rem] align-top mr-1" style={{ color: "rgba(20,20,30,0.4)" }}>$</span>
                      {fmt(totalFormatted)}
                    </>
                  )}
                </div>

                {/* Goal progress */}
                {position?.active && position.goalAmount > 0n && (
                  <div className="mt-6 max-w-md">
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="text-muted-foreground">Savings goal</span>
                      <span className="text-foreground font-medium">{Math.round(goalPct)}%</span>
                    </div>
                    <div className="h-[4px] rounded-full overflow-hidden" style={{ background: "rgba(20,20,30,0.08)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${goalPct}%` }}
                        transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                        style={{ background: "linear-gradient(90deg, hsl(var(--accent)) 0%, rgba(255,190,60,0.5) 100%)" }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      ${fmt(totalFormatted)} of ${fmt(formatUnits(position.goalAmount, 18))}
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick actions */}
          <motion.div {...fade(0.06)}>
            <button
              onClick={() => setDepositOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl transition-all active:scale-[0.98]"
              style={{ background: "rgba(194,138,30,0.12)", border: "1px solid rgba(194,138,30,0.3)" }}
            >
              <ArrowDownToLine size={16} style={{ color: A.accent }} />
              <span className="text-[13px] font-semibold" style={{ color: A.accent }}>Deposit</span>
            </button>
          </motion.div>

          {/* Allocation */}
          {position && (
            <motion.div {...fade(0.12)} className="grid grid-cols-2 gap-2.5">
              <AllocCard
                dot={A.accent}
                label="USDY"
                sub="Treasury · 4.5% APY"
                value={`$${fmt(formatUnits(position.usdyAmount, 18))}`}
              />
              <AllocCard
                dot="hsl(var(--protective))"
                label="mETH"
                sub="Staking · 3.8% APY"
                value={parseFloat(formatUnits(position.methAmount, 18)).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
              />
            </motion.div>
          )}

          {/* Claimable yield */}
          {hasYield && (
            <motion.div {...fade(0.16)}>
              <GlassCard className="p-5 flex items-center justify-between" style={{ borderColor: "rgba(64,200,120,0.22)" }}>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(64,200,120,0.1)", border: "1px solid rgba(64,200,120,0.22)" }}>
                    <Coins size={16} style={{ color: "hsl(var(--positive))" }} />
                  </span>
                  <div>
                    <SectionLabel>Claimable yield</SectionLabel>
                    <p className="text-[18px] font-medium text-positive mt-0.5 leading-none">
                      +${parseFloat(yieldFormatted).toFixed(4)}
                    </p>
                  </div>
                </div>
                <button
                  className="px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95"
                  style={{ background: A.accent, color: A.onAccent }}
                >
                  Claim
                </button>
              </GlassCard>
            </motion.div>
          )}

          {/* Empty state */}
          {!position && !valueLoading && (
            <motion.div {...fade(0.1)}>
              <GlassCard className="px-6 py-14 text-center" brackets="all">
                <span className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(194,138,30,0.1)", border: "1px solid rgba(194,138,30,0.28)" }}>
                  <ArrowDownToLine size={20} style={{ color: A.accent }} />
                </span>
                <p className="text-[15px] text-foreground font-medium mb-1.5">No position yet</p>
                <p className="text-[13px] text-muted-foreground mb-6 max-w-[260px] mx-auto leading-relaxed">
                  Make your first deposit and Axiom starts working for you — automatically.
                </p>
                <button
                  onClick={() => setDepositOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold transition-all active:scale-95"
                  style={{ background: A.accent, color: A.onAccent }}
                >
                  Make your first deposit →
                </button>
              </GlassCard>
            </motion.div>
          )}

          {/* Growth chart — flex-1 fills remaining height to match side column */}
          <motion.div {...fade(0.2)} className="flex-1 min-h-0">
            <GrowthChart principal={parseFloat(totalFormatted)} />
          </motion.div>
        </div>

        {/* ── Side column ── */}
        <div className="space-y-4">
          {/* Axiom status */}
          {hasAgent && profile ? (
            <motion.div {...fade(0.2)}>
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(194,138,30,0.12)", border: "1px solid rgba(194,138,30,0.28)" }}>
                      <ShieldCheck size={14} style={{ color: A.accent }} />
                    </span>
                    <p className="text-[14px] font-semibold text-foreground">Axiom</p>
                  </div>
                  <Pill tone="accent">{profile.totalDecisions.toString()} decisions</Pill>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Metric label="Risk mode" value={RISK_LABELS[(position?.riskMode ?? 0) as RiskMode]} />
                  <Metric label="Reputation" value={profile.reputationScore.toString()} />
                  <Metric label="Total impact" value={`$${parseFloat(formatUnits(profile.totalImpact, 18)).toFixed(2)}`} />
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            /* Axiom agent teaser card */
            <motion.div {...fade(0.2)}>
              <GlassCard className="overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 80% 60% at 100% 0%, rgba(194,138,30,0.13) 0%, transparent 70%)" }}
                />
                {/* Video banner */}
                <div className="relative w-full overflow-hidden" style={{ height: "160px", borderBottom: "1px solid rgba(194,138,30,0.12)" }}>
                  <video
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(250,248,243,0.9) 100%)" }}
                  />
                  <div className="absolute top-3 right-3">
                    <Pill tone="accent">AI-powered</Pill>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                    Axiom monitors macro signals and on-chain data every 15 min — rebalancing your portfolio automatically.
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { icon: Zap, label: "Auto-rebalance" },
                      { icon: TrendingUp, label: "Yield boost" },
                      { icon: Lock, label: "Protected" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl" style={{ background: "rgba(20,20,30,0.04)", border: "1px solid rgba(20,20,30,0.06)" }}>
                        <Icon size={14} style={{ color: A.accent }} />
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
                      </div>
                    ))}
                  </div>
                  <Pill tone="accent">Activates on first deposit</Pill>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Latest chapter */}
          {latestChapter ? (
            <motion.div {...fade(0.26)}>
              <Link href="/app/chronicle">
                <GlassCard className="p-5 group">
                  <div className="flex items-center justify-between mb-3">
                    <SectionLabel>Latest chapter</SectionLabel>
                    <div className="flex items-center gap-2">
                      <Pill tone="accent">{CHAPTER_TYPE_LABELS[latestChapter.chapterType]}</Pill>
                      <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                  <p className="text-[14px] font-medium text-foreground mb-1.5">{latestChapter.title}</p>
                  <p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-3">{latestChapter.narrative}</p>
                </GlassCard>
              </Link>
            </motion.div>
          ) : (
            /* Chronicle teaser card */
            <motion.div {...fade(0.28)}>
              <Link href="/app/chronicle">
                <GlassCard className="p-5 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(20,20,30,0.06)", border: "1px solid rgba(20,20,30,0.08)" }}>
                        <BookOpen size={13} className="text-muted-foreground" />
                      </span>
                      <SectionLabel>Chronicle</SectionLabel>
                    </div>
                    <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                    Every Axiom decision becomes a chapter — a permanent on-chain record of your portfolio&apos;s story.
                  </p>
                  <div className="space-y-2">
                    {["Chapter I will appear here", "Chapter II — after your first deposit"].map((t, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: "rgba(20,20,30,0.04)", border: "1px solid rgba(20,20,30,0.06)", opacity: 1 - i * 0.35 }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "rgba(194,138,30,0.4)" }} />
                        <p className="text-[11.5px] text-muted-foreground">{t}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          )}

          {/* APY overview card */}
          <motion.div {...fade(0.34)}>
            <GlassCard className="p-5">
              <SectionLabel className="mb-4">Current APY rates</SectionLabel>
              <div className="space-y-3">
                {[
                  { label: "USDY", sub: "Ondo Finance · Treasury", apy: "4.5%", dot: A.accent },
                  { label: "mETH", sub: "Mantle · ETH Staking", apy: "3.8%", dot: "hsl(var(--protective))" },
                ].map(({ label, sub, apy, dot }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{label}</p>
                        <p className="text-[11px] text-muted-foreground">{sub}</p>
                      </div>
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: "hsl(var(--positive))" }}>{apy}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function AllocCard({ dot, label, sub, value }: { dot: string; label: string; sub: string; value: string }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
        <SectionLabel>{label}</SectionLabel>
      </div>
      <p className="text-[22px] font-light text-foreground leading-none mb-2">{value}</p>
      <p className="text-[11px] text-positive">{sub}</p>
    </GlassCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-[13px] text-foreground font-medium">{value}</p>
    </div>
  );
}
