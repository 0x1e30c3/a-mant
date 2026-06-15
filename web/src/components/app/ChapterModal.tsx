"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, ShieldCheck, Zap, Award, ArrowDownToLine, Globe, Share2 } from "lucide-react";
import { Chapter, CHAPTER_TYPE_LABELS, ChapterType } from "@/types";
import { A } from "@/components/app/ui";
import { ShareChapter } from "@/components/app/ShareChapter";

const TYPE_META: Record<ChapterType, { color: string; icon: React.ElementType; bg: string }> = {
  0: { color: "hsl(var(--accent))",      icon: TrendingUp,      bg: "rgba(194,138,30,0.1)"  },
  1: { color: "hsl(var(--protective))",  icon: ShieldCheck,     bg: "rgba(100,160,255,0.1)" },
  2: { color: "hsl(var(--positive))",    icon: Award,           bg: "rgba(64,200,120,0.1)"  },
  3: { color: "hsl(var(--positive))",    icon: Zap,             bg: "rgba(64,200,120,0.1)"  },
  4: { color: "rgba(20,20,30,0.6)",      icon: ArrowDownToLine, bg: "rgba(20,20,30,0.06)"   },
};

function timeAgo(timestamp: bigint): string {
  const seconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 30) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTimestamp(ts: bigint): string {
  return new Date(Number(ts) * 1000).toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function ChapterModal({
  chapter,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  chapter: Chapter | null;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [shareOpen, setShareOpen] = useState(false);

  if (!chapter) return null;

  const meta    = TYPE_META[chapter.chapterType];
  const Icon    = meta.icon;
  const hasImpact    = chapter.impactAmount > 0n;
  const hasContext   = chapter.worldContext && chapter.worldContext.length > 0;
  const impact       = hasImpact ? (Number(chapter.impactAmount) / 1e18).toFixed(4) : null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(14,13,11,0.5)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full sm:max-w-[480px] rounded-t-[28px] sm:rounded-[28px] overflow-hidden flex flex-col"
          style={{
            background: "hsl(var(--background))",
            border: `1px solid ${A.cardBorder}`,
            boxShadow: "0 32px 80px rgba(14,13,11,0.25), 0 0 0 1px rgba(255,255,255,0.05) inset",
            maxHeight: "92dvh",
          }}
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0,  opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-x-0 top-0 h-52 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 90% 100% at 50% -10%, ${meta.color}22 0%, transparent 65%)` }}
          />

          {/* ── Header ── */}
          <div className="relative flex items-start justify-between px-6 pt-6 pb-5 flex-shrink-0" style={{ borderBottom: `1px solid rgba(20,20,30,0.07)` }}>
            <div className="flex items-start gap-3.5">
              <span
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: meta.bg, border: `1.5px solid ${meta.color}35` }}
              >
                <Icon size={17} style={{ color: meta.color }} />
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full"
                    style={{ color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
                  >
                    {CHAPTER_TYPE_LABELS[chapter.chapterType]}
                  </span>
                  <span className="text-[11px]" style={{ color: "rgba(20,20,30,0.38)" }}>
                    Chapter {total - index} of {total}
                  </span>
                </div>
                <h2 className="text-[16px] font-semibold text-foreground leading-snug pr-8">
                  {chapter.title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              style={{ background: "rgba(20,20,30,0.06)" }}
              aria-label="Close"
            >
              <X size={14} style={{ color: "rgba(20,20,30,0.5)" }} />
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="px-6 py-5 space-y-5">

              {/* Timestamp */}
              <p className="text-[11.5px]" style={{ color: "rgba(20,20,30,0.4)" }}>
                {formatTimestamp(chapter.timestamp)}
              </p>

              {/* Narrative */}
              <div
                className="px-4 py-4 rounded-2xl"
                style={{ background: "rgba(20,20,30,0.03)", border: "1px solid rgba(20,20,30,0.07)" }}
              >
                <p className="text-[10px] uppercase tracking-wider mb-2.5" style={{ color: "rgba(20,20,30,0.35)" }}>
                  Axiom&apos;s Narrative
                </p>
                <p className="text-[13.5px] text-foreground leading-[1.75]">
                  {chapter.narrative}
                </p>
              </div>

              {/* Impact */}
              {hasImpact && (
                <div
                  className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
                  style={{ background: "rgba(64,200,120,0.07)", border: "1px solid rgba(64,200,120,0.2)" }}
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(64,200,120,0.7)" }}>
                      Portfolio impact
                    </p>
                    <p className="text-[22px] font-light leading-none" style={{ color: "hsl(var(--positive))" }}>
                      +${impact}
                    </p>
                  </div>
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(64,200,120,0.12)", border: "1px solid rgba(64,200,120,0.25)" }}
                  >
                    <TrendingUp size={16} style={{ color: "hsl(var(--positive))" }} />
                  </span>
                </div>
              )}

              {/* World context */}
              {hasContext && (
                <div
                  className="px-4 py-4 rounded-2xl"
                  style={{ background: "rgba(100,160,255,0.05)", border: "1px solid rgba(100,160,255,0.15)" }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <Globe size={12} style={{ color: "hsl(var(--protective))" }} />
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "hsl(var(--protective))" }}>
                      World Context
                    </p>
                  </div>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(20,20,30,0.6)" }}>
                    {chapter.worldContext}
                  </p>
                </div>
              )}

              {/* On-chain badge */}
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(20,20,30,0.03)", border: "1px solid rgba(20,20,30,0.07)" }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "hsl(var(--positive))" }} />
                <p className="text-[11px]" style={{ color: "rgba(20,20,30,0.45)" }}>
                  Permanently recorded on Mantle Network · {timeAgo(chapter.timestamp)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Footer navigation ── */}
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(20,20,30,0.07)" }}
          >
            <button
              onClick={onPrev}
              disabled={index === total - 1}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-medium transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              style={{ background: "rgba(20,20,30,0.05)", border: "1px solid rgba(20,20,30,0.08)", color: "rgba(20,20,30,0.6)" }}
            >
              ← Older
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShareOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-medium transition-all active:scale-95"
                style={{ background: "rgba(194,138,30,0.1)", border: "1px solid rgba(194,138,30,0.25)", color: A.accent }}
              >
                <Share2 size={13} />
                Share
              </button>
              <p className="text-[11px]" style={{ color: "rgba(20,20,30,0.35)" }}>
                {index + 1} / {total}
              </p>
            </div>

            <button
              onClick={onNext}
              disabled={index === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-medium transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              style={{ background: "rgba(20,20,30,0.05)", border: "1px solid rgba(20,20,30,0.08)", color: "rgba(20,20,30,0.6)" }}
            >
              Newer →
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Share modal */}
      {shareOpen && <ShareChapter chapter={chapter} onClose={() => setShareOpen(false)} />}
    </AnimatePresence>
  );
}
