"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { A } from "@/components/app/ui";

type MoodLevel = 0 | 1 | 2 | 3;

const MOODS = [
  { label: "Calm market", description: "AI optimizing for yield", color: "hsl(var(--positive))", bg: "rgba(64,200,120,0.12)", border: "rgba(64,200,120,0.25)" },
  { label: "Mild tension", description: "AI watching closely", color: "hsl(var(--warning))", bg: "rgba(255,190,60,0.12)", border: "rgba(255,190,60,0.3)" },
  { label: "Elevated risk", description: "AI in protection mode", color: "rgba(255,140,30,1)", bg: "rgba(255,140,30,0.12)", border: "rgba(255,140,30,0.3)" },
  { label: "High stress", description: "AI shifted to safety", color: "rgba(255,70,70,1)", bg: "rgba(255,70,70,0.12)", border: "rgba(255,70,70,0.3)" },
] as const;

export function RiskMood({ className }: { className?: string }) {
  const [mood, setMood] = useState<MoodLevel>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMood = async () => {
      try {
        const res = await fetch("/api/mood");
        if (res.ok) {
          const data = await res.json();
          setMood(data.moodLevel as MoodLevel);
        }
      } catch (err) {
        console.error("Failed to fetch mood:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMood();
    const interval = setInterval(fetchMood, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  const current = MOODS[mood];

  if (isLoading) {
    return (
      <div
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "7px 14px",
          borderRadius: "12px",
          background: "rgba(20,20,30,0.05)",
          border: "1px solid rgba(20,20,30,0.1)",
        }}
      >
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "rgba(20,20,30,0.2)" }} />
        <span className="text-[11.5px] font-medium" style={{ color: "rgba(20,20,30,0.4)" }}>
          Reading signals...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 14px",
        borderRadius: "12px",
        background: current.bg,
        border: `1px solid ${current.border}`,
      }}
    >
      {/* Mood indicator dot */}
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          background: current.color,
          boxShadow: `0 0 6px ${current.color}80`,
        }}
      />

      {/* Label */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
        <span className="text-[11.5px] font-semibold leading-tight" style={{ color: current.color }}>
          {current.label}
        </span>
        <span className="hidden sm:inline text-[11.5px] leading-tight" style={{ color: "rgba(20,20,30,0.35)" }}>
          ·
        </span>
        <span className="text-[10.5px] leading-tight" style={{ color: "rgba(20,20,30,0.5)" }}>
          {current.description}
        </span>
      </div>
    </motion.div>
  );
}
