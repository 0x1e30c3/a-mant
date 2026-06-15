"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, TrendingUp, Shield } from "lucide-react";
import { GlassCard, SectionLabel, A } from "@/components/app/ui";
import { useChapters } from "@/hooks/useAgent";

type DigestData = {
  startDate: number;
  endDate: number;
  decisionsCount: number;
  yieldGenerated: number;
  protectionMoves: number;
  summary: string;
  dismissed: boolean;
};

const DIGEST_STORAGE_KEY = "axiom-weekly-digest";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function generateDigest(chapters: any[]): DigestData | null {
  const now = Date.now();
  const weekAgo = now - WEEK_MS;

  // Get stored digest
  const stored = localStorage.getItem(DIGEST_STORAGE_KEY);
  let lastDigest: DigestData | null = null;

  if (stored) {
    try {
      lastDigest = JSON.parse(stored);
      // If digest is less than 7 days old and not dismissed, don't generate new one
      if (lastDigest && !lastDigest.dismissed && now - lastDigest.endDate < WEEK_MS) {
        return lastDigest;
      }
    } catch (err) {
      console.error("Failed to parse digest:", err);
    }
  }

  // Filter chapters from last week
  const weekChapters = chapters.filter((c) => {
    const ts = Number(c.timestamp) * 1000;
    return ts >= weekAgo && ts <= now;
  });

  if (weekChapters.length === 0) return null;

  const decisionsCount = weekChapters.length;
  const yieldGenerated =
    weekChapters.reduce((sum, c) => sum + Number(c.impactAmount), 0) / 1e18;
  const protectionMoves = weekChapters.filter((c) => c.chapterType === 1).length;

  // Generate summary based on activity
  let summary = "A relatively stable week. ";
  if (protectionMoves > 0) {
    summary += `${protectionMoves} protection ${protectionMoves === 1 ? "move" : "moves"} taken in response to market conditions. `;
  }
  if (yieldGenerated > 0) {
    summary += `Generated $${yieldGenerated.toFixed(2)} in yield through strategic positioning.`;
  } else {
    summary += "Portfolio maintained its allocation strategy.";
  }

  const digest: DigestData = {
    startDate: weekAgo,
    endDate: now,
    decisionsCount,
    yieldGenerated,
    protectionMoves,
    summary,
    dismissed: false,
  };

  return digest;
}

export function WeeklyDigest({ className }: { className?: string }) {
  const { chapters } = useChapters();
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (chapters.length === 0) return;

    const generated = generateDigest(chapters);
    if (generated && !generated.dismissed) {
      setDigest(generated);
      setIsVisible(true);
    }
  }, [chapters]);

  const handleDismiss = () => {
    if (digest) {
      const dismissed = { ...digest, dismissed: true };
      localStorage.setItem(DIGEST_STORAGE_KEY, JSON.stringify(dismissed));
      setIsVisible(false);
    }
  };

  if (!digest || !isVisible) return null;

  const startDate = new Date(digest.startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endDate = new Date(digest.endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <GlassCard
          className="overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(194,138,30,0.08) 0%, rgba(194,138,30,0.03) 100%)" }}
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(194,138,30,0.15)", border: "1px solid rgba(194,138,30,0.3)" }}
                >
                  <Calendar size={13} style={{ color: A.accent }} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-foreground leading-tight">
                    Axiom&apos;s Weekly Report
                  </p>
                  <p className="text-[10.5px]" style={{ color: "rgba(20,20,30,0.5)" }}>
                    {startDate} – {endDate}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg transition-colors hover:bg-opacity-70"
                style={{ background: "rgba(20,20,30,0.05)" }}
              >
                <X size={12} style={{ color: "rgba(20,20,30,0.5)" }} />
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div
                className="px-3 py-2.5 rounded-lg text-center"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(20,20,30,0.08)" }}
              >
                <p className="text-[18px] font-light text-foreground leading-none">
                  {digest.decisionsCount}
                </p>
                <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "rgba(20,20,30,0.5)" }}>
                  Decisions
                </p>
              </div>
              <div
                className="px-3 py-2.5 rounded-lg text-center"
                style={{ background: "rgba(64,200,120,0.1)", border: "1px solid rgba(64,200,120,0.2)" }}
              >
                <p className="text-[18px] font-light leading-none" style={{ color: "hsl(var(--positive))" }}>
                  ${digest.yieldGenerated.toFixed(2)}
                </p>
                <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "rgba(64,200,120,0.7)" }}>
                  Yield
                </p>
              </div>
              <div
                className="px-3 py-2.5 rounded-lg text-center"
                style={{ background: "rgba(100,160,255,0.1)", border: "1px solid rgba(100,160,255,0.2)" }}
              >
                <p className="text-[18px] font-light leading-none" style={{ color: "hsl(var(--protective))" }}>
                  {digest.protectionMoves}
                </p>
                <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "rgba(100,160,255,0.7)" }}>
                  Protection
                </p>
              </div>
            </div>

            {/* Summary */}
            <div
              className="px-4 py-3.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(20,20,30,0.08)" }}
            >
              <p className="text-[12.5px] leading-relaxed text-foreground italic">
                &ldquo;{digest.summary}&rdquo;
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
