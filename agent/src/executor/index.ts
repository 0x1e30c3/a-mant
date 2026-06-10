import {
  createWalletClient,
  createPublicClient,
  http,
  parseAbi,
  getContract,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Decision, UserState } from "../types/index.js";

const mantleChain = {
  id: 5000,
  name: "Mantle",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.MANTLE_RPC_URL ?? "https://rpc.mantle.xyz"] },
  },
} as const;

const VAULT_ABI = parseAbi([
  "function logRebalance(address user, string fromToken, string toToken, uint256 amount, string reason, string signalSource) external",
  "function accrueYield(address user, uint256 amount) external",
  "function getPosition(address user) view returns (uint256 usdyAmount, uint256 methAmount, uint256 goalAmount, uint256 goalDeadline, uint8 riskMode, bool active, uint256 depositedAt, uint256 totalYieldClaimed)",
]);

const AGENT_ABI = parseAbi([
  "function logDecision(uint256 agentId, string action, string context, string outcome, int256 impactAmount, string signalSource) external",
  "function getAgentId(address user) view returns (uint256)",
  "function hasAgent(address user) view returns (bool)",
  "function createAgent(address user, string agentName) external returns (uint256)",
]);

const CHRONICLE_ABI = parseAbi([
  "function createChapter(address user, string title, string narrative, int256 impactAmount, uint8 chapterType, string worldContext) external returns (uint256)",
]);

function getClients() {
  const pk = process.env.PRIVATE_KEY as `0x${string}`;
  if (!pk) throw new Error("PRIVATE_KEY not set");

  const account = privateKeyToAccount(pk);

  const walletClient = createWalletClient({
    account,
    chain: mantleChain,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: mantleChain,
    transport: http(),
  });

  return { walletClient, publicClient, account };
}

export async function executeDecision(
  userAddress: `0x${string}`,
  decision: Decision,
  agentId: bigint
): Promise<`0x${string}` | null> {
  if (decision.action === "HOLD") return null;

  const { walletClient, publicClient } = getClients();
  const vaultAddress = process.env.VAULT_ADDRESS as `0x${string}`;

  console.log(`[executor] ${decision.action} for ${userAddress}`);
  console.log(`[executor] Reason: ${decision.reason}`);

  try {
    const hash = await walletClient.writeContract({
      address: vaultAddress,
      abi: VAULT_ABI,
      functionName: "logRebalance",
      args: [
        userAddress,
        decision.fromToken ?? "",
        decision.toToken ?? "",
        decision.amount ?? 0n,
        decision.reason,
        decision.signalSource,
      ],
    });

    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[executor] Rebalance logged: ${hash}`);
    return hash;
  } catch (err) {
    console.error("[executor] Failed to execute:", err);
    return null;
  }
}

export async function logAgentDecision(
  agentId: bigint,
  decision: Decision,
  outcome: string
): Promise<void> {
  const { walletClient, publicClient } = getClients();
  const agentAddress = process.env.AGENT_ADDRESS as `0x${string}`;

  const chapterTypeMap: Record<string, number> = {
    REBALANCE: 0,
    PROTECT: 1,
    MILESTONE: 2,
    COMPOUND: 3,
    DISTRIBUTE: 3,
    HOLD: 0,
  };

  try {
    const hash = await walletClient.writeContract({
      address: agentAddress,
      abi: AGENT_ABI,
      functionName: "logDecision",
      args: [
        agentId,
        decision.action,
        decision.reason,
        outcome,
        decision.impactEstimate,
        decision.signalSource,
      ],
    });

    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[executor] Decision logged on-chain: ${hash}`);
  } catch (err) {
    console.error("[executor] Failed to log decision:", err);
  }
}

export async function writeChapter(
  userAddress: `0x${string}`,
  title: string,
  narrative: string,
  impactAmount: bigint,
  chapterType: 0 | 1 | 2 | 3 | 4,
  worldContext: string
): Promise<void> {
  const { walletClient, publicClient } = getClients();
  const chronicleAddress = process.env.CHRONICLE_ADDRESS as `0x${string}`;

  try {
    const hash = await walletClient.writeContract({
      address: chronicleAddress,
      abi: CHRONICLE_ABI,
      functionName: "createChapter",
      args: [userAddress, title, narrative, impactAmount, chapterType, worldContext],
    });

    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[executor] Chapter written: ${hash}`);
  } catch (err) {
    console.error("[executor] Failed to write chapter:", err);
  }
}

export async function getUserState(userAddress: `0x${string}`): Promise<UserState | null> {
  const { publicClient } = getClients();
  const vaultAddress = process.env.VAULT_ADDRESS as `0x${string}`;
  const agentAddress = process.env.AGENT_ADDRESS as `0x${string}`;

  try {
    const [position, agentId] = await Promise.all([
      publicClient.readContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: "getPosition",
        args: [userAddress],
      }),
      publicClient.readContract({
        address: agentAddress,
        abi: AGENT_ABI,
        functionName: "getAgentId",
        args: [userAddress],
      }),
    ]);

    return {
      address: userAddress,
      usdyAmount: position[0],
      methAmount: position[1],
      goalAmount: position[2],
      goalDeadline: Number(position[3]),
      riskMode: position[4],
      active: position[5],
      depositedAt: Number(position[6]),
      agentId: agentId as bigint,
    };
  } catch (err) {
    console.error("[executor] Failed to fetch user state:", err);
    return null;
  }
}
