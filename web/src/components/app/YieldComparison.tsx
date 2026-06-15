"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { GlassCard, SectionLabel, A } from "@/components/app/ui";

type ComparisonData = {
  amant: { apy: string; yearlyOn1k: string };
  savings: { apy: string; yearlyOn1k: string };
  tbill: { apy: string; yearlyOn1k: string };
};

export function YieldComparison({ className }: { className?: string }) {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/yield-comparison");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch yield comparison:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Refresh daily
    const interval = setInterval(fetchData, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <GlassCard className={className}>
        <div className="p-5">
          <div className="h-4 w-40 rounded animate-pulse mb-4" style={{ background: "rgba(20,20,30,0.06)" }} />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: "rgba(20,20,30,0.04)" }} />
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  if (!data) return null;

  const items = [
    { label: "a-MANT", apy: data.amant.apy, yearly: data.amant.yearlyOn1k, liquidity: "Daily", highlight: true },
    { label: "US Savings", apy: data.savings.apy, yearly: data.savings.yearlyOn1k, liquidity: "7 days", highlight: false },
    { label: "T-Bill", apy: data.tbill.apy, yearly: data.tbill.yearlyOn1k, liquidity: "Monthly", highlight: false },
  ];

  return (
    <GlassCard className={className}>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(194,138,30,0.1)", border: "1px solid rgba(194,138,30,0.22)" }}
          >
            <TrendingUp size={13} style={{ color: A.accent }} />
          </span>
          <SectionLabel>Your money working harder</SectionLabel>
        </div>

        <div className="space-y-2.5">
          {items.map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 py-3.5 rounded-xl"
              style={
                item.highlight
                  ? { background: "rgba(194,138,30,0.08)", border: "1.5px solid rgba(194,138,30,0.3)" }
                  : { background: "rgba(20,20,30,0.03)", border: "1px solid rgba(20,20,30,0.07)" }
              }
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[12.5px] font-semibold"
                  style={{ color: item.highlight ? A.accent : "rgba(20,20,30,0.7)" }}
                >
                  {item.label}
                </span>
                <span
                  className="text-[16px] font-semibold"
                  style={{ color: item.highlight ? "hsl(var(--positive))" : "rgba(20,20,30,0.6)" }}
                >
                  {item.apy}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: "rgba(20,20,30,0.45)" }}>
                  ${item.yearly}/yr on $1,000
                </span>
                <span className="text-[11px]" style={{ color: "rgba(20,20,30,0.45)" }}>
                  {item.liquidity}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-[10.5px] text-center mt-4 leading-relaxed" style={{ color: "rgba(20,20,30,0.4)" }}>
          Rates updated daily from on-chain data and FRED API
        </p>
      </div>
    </GlassCard>
  );
}
