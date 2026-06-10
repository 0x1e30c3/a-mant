import { parseAbi } from "viem";

export const ADDRESSES = {
  VAULT: (process.env.NEXT_PUBLIC_VAULT_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
  AGENT: (process.env.NEXT_PUBLIC_AGENT_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
  CHRONICLE: (process.env.NEXT_PUBLIC_CHRONICLE_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
  USDY: "0x5bE26527e817998A7206475496fDE1E68957c5A6" as `0x${string}`,
  METH: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0" as `0x${string}`,
} as const;

export const VAULT_ABI = parseAbi([
  "function setGoal(uint256 goalAmount, uint256 durationDays, uint8 riskMode) external",
  "function deposit(address token, uint256 amount) external",
  "function withdraw(address token, uint256 amount) external",
  "function claimYield() external",
  "function getPosition(address user) view returns ((uint256 usdyAmount, uint256 methAmount, uint256 goalAmount, uint256 goalDeadline, uint8 riskMode, bool active, uint256 depositedAt, uint256 totalYieldClaimed))",
  "function getRebalanceHistory(address user) view returns ((string fromToken, string toToken, uint256 amount, string reason, uint256 timestamp, string signalSource)[])",
  "function getTotalValue(address user) view returns (uint256)",
  "function pendingYield(address user) view returns (uint256)",
  "function lifiDiamond() view returns (address)",
  "event Deposited(address indexed user, address indexed token, uint256 amount)",
  "event Withdrawn(address indexed user, address indexed token, uint256 amount)",
  "event Rebalanced(address indexed user, string fromToken, string toToken, uint256 amount, string reason, string signalSource)",
  "event SwappedViaLifi(address indexed user, address indexed fromToken, address indexed toToken, uint256 fromAmount, uint256 receivedAmount)",
  "event GoalSet(address indexed user, uint256 goalAmount, uint256 deadline, uint8 riskMode)",
]);

export const AGENT_ABI = parseAbi([
  "function createAgent(address user, string agentName) external returns (uint256)",
  "function hasAgent(address user) view returns (bool)",
  "function getAgentId(address user) view returns (uint256)",
  "function getProfile(address user) view returns ((string name, uint256 createdAt, uint256 totalDecisions, uint256 reputationScore, int256 totalImpact, bool active))",
  "function getDecisions(uint256 agentId) view returns ((string action, string context, string outcome, int256 impactAmount, string signalSource, uint256 timestamp)[])",
  "function getReputation(address user) view returns (uint256)",
  "event AgentBorn(address indexed user, uint256 indexed agentId, string name)",
  "event DecisionLogged(uint256 indexed agentId, string action, int256 impact, string signalSource)",
]);

export const CHRONICLE_ABI = parseAbi([
  "function getChapters(address user) view returns ((string title, string narrative, int256 impactAmount, uint8 chapterType, uint256 timestamp, string worldContext)[])",
  "function getChapterCount(address user) view returns (uint256)",
  "function getLatestChapter(address user) view returns ((string title, string narrative, int256 impactAmount, uint8 chapterType, uint256 timestamp, string worldContext))",
  "function milestoneCount(address user) view returns (uint256)",
  "event ChapterCreated(address indexed user, uint256 indexed chapterIndex, string title, uint8 chapterType, int256 impact)",
]);

export const ERC20_ABI = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]);
