"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { GlassCard, SectionLabel, A } from "@/components/app/ui";
import { useTotalValue, useVaultPosition } from "@/hooks/useVault";
import { formatUnits } from "viem";

function calculateGoalTimeline(
  currentValue: number,
  goalAmount: number,
  monthlyDeposit: number,
  apy: number
): { months: number; totalDeposited: number; yieldEarned: number } {
  if (currentValue >= goalAmount) {
    return { months: 0, totalDeposited: 0, yieldEarned: 0 };
  }

  const monthlyRate = apy / 12 / 100;
  let balance = currentValue;
  let months = 0;
  let totalDeposited = 0;

  // Simulate month by month (max 600 months = 50 years)
  while (balance < goalAmount && months < 600) {
    balance += monthlyDeposit;
    balance *= 1 + monthlyRate; // Apply monthly compound interest
    totalDeposited += monthlyDeposit;
    months++;
  }

  const yieldEarned = balance - currentValue - totalDeposited;

  return {
    months,
    totalDeposited,
    yieldEarned: Math.max(0, yieldEarned),
  };
}

function formatDate(monthsFromNow: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function GoalSimulator({ className }: { className?: string }) {
  const { totalFormatted } = useTotalValue();
  const { position } = useVaultPosition();
  const [monthlyDeposit, setMonthlyDeposit] = useState(50);

  const currentValue = parseFloat(totalFormatted);
  const goalAmount = position?.goalAmount
    ? parseFloat(formatUnits(position.goalAmount, 18))
    : 2000;

  const apy = 4.3; // Average APY (could pull from useAPY hook)

  const result = calculateGoalTimeline(currentValue, goalAmount, monthlyDeposit, apy);

  if (!position || !position.goalAmount || position.goalAmount === 0n) {
    return null; // Don't show if no goal set
  }

  return (
    <GlassCard className={className}>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(64,200,120,0.1)", border: "1px solid rgba(64,200,120,0.22)" }}
          >
            <Target size={13} style={{ color: "hsl(var(--positive))" }} />
          </span>
          <SectionLabel>Reach your goal faster</SectionLabel>
        </div>

        {/* Goal summary */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div
            className="px-3 py-2.5 rounded-lg"
            style={{ background: "rgba(20,20,30,0.03)", border: "1px solid rgba(20,20,30,0.06)" }}
          >
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(20,20,30,0.4)" }}>
              Goal
            </p>
            <p className="text-[14px] font-semibold text-foreground leading-none">
              ${goalAmount.toFixed(0)}
            </p>
          </div>
          <div
            className="px-3 py-2.5 rounded-lg"
            style={{ background: "rgba(20,20,30,0.03)", border: "1px solid rgba(20,20,30,0.06)" }}
          >
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(20,20,30,0.4)" }}>
              Current
            </p>
            <p className="text-[14px] font-semibold text-foreground leading-none">
              ${currentValue.toFixed(0)}
            </p>
          </div>
          <div
            className="px-3 py-2.5 rounded-lg"
            style={{ background: "rgba(64,200,120,0.08)", border: "1px solid rgba(64,200,120,0.2)" }}
          >
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(64,200,120,0.7)" }}>
              APY
            </p>
            <p className="text-[14px] font-semibold leading-none" style={{ color: "hsl(var(--positive))" }}>
              {apy}%
            </p>
          </div>
        </div>

        {/* Slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[11.5px] font-medium text-foreground">
              Monthly deposit
            </label>
            <span className="text-[15px] font-semibold" style={{ color: A.accent }}>
              ${monthlyDeposit}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${A.accent} 0%, ${A.accent} ${
                (monthlyDeposit / 500) * 100
              }%, rgba(20,20,30,0.08) ${(monthlyDeposit / 500) * 100}%, rgba(20,20,30,0.08) 100%)`,
            }}
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px]" style={{ color: "rgba(20,20,30,0.4)" }}>$0</span>
            <span className="text-[10px]" style={{ color: "rgba(20,20,30,0.4)" }}>$500</span>
          </div>
        </div>

        {/* Results */}
        <motion.div
          key={monthlyDeposit}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-4 rounded-xl"
          style={{ background: "rgba(194,138,30,0.08)", border: "1px solid rgba(194,138,30,0.22)" }}
        >
          <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: "rgba(194,138,30,0.7)" }}>
            Timeline
          </p>

          {result.months === 0 ? (
            <p className="text-[15px] font-semibold text-foreground mb-3">Goal already reached!</p>
          ) : result.months >= 600 ? (
            <p className="text-[15px] font-semibold text-foreground mb-3">
              Add more per month to reach sooner
            </p>
          ) : (
            <>
              <p className="text-[20px] font-light text-foreground leading-tight mb-1">
                {result.months} months
              </p>
              <p className="text-[12px] mb-3" style={{ color: "rgba(20,20,30,0.5)" }}>
                {formatDate(result.months)}
              </p>
            </>
          )}

          {result.months > 0 && result.months < 600 && (
            <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: "1px solid rgba(20,20,30,0.08)" }}>
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(20,20,30,0.4)" }}>
                  Total deposited
                </p>
                <p className="text-[13px] font-semibold text-foreground">
                  ${result.totalDeposited.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(20,20,30,0.4)" }}>
                  Yield earned
                </p>
                <p className="text-[13px] font-semibold" style={{ color: "hsl(var(--positive))" }}>
                  ${result.yieldEarned.toFixed(0)}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </GlassCard>
  );
}
