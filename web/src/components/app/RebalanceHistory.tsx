"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, Coins } from "lucide-react";
import Link from "next/link";
import { GlassCard, SectionLabel, A } from "@/components/app/ui";
import { useChapters } from "@/hooks/useAgent";

function timeAgo(timestamp: bigint): string {
  const seconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 30) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const CHAPTER_ICONS = {
  0: TrendingUp, // REBALANCE
  1: Shield,     // PROTECTION
  2: TrendingUp, // MILESTONE
  3: TrendingUp, // YIELD_CLAIM
  4: Coins,      // INITIAL_DEPOSIT
};

const CHAPTER_LABELS = {
  0: "Rebalanced",
  1: "Protection mode",
  2: "Milestone",
  3: "Yield claimed",
  4: "Initial deposit",
};

export function RebalanceHistory({ className }: { className?: string }) {
  const { chapters } = useChapters();

  if (chapters.length === 0) return null;

  // Get last 5 chapters
  const recentChapters = [...chapters]
    .reverse()
    .slice(0, 5);

  return (
    <GlassCard className={className}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Recent activity</SectionLabel>
          <Link
            href="/app/chronicle"
            className="text-[11px] font-medium transition-colors hover:opacity-80"
            style={{ color: A.accent }}
          >
            View all →
          </Link>
        </div>

        <div className="space-y-2">
          {recentChapters.map((chapter, i) => {
            const Icon = CHAPTER_ICONS[chapter.chapterType] || TrendingUp;
            const label = CHAPTER_LABELS[chapter.chapterType] || "Event";
            const hasImpact = chapter.impactAmount > 0n;
            const impact = hasImpact ? (Number(chapter.impactAmount) / 1e18).toFixed(4) : null;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-opacity-60"
                style={{ background: "rgba(20,20,30,0.03)", border: "1px solid rgba(20,20,30,0.06)" }}
              >
                {/* Icon */}
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(194,138,30,0.1)", border: "1px solid rgba(194,138,30,0.2)" }}
                >
                  <Icon size={12} style={{ color: A.accent }} />
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[12px] font-medium text-foreground truncate">
                      {label}
                    </p>
                    {hasImpact && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ color: "hsl(var(--positive))", background: "rgba(64,200,120,0.12)" }}
                      >
                        +${impact}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] truncate" style={{ color: "rgba(20,20,30,0.5)" }}>
                    {chapter.title}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-[10px] flex-shrink-0" style={{ color: "rgba(20,20,30,0.4)" }}>
                  {timeAgo(chapter.timestamp)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
