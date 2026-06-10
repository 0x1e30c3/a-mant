export type RiskMode = "SAFE" | "BALANCED" | "AGGRESSIVE";

export type SignalSource =
  | "FED_RATE"
  | "ONDO_HEALTH"
  | "ETH_STAKING"
  | "APY_DIFF"
  | "MANTLE_TVL"
  | "VOLATILITY";

export type ActionType =
  | "REBALANCE"
  | "PROTECT"
  | "COMPOUND"
  | "DISTRIBUTE"
  | "HOLD";

export interface MacroSignals {
  fedRatePercent: number;       // US Fed funds rate %
  fedRateTrend: "UP" | "DOWN" | "STABLE";
  ondoHealthScore: number;      // 0-100
  usdyRedemptionQueueNormal: boolean;
  ethStakingRatePercent: number;
  ethStakingTrend: "UP" | "DOWN" | "STABLE";
  mantleTvlUsd: number;
  mantleTvlTrend: "UP" | "DOWN" | "STABLE";
  globalVolatilityIndex: number; // 0-100, higher = more volatile
  fetchedAt: Date;
}

export interface ProtocolAPY {
  protocol: string;
  token: "USDY" | "METH";
  apy: number; // annual percentage yield
  tvlUsd: number;
  utilizationRate: number; // 0-1
}

export interface OnChainSignals {
  protocols: ProtocolAPY[];
  bestUsdyApy: number;
  bestMethApy: number;
  bestUsdyProtocol: string;
  bestMethProtocol: string;
  fetchedAt: Date;
}

export interface UserState {
  address: string;
  usdyAmount: bigint;
  methAmount: bigint;
  goalAmount: bigint;
  goalDeadline: number;
  riskMode: number; // 0=SAFE, 1=BALANCED, 2=AGGRESSIVE
  active: boolean;
  depositedAt: number;
  agentId: bigint;
}

export interface Decision {
  action: ActionType;
  fromToken?: "USDY" | "METH";
  toToken?: "USDY" | "METH";
  amount?: bigint;
  reason: string;
  signalSource: SignalSource;
  impactEstimate: bigint; // estimated impact in wei
  confidence: number;     // 0-1
}

export interface ChapterData {
  title: string;
  narrative: string;
  impactAmount: bigint;
  chapterType: 0 | 1 | 2 | 3 | 4; // matches ChapterType enum in contract
  worldContext: string;
}

export interface AgentCycle {
  userId: string;
  macro: MacroSignals;
  onChain: OnChainSignals;
  userState: UserState;
  decision: Decision;
  chapter?: ChapterData;
  executedAt: Date;
}
