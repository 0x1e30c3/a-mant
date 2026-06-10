export type RiskMode = 0 | 1 | 2;
export const RISK_LABELS: Record<RiskMode, string> = {
  0: "Safe",
  1: "Balanced",
  2: "Aggressive",
};

export type ChapterType = 0 | 1 | 2 | 3 | 4;
export const CHAPTER_TYPE_LABELS: Record<ChapterType, string> = {
  0: "Rebalance",
  1: "Protection",
  2: "Milestone",
  3: "Yield",
  4: "Deposit",
};

export interface UserPosition {
  usdyAmount: bigint;
  methAmount: bigint;
  goalAmount: bigint;
  goalDeadline: bigint;
  riskMode: number;
  active: boolean;
  depositedAt: bigint;
  totalYieldClaimed: bigint;
}

export interface AgentProfile {
  name: string;
  createdAt: bigint;
  totalDecisions: bigint;
  reputationScore: bigint;
  totalImpact: bigint;
  active: boolean;
}

export interface Chapter {
  title: string;
  narrative: string;
  impactAmount: bigint;
  chapterType: ChapterType;
  timestamp: bigint;
  worldContext: string;
}

export interface RebalanceEvent {
  fromToken: string;
  toToken: string;
  amount: bigint;
  reason: string;
  timestamp: bigint;
  signalSource: string;
}

export interface OnboardingData {
  goalAmount: string;
  durationMonths: number;
  riskMode: RiskMode;
  depositToken: "USDY" | "METH";
  depositAmount: string;
}
