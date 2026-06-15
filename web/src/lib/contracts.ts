import { parseAbi } from "viem";

const isTestnet = process.env.NEXT_PUBLIC_CHAIN_ID === "5003";

export const ADDRESSES = {
  VAULT: (process.env.NEXT_PUBLIC_VAULT_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
  AGENT: (process.env.NEXT_PUBLIC_AGENT_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
  CHRONICLE: (process.env.NEXT_PUBLIC_CHRONICLE_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
  // ERC-8004 registries (Identity = AGENT above)
  REPUTATION: (process.env.NEXT_PUBLIC_REPUTATION_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
  VALIDATION: (process.env.NEXT_PUBLIC_VALIDATION_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
  USDY: (process.env.NEXT_PUBLIC_USDY_ADDRESS ?? "0x5bE26527e817998A7206475496fDE1E68957c5A6") as `0x${string}`,
  METH: (process.env.NEXT_PUBLIC_METH_ADDRESS ?? "0xcDA86A272531e8640cD7F1a92c01839911B90bb0") as `0x${string}`,
} as const;

export const IS_TESTNET = isTestnet;

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

// AMANTAgent = ERC-8004 Identity Registry + a-MANT decision journal
export const AGENT_ABI = parseAbi([
  // a-MANT domain
  "function createAgent(address user, string agentName) external returns (uint256)",
  "function hasAgent(address user) view returns (bool)",
  "function getAgentId(address user) view returns (uint256)",
  "function getProfile(address user) view returns ((string name, uint256 createdAt, uint256 totalDecisions, uint256 reputationScore, int256 totalImpact, bool active))",
  "function getDecisions(uint256 agentId) view returns ((string action, string context, string outcome, int256 impactAmount, string signalSource, uint256 timestamp)[])",
  "function getReputation(address user) view returns (uint256)",
  // ERC-8004 Identity Registry
  "function register(string agentURI) external returns (uint256)",
  "function getMetadata(uint256 agentId, string metadataKey) view returns (bytes)",
  "function setAgentURI(uint256 agentId, string newURI) external",
  "function getAgentWallet(uint256 agentId) view returns (address)",
  "function isAuthorizedOrOwner(address spender, uint256 agentId) view returns (bool)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "event AgentBorn(address indexed user, uint256 indexed agentId, string name)",
  "event DecisionLogged(uint256 indexed agentId, string action, int256 impact, string signalSource)",
  "event Registered(uint256 indexed agentId, string agentURI, address indexed owner)",
]);

// ERC-8004 Reputation Registry
export const REPUTATION_ABI = parseAbi([
  "function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash) external",
  "function getLastIndex(uint256 agentId, address clientAddress) view returns (uint64)",
  "function getClients(uint256 agentId) view returns (address[])",
  "function readFeedback(uint256 agentId, address clientAddress, uint64 feedbackIndex) view returns (int128 value, uint8 valueDecimals, string tag1, string tag2, bool isRevoked)",
  "function getSummary(uint256 agentId, address[] clientAddresses, string tag1, string tag2) view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals)",
  "event NewFeedback(uint256 indexed agentId, address indexed clientAddress, uint64 feedbackIndex, int128 value, uint8 valueDecimals, string indexed indexedTag1, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)",
]);

// ERC-8004 Validation Registry
export const VALIDATION_ABI = parseAbi([
  "function validationRequest(address validatorAddress, uint256 agentId, string requestURI, bytes32 requestHash) external",
  "function validationResponse(bytes32 requestHash, uint8 response, string responseURI, bytes32 responseHash, string tag) external",
  "function getValidationStatus(bytes32 requestHash) view returns (address validatorAddress, uint256 agentId, uint8 response, bytes32 responseHash, string tag, uint256 lastUpdate)",
  "function getAgentValidations(uint256 agentId) view returns (bytes32[])",
  "function getSummary(uint256 agentId, address[] validatorAddresses, string tag) view returns (uint64 count, uint8 avgResponse)",
  "event ValidationRequest(address indexed validatorAddress, uint256 indexed agentId, string requestURI, bytes32 indexed requestHash)",
  "event ValidationResponse(address indexed validatorAddress, uint256 indexed agentId, bytes32 indexed requestHash, uint8 response, string responseURI, bytes32 responseHash, string tag)",
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
