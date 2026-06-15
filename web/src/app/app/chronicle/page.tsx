"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useChapters } from "@/hooks/useAgent";
import { Chapter, CHAPTER_TYPE_LABELS, ChapterType } from "@/types";
import { GlassCard, SectionLabel, A } from "@/components/app/ui";
import { ChapterModal } from "@/components/app/ChapterModal";
import { MilestoneNFT } from "@/components/app/MilestoneNFT";
import { TrendingUp, ShieldCheck, Zap, Award, ArrowDownToLine, ArrowUpRight } from "lucide-react";

const TYPE_META: Record<ChapterType, { color: string; icon: React.ElementType }> = {
  0: { color: "hsl(var(--accent))",     icon: TrendingUp      },
  1: { color: "hsl(var(--protective))", icon: ShieldCheck     },
  2: { color: "hsl(var(--positive))",   icon: Award           },
  3: { color: "hsl(var(--positive))",   icon: Zap             },
  4: { color: "rgba(20,20,30,0.45)",    icon: ArrowDownToLine },
};

function timeAgo(timestamp: bigint): string {
  const seconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 30) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ChapterCard({
  chapter,
  index,
  isLast,
  onClick,
}: {
  chapter: Chapter;
  index: number;
  isLast: boolean;
  onClick: () => void;
}) {
  const meta  = TYPE_META[chapter.chapterType];
  const Icon  = meta.icon;
  const color = meta.color;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-4"
    >
      {/* Timeline rail */}
      <div className="flex flex-col items-center pt-2">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
        />
        {!isLast && (
          <span className="w-px flex-1 mt-1.5" style={{ background: "rgba(20,20,30,0.08)" }} />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 pb-4">
        <button
          onClick={onClick}
          className="w-full text-left group"
        >
          <GlassCard className="p-4 transition-all duration-200 group-hover:shadow-md group-active:scale-[0.99]"
            style={{ cursor: "pointer" } as React.CSSProperties}
          >
            {/* Top row */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}14`, border: `1px solid ${color}30` }}
                >
                  <Icon size={12} style={{ color }} />
                </span>
                <span
                  className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full"
                  style={{ color, background: `${color}12`, border: `1px solid ${color}25` }}
                >
                  {CHAPTER_TYPE_LABELS[chapter.chapterType]}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]" style={{ color: "rgba(20,20,30,0.38)" }}>
                  {timeAgo(chapter.timestamp)}
                </span>
                <ArrowUpRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: "rgba(20,20,30,0.25)" }}
                />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-[14px] font-semibold text-foreground mb-1.5 leading-snug">
              {chapter.title}
            </h3>

            {/* Narrative preview */}
            <p className="text-[12.5px] leading-relaxed line-clamp-2" style={{ color: "rgba(20,20,30,0.55)" }}>
              {chapter.narrative}
            </p>

            {/* Impact badge */}
            {chapter.impactAmount > 0n && (
              <div className="flex items-center gap-1.5 mt-3">
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: "hsl(var(--positive))", background: "rgba(64,200,120,0.1)", border: "1px solid rgba(64,200,120,0.22)" }}
                >
                  +${(Number(chapter.impactAmount) / 1e18).toFixed(4)} impact
                </span>
              </div>
            )}

            {/* "Read more" hint */}
            <p
              className="text-[10.5px] mt-2.5 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: A.accent }}
            >
              Tap to read full chapter →
            </p>
          </GlassCard>
        </button>
      </div>
    </motion.div>
  );
}

export default function ChroniclePage() {
  const { chapters, isLoading } = useChapters();
  const sorted = [...chapters].reverse(); // newest first

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [milestoneChapter, setMilestoneChapter] = useState<Chapter | null>(null);

  const handlePrev = () => setSelectedIdx((i) => (i !== null ? Math.min(i + 1, sorted.length - 1) : null));
  const handleNext = () => setSelectedIdx((i) => (i !== null ? Math.max(i - 1, 0) : null));

  const handleChapterClick = (chapter: Chapter, index: number) => {
    if (chapter.chapterType === 2) {
      // MILESTONE - show NFT modal first
      setMilestoneChapter(chapter);
    } else {
      setSelectedIdx(index);
    }
  };

  return (
    <div className="pt-6 max-w-2xl">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <SectionLabel className="mb-1.5">Your savings story</SectionLabel>
        <h1 className="text-[2rem] font-light tracking-tight text-foreground leading-tight">
          Chronicle
        </h1>
        <p className="text-[13px] mt-2 leading-relaxed max-w-[360px]" style={{ color: "rgba(20,20,30,0.5)" }}>
          Every decision Axiom makes — written as a chapter permanently recorded on Mantle.
        </p>

        {/* Stats row */}
        {!isLoading && sorted.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-4 mt-4"
          >
            {[
              { label: "Chapters", value: sorted.length },
              {
                label: "Total impact",
                value: `$${(sorted.reduce((s, c) => s + Number(c.impactAmount), 0) / 1e18).toFixed(4)}`,
              },
              {
                label: "Latest",
                value: sorted[0] ? timeAgo(sorted[0].timestamp) : "—",
              },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-[18px] font-light text-foreground leading-none">{value}</p>
                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(20,20,30,0.38)" }}>{label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="pt-2 flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "rgba(20,20,30,0.1)" }} />
              </div>
              <div className="flex-1 pb-4">
                <GlassCard className="p-4 space-y-2.5">
                  <div className="h-3 w-20 rounded-full animate-pulse" style={{ background: "rgba(20,20,30,0.08)" }} />
                  <div className="h-4 w-48 rounded animate-pulse" style={{ background: "rgba(20,20,30,0.08)" }} />
                  <div className="h-3 w-full rounded animate-pulse" style={{ background: "rgba(20,20,30,0.05)" }} />
                  <div className="h-3 w-3/4 rounded animate-pulse" style={{ background: "rgba(20,20,30,0.05)" }} />
                </GlassCard>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sorted.length === 0 && (
        <GlassCard className="px-6 py-16 text-center" brackets="all">
          <span
            className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(194,138,30,0.08)", border: "1px solid rgba(194,138,30,0.22)" }}
          >
            <Award size={20} style={{ color: A.accent }} />
          </span>
          <p className="text-[14px] font-medium text-foreground mb-1.5">No chapters yet</p>
          <p className="text-[12.5px] leading-relaxed max-w-[260px] mx-auto" style={{ color: "rgba(20,20,30,0.5)" }}>
            Your chronicle begins the moment you make your first deposit. Axiom will write the rest.
          </p>
        </GlassCard>
      )}

      {/* Timeline */}
      {!isLoading && sorted.length > 0 && (
        <div>
          {sorted.map((chapter, i) => (
            <ChapterCard
              key={i}
              chapter={chapter}
              index={i}
              isLast={i === sorted.length - 1}
              onClick={() => handleChapterClick(chapter, i)}
            />
          ))}
        </div>
      )}

      {/* Chapter detail modal */}
      {selectedIdx !== null && (
        <ChapterModal
          chapter={sorted[selectedIdx]}
          index={selectedIdx}
          total={sorted.length}
          onClose={() => setSelectedIdx(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}

      {/* Milestone NFT modal */}
      {milestoneChapter && (
        <MilestoneNFT
          chapter={milestoneChapter}
          onClose={() => {
            setMilestoneChapter(null);
            // Optionally open chapter modal after closing milestone
            const idx = sorted.findIndex((c) => c === milestoneChapter);
            if (idx !== -1) setSelectedIdx(idx);
          }}
        />
      )}
    </div>
  );
}
