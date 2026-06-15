"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Info } from "lucide-react";
import { GlassCard, SectionLabel, A } from "@/components/app/ui";
import { useTotalValue, useVaultPosition } from "@/hooks/useVault";
import { useAPY } from "@/hooks/useAPY";
import { formatUnits } from "viem";

type HealthFactor = {
  label: string;
  score: number;
  weight: number;
  description: string;
};

function calculateHealthScore(
  currentValue: number,
  goalAmount: number,
  targetMonths: number,
  usdyAmount: number,
  methAmount: number,
  usdyAPY: number,
  methAPY: number
): { totalScore: number; factors: HealthFactor[] } {
  const factors: HealthFactor[] = [];

  // 1. Goal progress pace (30%)
  const monthsElapsed = 1; // TODO: calculate from deposit timestamp
  const expectedProgress = (monthsElapsed / targetMonths) * goalAmount;
  const actualProgress = currentValue;
  const progressRatio = goalAmount > 0 ? actualProgress / expectedProgress : 1;
  const progressScore = Math.min(100, progressRatio * 100);

  factors.push({
    label: "Goal Progress Pace",
    score: progressScore,
    weight: 30,
    description: progressRatio >= 1 ? "On track" : progressRatio >= 0.8 ? "Slightly behind" : "Behind schedule",
  });

  // 2. Allocation vs risk mode (25%)
  const totalValue = usdyAmount + methAmount;
  const usdyRatio = totalValue > 0 ? usdyAmount / totalValue : 0.5;
  // Optimal: SAFE (90% USDY), BALANCED (60% USDY), AGGRESSIVE (40% USDY)
  const optimalUSDY = 0.6; // Assume BALANCED for now
  const allocationDiff = Math.abs(usdyRatio - optimalUSDY);
  const allocationScore = Math.max(0, 100 - allocationDiff * 200);

  factors.push({
    label: "Allocation Balance",
    score: allocationScore,
    weight: 25,
    description: allocationDiff < 0.1 ? "Optimal" : allocationDiff < 0.2 ? "Minor drift" : "Needs rebalance",
  });

  // 3. Yield optimization (25%)
  const currentBlendedAPY = totalValue > 0 ? (usdyAmount * usdyAPY + methAmount * methAPY) / totalValue : 0;
  const bestAvailableAPY = Math.max(usdyAPY, methAPY);
  const yieldEfficiency = bestAvailableAPY > 0 ? (currentBlendedAPY / bestAvailableAPY) * 100 : 100;
  const yieldScore = Math.min(100, yieldEfficiency);

  factors.push({
    label: "Yield Optimization",
    score: yieldScore,
    weight: 25,
    description: yieldScore >= 90 ? "Excellent" : yieldScore >= 75 ? "Good" : "Can improve",
  });

  // 4. Diversification (20%)
  const diversificationScore = Math.min(100, (1 - Math.abs(usdyRatio - 0.5) * 2) * 100);

  factors.push({
    label: "Diversification",
    score: diversificationScore,
    weight: 20,
    description:
      diversificationScore >= 80 ? "Well diversified" : diversificationScore >= 60 ? "Moderate" : "Concentrated",
  });

  // Calculate weighted total
  const totalScore = factors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0);

  return { totalScore: Math.round(totalScore), factors };
}

export function HealthScore({ className }: { className?: string }) {
  const { totalFormatted } = useTotalValue();
  const { position } = useVaultPosition();
  const { usdyAPY, methAPY } = useAPY();
  const [showDetails, setShowDetails] = useState(false);

  if (!position || !position.active) return null;

  const currentValue = parseFloat(totalFormatted);
  const goalAmount = parseFloat(formatUnits(position.goalAmount, 18));

  // Calculate target months from goalDeadline
  const nowSeconds = Math.floor(Date.now() / 1000);
  const depositedAtSeconds = Number(position.depositedAt);
  const deadlineSeconds = Number(position.goalDeadline);
  const targetMonths = deadlineSeconds > depositedAtSeconds
    ? Math.ceil((deadlineSeconds - depositedAtSeconds) / (30 * 24 * 60 * 60))
    : 6; // fallback to 6 months

  const usdyAmount = parseFloat(formatUnits(position.usdyAmount, 18));
  const methAmount = parseFloat(formatUnits(position.methAmount, 18));
  const parsedUSDY = parseFloat(usdyAPY);
  const parsedMETH = parseFloat(methAPY);

  const { totalScore, factors } = calculateHealthScore(
    currentValue,
    goalAmount,
    targetMonths,
    usdyAmount,
    methAmount,
    parsedUSDY,
    parsedMETH
  );

  const scoreColor =
    totalScore >= 70 ? "hsl(var(--positive))" : totalScore >= 40 ? "hsl(var(--warning))" : "rgba(255,70,70,1)";
  const scoreBg =
    totalScore >= 70
      ? "rgba(64,200,120,0.1)"
      : totalScore >= 40
      ? "rgba(255,190,60,0.1)"
      : "rgba(255,70,70,0.1)";

  return (
    <GlassCard className={className}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: scoreBg, border: `1px solid ${scoreColor}30` }}
            >
              <Activity size={13} style={{ color: scoreColor }} />
            </span>
            <SectionLabel>Portfolio health</SectionLabel>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 rounded-lg transition-colors hover:bg-opacity-70"
            style={{ background: "rgba(20,20,30,0.05)" }}
          >
            <Info size={12} style={{ color: "rgba(20,20,30,0.5)" }} />
          </button>
        </div>

        {/* Circular gauge */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="rgba(20,20,30,0.08)"
                strokeWidth="8"
              />
              {/* Score arc */}
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 56}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - totalScore / 100) }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[32px] font-light leading-none" style={{ color: scoreColor }}>
                {totalScore}
              </span>
              <span className="text-[11px] mt-0.5" style={{ color: "rgba(20,20,30,0.45)" }}>
                / 100
              </span>
            </div>
          </div>
        </div>

        {/* Status message */}
        <p className="text-center text-[12.5px] mb-4" style={{ color: "rgba(20,20,30,0.6)" }}>
          {totalScore >= 70
            ? "Your portfolio is in excellent health"
            : totalScore >= 40
            ? "Your portfolio is stable with room to optimize"
            : "Consider reviewing your allocation strategy"}
        </p>

        {/* Factor breakdown */}
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="space-y-2.5 pt-4"
            style={{ borderTop: "1px solid rgba(20,20,30,0.08)" }}
          >
            {factors.map((factor) => {
              const factorColor =
                factor.score >= 70
                  ? "hsl(var(--positive))"
                  : factor.score >= 40
                  ? "hsl(var(--warning))"
                  : "rgba(255,70,70,1)";

              return (
                <div key={factor.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-[11.5px] font-medium text-foreground">{factor.label}</p>
                      <p className="text-[10px]" style={{ color: "rgba(20,20,30,0.45)" }}>
                        {factor.description} · {factor.weight}% weight
                      </p>
                    </div>
                    <span className="text-[12px] font-semibold" style={{ color: factorColor }}>
                      {Math.round(factor.score)}
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(20,20,30,0.06)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: factorColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${factor.score}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}
