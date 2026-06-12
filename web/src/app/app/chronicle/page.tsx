"use client";

import { motion } from "framer-motion";
import { useChapters } from "@/hooks/useAgent";
import { Chapter, CHAPTER_TYPE_LABELS, ChapterType } from "@/types";
import { GlassCard, SectionLabel } from "@/components/app/ui";

const TYPE_COLOR: Record<ChapterType, string> = {
  0: "hsl(var(--accent))",
  1: "hsl(var(--protective))",
  2: "hsl(var(--positive))",
  3: "hsl(var(--positive))",
  4: "rgba(255,255,255,0.5)",
};

function timeAgo(timestamp: bigint): string {
  const seconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function ChapterCard({ chapter, index, isLast }: { chapter: Chapter; index: number; isLast: boolean }) {
  const color = TYPE_COLOR[chapter.chapterType];
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-4"
    >
      {/* Timeline rail */}
      <div className="flex flex-col items-center pt-1.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
        {!isLast && <span className="w-px flex-1 mt-1.5" style={{ background: "rgba(255,255,255,0.08)" }} />}
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 pb-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full" style={{ color, background: `color-mix(in srgb, ${color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)` }}>
              {CHAPTER_TYPE_LABELS[chapter.chapterType]}
            </span>
            <span className="text-[11px] text-muted-foreground flex-shrink-0">{timeAgo(chapter.timestamp)}</span>
          </div>
          <h3 className="text-[14px] font-medium text-foreground mb-1.5">{chapter.title}</h3>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed">{chapter.narrative}</p>
          {chapter.impactAmount > 0n && (
            <p className="text-[12px] text-positive mt-2.5 font-medium">
              +${(Number(chapter.impactAmount) / 1e18).toFixed(4)} impact
            </p>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
}

export default function ChroniclePage() {
  const { chapters, isLoading } = useChapters();
  const sorted = [...chapters].reverse();

  return (
    <div className="pt-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <SectionLabel className="mb-2">Your savings story</SectionLabel>
        <h1 className="text-[1.8rem] font-light tracking-tight text-foreground leading-tight">Chronicle</h1>
        <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed max-w-[340px]">
          Every decision Axiom makes, written as a chapter you can actually read.
        </p>
      </motion.div>

      {isLoading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="pt-1.5 flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.12)" }} />
              </div>
              <div className="flex-1 pb-4">
                <GlassCard className="p-4 space-y-2">
                  <div className="h-3 w-16 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
                  <div className="h-4 w-44 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
                  <div className="h-3 w-full rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
                </GlassCard>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && sorted.length === 0 && (
        <GlassCard className="px-6 py-16 text-center" brackets="all">
          <p className="text-[14px] text-foreground font-medium mb-1.5">No chapters yet</p>
          <p className="text-[12.5px] text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
            Your chronicle begins the moment you make your first deposit.
          </p>
        </GlassCard>
      )}

      {!isLoading && sorted.length > 0 && (
        <div>
          {sorted.map((chapter, i) => (
            <ChapterCard key={i} chapter={chapter} index={i} isLast={i === sorted.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}
