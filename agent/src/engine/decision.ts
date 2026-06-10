import {
  MacroSignals,
  OnChainSignals,
  UserState,
  Decision,
  SignalSource,
} from "../types/index.js";

const REBALANCE_THRESHOLD = 1.5;     // APY diff % to trigger rebalance
const PROTECTION_THRESHOLD = 80;      // Ondo health score below this = protect
const STAKING_DROP_THRESHOLD = 0.5;   // mETH yield drop % to trigger rotation
const HIGH_VOLATILITY = 70;           // volatility index above this = protect mode

export function makeDecision(
  macro: MacroSignals,
  onChain: OnChainSignals,
  user: UserState
): Decision {
  const riskMode = user.riskMode; // 0=SAFE, 1=BALANCED, 2=AGGRESSIVE
  const hasUsdy = user.usdyAmount > 0n;
  const hasMeth = user.methAmount > 0n;
  const totalValue = user.usdyAmount + user.methAmount;

  // ── Rule 1: Ondo health deteriorating → protect everything in safest asset
  if (macro.ondoHealthScore < PROTECTION_THRESHOLD) {
    if (hasMeth) {
      return {
        action: "PROTECT",
        fromToken: "METH",
        toToken: "USDY",
        amount: user.methAmount,
        reason: `Ondo Finance health score dropped to ${macro.ondoHealthScore}/100. Moving mETH to USDY as precaution.`,
        signalSource: "ONDO_HEALTH",
        impactEstimate: (user.methAmount * 2n) / 100n, // estimated 2% saved
        confidence: 0.92,
      };
    }
  }

  // ── Rule 2: High global volatility + user is SAFE mode → move to USDY
  if (macro.globalVolatilityIndex > HIGH_VOLATILITY && riskMode === 0 && hasMeth) {
    return {
      action: "PROTECT",
      fromToken: "METH",
      toToken: "USDY",
      amount: user.methAmount,
      reason: `Market volatility is high (index: ${macro.globalVolatilityIndex}/100). Your Safe profile means USDY is the right move.`,
      signalSource: "VOLATILITY",
      impactEstimate: (user.methAmount * 3n) / 100n,
      confidence: 0.85,
    };
  }

  // ── Rule 3: ETH staking rate dropping significantly → reduce mETH exposure
  if (macro.ethStakingTrend === "DOWN" && macro.ethStakingRatePercent < 3.0 && hasMeth) {
    const shiftAmount = riskMode === 0
      ? user.methAmount                           // SAFE: move all
      : (user.methAmount * 60n) / 100n;          // BALANCED: move 60%

    return {
      action: "REBALANCE",
      fromToken: "METH",
      toToken: "USDY",
      amount: shiftAmount,
      reason: `ETH staking rate fell to ${macro.ethStakingRatePercent.toFixed(1)}%. Rotating to USDY yield (${onChain.bestUsdyApy.toFixed(1)}% APY) which is now more attractive.`,
      signalSource: "ETH_STAKING",
      impactEstimate: (shiftAmount * BigInt(Math.round((onChain.bestUsdyApy - macro.ethStakingRatePercent) * 100))) / 10000n,
      confidence: 0.80,
    };
  }

  // ── Rule 4: Fed rate cut signal → USDY yield will compress → rotate to mETH
  if (macro.fedRateTrend === "DOWN" && macro.fedRatePercent < 4.0 && riskMode >= 1 && hasUsdy) {
    const shiftAmount = riskMode === 2
      ? user.usdyAmount                            // AGGRESSIVE: move all
      : (user.usdyAmount * 40n) / 100n;           // BALANCED: move 40%

    return {
      action: "REBALANCE",
      fromToken: "USDY",
      toToken: "METH",
      amount: shiftAmount,
      reason: `Fed signals rate cut (current: ${macro.fedRatePercent.toFixed(2)}%). USDY Treasury yield will compress. Rotating ${riskMode === 2 ? "all" : "40%"} to mETH for better yield.`,
      signalSource: "FED_RATE",
      impactEstimate: (shiftAmount * BigInt(Math.round((onChain.bestMethApy - onChain.bestUsdyApy) * 100))) / 10000n,
      confidence: 0.75,
    };
  }

  // ── Rule 5: APY differential optimization (pure on-chain signal)
  const usdyMethApyDiff = onChain.bestMethApy - onChain.bestUsdyApy;
  const methUsdyApyDiff = onChain.bestUsdyApy - onChain.bestMethApy;

  if (usdyMethApyDiff > REBALANCE_THRESHOLD && riskMode >= 1 && hasUsdy) {
    const shiftAmount = (user.usdyAmount * 35n) / 100n; // move 35%
    return {
      action: "REBALANCE",
      fromToken: "USDY",
      toToken: "METH",
      amount: shiftAmount,
      reason: `mETH APY (${onChain.bestMethApy.toFixed(1)}%) is ${usdyMethApyDiff.toFixed(1)}% higher than USDY (${onChain.bestUsdyApy.toFixed(1)}%). Moving 35% to capture the spread.`,
      signalSource: "APY_DIFF",
      impactEstimate: (shiftAmount * BigInt(Math.round(usdyMethApyDiff * 100))) / 10000n,
      confidence: 0.78,
    };
  }

  if (methUsdyApyDiff > REBALANCE_THRESHOLD && hasMeth) {
    const shiftAmount = (user.methAmount * 35n) / 100n;
    return {
      action: "REBALANCE",
      fromToken: "METH",
      toToken: "USDY",
      amount: shiftAmount,
      reason: `USDY APY (${onChain.bestUsdyApy.toFixed(1)}%) is ${methUsdyApyDiff.toFixed(1)}% higher than mETH. Rotating 35% to maximize yield.`,
      signalSource: "APY_DIFF",
      impactEstimate: (shiftAmount * BigInt(Math.round(methUsdyApyDiff * 100))) / 10000n,
      confidence: 0.78,
    };
  }

  // ── Default: Hold — conditions are optimal
  return {
    action: "HOLD",
    reason: `All signals look good. USDY health: ${macro.ondoHealthScore}/100, ETH staking: ${macro.ethStakingRatePercent.toFixed(1)}%, best APY spread is within normal range.`,
    signalSource: "APY_DIFF",
    impactEstimate: 0n,
    confidence: 1.0,
  };
}

export function shouldExecute(decision: Decision, _user: UserState): boolean {
  if (decision.action === "HOLD") return false;
  if (decision.amount === undefined || decision.amount === 0n) return false;
  if (decision.confidence < 0.7) return false;
  return true;
}
