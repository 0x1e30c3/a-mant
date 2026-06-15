"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Activity } from "lucide-react";
import { GlassCard, SectionLabel, A } from "@/components/app/ui";

type SignalData = {
  label: string;
  value: string;
  change: "up" | "down" | "stable";
  changeValue?: string;
};

type ReasoningData = {
  timestamp: number;
  signals: SignalData[];
  decision: string;
  confidence: number;
};

export function ReasoningLog({ className }: { className?: string }) {
  const [data, setData] = useState<ReasoningData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReasoning = async () => {
      try {
        const res = await fetch("/api/reasoning");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch reasoning:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReasoning();
    const interval = setInterval(fetchReasoning, 60 * 1000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <GlassCard className={className}>
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-lg animate-pulse" style={{ background: "rgba(20,20,30,0.06)" }} />
            <div className="h-3 w-24 rounded animate-pulse" style={{ background: "rgba(20,20,30,0.06)" }} />
          </div>
          <div className="h-2.5 w-32 rounded animate-pulse" style={{ background: "rgba(20,20,30,0.04)" }} />
        </div>
      </GlassCard>
    );
  }

  if (!data) return null;

  const timeAgo = Math.floor((Date.now() - data.timestamp) / 1000 / 60);

  return (
    <GlassCard className={className}>
      <button
        onClick={() => setIsExpanded((e) => !e)}
        className="w-full px-4 py-3.5 flex items-center justify-between group"
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(194,138,30,0.1)", border: "1px solid rgba(194,138,30,0.22)" }}
          >
            <Activity size={12} style={{ color: A.accent }} />
          </span>
          <div className="text-left">
            <SectionLabel className="mb-0.5">Horizon signals</SectionLabel>
            <p className="text-[11px]" style={{ color: "rgba(20,20,30,0.45)" }}>
              {timeAgo < 1 ? "Just now" : `${timeAgo} min ago`}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} style={{ color: "rgba(20,20,30,0.35)" }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(20,20,30,0.06)" }}>
              {/* Signals table */}
              <div className="mt-3 space-y-2.5">
                {data.signals.map((signal, i) => {
                  const arrow = signal.change === "up" ? "↑" : signal.change === "down" ? "↓" : "→";
                  const changeColor =
                    signal.change === "up"
                      ? "hsl(var(--positive))"
                      : signal.change === "down"
                      ? "hsl(var(--warning))"
                      : "rgba(20,20,30,0.4)";

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: "rgba(20,20,30,0.025)", border: "1px solid rgba(20,20,30,0.05)" }}
                    >
                      <span className="text-[11.5px] text-foreground font-medium">{signal.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11.5px] text-foreground">{signal.value}</span>
                        <span className="text-[11px] font-semibold min-w-[48px] text-right" style={{ color: changeColor }}>
                          {arrow} {signal.changeValue || (signal.change === "stable" ? "stable" : "")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Decision */}
              <div className="mt-3 px-3 py-2.5 rounded-lg" style={{ background: "rgba(194,138,30,0.08)", border: "1px solid rgba(194,138,30,0.18)" }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(194,138,30,0.7)" }}>
                  Decision
                </p>
                <p className="text-[12px] text-foreground font-medium">{data.decision}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(20,20,30,0.08)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${data.confidence}%`,
                        background: data.confidence > 70 ? "hsl(var(--positive))" : "hsl(var(--warning))",
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: "rgba(20,20,30,0.5)" }}>
                    {data.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
