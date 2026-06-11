"use client";

import { motion } from "framer-motion";
import { useChapters } from "@/hooks/useAgent";
import { Chapter, CHAPTER_TYPE_LABELS, ChapterType } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_ACCENT: Record<ChapterType, string> = {
  0: "text-accent",
  1: "text-protective",
  2: "text-positive",
  3: "text-positive",
  4: "text-muted-foreground",
};

const TYPE_DOT: Record<ChapterType, string> = {
  0: "bg-accent",
  1: "bg-protective",
  2: "bg-positive",
  3: "bg-positive",
  4: "bg-border",
};

function timeAgo(timestamp: bigint): string {
  const seconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function ChapterCard({ chapter, index }: { chapter: Chapter; index: number }) {
  const isLast = index === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="flex gap-4"
    >
      {/* Timeline */}
      <div className="flex flex-col items-center pt-1">
        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", TYPE_DOT[chapter.chapterType])} />
        {!isLast && <div className="w-px flex-1 bg-border mt-2" />}
      </div>

      {/* Content */}
      <div className="pb-8 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={cn("text-xs font-medium", TYPE_ACCENT[chapter.chapterType])}>
            {CHAPTER_TYPE_LABELS[chapter.chapterType]}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {timeAgo(chapter.timestamp)}
          </span>
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1.5">{chapter.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{chapter.narrative}</p>
        {chapter.impactAmount > 0n && (
          <p className="text-xs text-positive mt-2">
            +${(Number(chapter.impactAmount) / 1e18).toFixed(4)} impact
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function ChroniclePage() {
  const { chapters, isLoading } = useChapters();

  const sorted = [...chapters].reverse();

  return (
    <div className="px-5 py-8 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 space-y-1"
      >
        <h1 className="text-2xl font-light text-foreground">Chronicle</h1>
        <p className="text-sm text-muted-foreground">
          Every decision Axiom makes, written as your savings story.
        </p>
      </motion.div>

      {isLoading && (
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="pt-1 flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-border animate-pulse" />
              </div>
              <div className="flex-1 space-y-2 pb-8">
                <div className="h-3 w-16 bg-border rounded animate-pulse" />
                <div className="h-4 w-48 bg-border rounded animate-pulse" />
                <div className="h-3 w-full bg-border rounded animate-pulse" />
                <div className="h-3 w-4/5 bg-border rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && sorted.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-muted-foreground text-sm">
            Your chronicle begins with the first deposit.
          </p>
        </div>
      )}

      {!isLoading && sorted.length > 0 && (
        <div>
          {sorted.map((chapter, i) => (
            <ChapterCard key={i} chapter={chapter} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
