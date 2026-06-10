"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useTotalValue, useVaultPosition, usePendingYield } from "@/hooks/useVault";
import { useAgentProfile, useChapters } from "@/hooks/useAgent";
import { CHAPTER_TYPE_LABELS, RISK_LABELS, RiskMode } from "@/types";
import { formatUnits } from "viem";

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) router.replace("/onboard");
  }, [isConnected, router]);

  const { totalFormatted, isLoading: valueLoading } = useTotalValue();
  const { position } = useVaultPosition();
  const { yieldFormatted } = usePendingYield();
  const { profile, hasAgent } = useAgentProfile();
  const { latestChapter } = useChapters();

  const goalPct =
    position?.active && position.goalAmount > 0n
      ? Math.min(
          100,
          (parseFloat(totalFormatted) /
            parseFloat(formatUnits(position.goalAmount, 18))) *
            100
        )
      : 0;

  const fmt = (n: string) =>
    parseFloat(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Hero: total value */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-1"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Portfolio value
        </p>
        <div className="text-5xl font-light text-foreground">
          {valueLoading ? (
            <span className="text-border">—</span>
          ) : (
            <>
              <span className="text-muted-foreground text-2xl mr-1">$</span>
              {fmt(totalFormatted)}
            </>
          )}
        </div>

        {position?.active && position.goalAmount > 0n && (
          <div className="pt-3 space-y-2">
            <Progress value={goalPct} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(goalPct)}% to goal</span>
              <span>${fmt(formatUnits(position.goalAmount, 18))}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Allocation split */}
      {position && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card className="space-y-1">
            <p className="text-xs text-muted-foreground">USDY</p>
            <p className="text-xl font-light text-foreground">
              {fmt(formatUnits(position.usdyAmount, 18))}
            </p>
            <p className="text-xs text-positive">~4.5% APY</p>
          </Card>
          <Card className="space-y-1">
            <p className="text-xs text-muted-foreground">mETH</p>
            <p className="text-xl font-light text-foreground">
              {parseFloat(formatUnits(position.methAmount, 18)).toLocaleString(
                "en-US",
                { minimumFractionDigits: 4, maximumFractionDigits: 4 }
              )}
            </p>
            <p className="text-xs text-positive">~3.8% APY</p>
          </Card>
        </motion.div>
      )}

      {/* Claimable yield */}
      {parseFloat(yieldFormatted) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
        >
          <Card accent="positive" className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Claimable yield</p>
              <p className="text-base font-medium text-positive mt-0.5">
                +${parseFloat(yieldFormatted).toFixed(4)}
              </p>
            </div>
            <Button size="sm" variant="secondary">
              Claim
            </Button>
          </Card>
        </motion.div>
      )}

      {/* AI status */}
      {hasAgent && profile && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-positive" />
                <p className="text-sm font-medium text-foreground">Axiom</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.totalDecisions.toString()} decisions
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <p className="text-xs text-muted-foreground">Risk mode</p>
                <p className="text-sm text-foreground mt-0.5">
                  {RISK_LABELS[(position?.riskMode ?? 0) as RiskMode]}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reputation</p>
                <p className="text-sm text-foreground mt-0.5">
                  {profile.reputationScore.toString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total impact</p>
                <p className="text-sm text-foreground mt-0.5">
                  ${parseFloat(formatUnits(profile.totalImpact, 18)).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Latest chapter */}
      {latestChapter && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.26 }}
        >
          <Card className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Latest chapter</p>
              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded-full border border-border">
                {CHAPTER_TYPE_LABELS[latestChapter.chapterType]}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {latestChapter.title}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {latestChapter.narrative}
            </p>
          </Card>
        </motion.div>
      )}

      {/* Empty state */}
      {!position && !valueLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 space-y-4"
        >
          <p className="text-muted-foreground text-sm">
            No position yet. Make your first deposit to start.
          </p>
          <Button size="lg">Deposit</Button>
        </motion.div>
      )}
    </div>
  );
}
