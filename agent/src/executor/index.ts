import {
  createWalletClient,
  createPublicClient,
  http,
  parseAbi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Decision, UserState } from "../types/index.js";
import { getLifiSwapData, validateLifiCalldata } from "./lifi.js";

const mantleChain = {
  id: 5000,
  name: "Mantle",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.MANTLE_RPC_URL ?? "https://rpc.mantle.xyz"] },
  },
} as const;

// ─── ABIs ─────────────────────────────────────────────────────────────────────

const VAULT_ABI = parseAbi([
  "function executeSwapViaLifi(address user, address fromToken, address toToken, uint256 fromAmount, uint256 minToAmount, bytes lifiCalldata) external",
  "function logRebalance(address user, string fromToken, string toToken, uint256 amount, string reason, string signalSource) external",
  "function accrueYield(address user, uint256 amount) external",
  "function getPosition(address user) view returns ((uint256 usdyAmount, uint256 methAmount, uint256 goalAmount, uint256 goalDeadline, uint8 riskMode, bool active, uint256 depositedAt, uint256 totalYieldClaimed))",
  "function lifiDiamond() view returns (address)",
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

// ERC-8004 Reputation Registry — the autonomous monitor publishes an outcome signal
// for each executed decision. The executor is an independent client (not the agent's
// owner/operator), so giveFeedback's self-feedback guard passes without any approval.
const REPUTATION_ABI = parseAbi([
  "function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash) external",
]);

// ─── Token addresses ──────────────────────────────────────────────────────────

const TOKEN_ADDRESS: Record<string, `0x${string}`> = {
  USDY: "0x5bE26527e817998A7206475496fDE1E68957c5A6",
  METH: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0",
};

// ─── Clients ──────────────────────────────────────────────────────────────────

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

// ─── Execute decision ─────────────────────────────────────────────────────────

export async function executeDecision(
  userAddress: `0x${string}`,
  decision: Decision,
  _agentId: bigint
): Promise<`0x${string}` | null> {
  if (decision.action === "HOLD") return null;

  const { walletClient, publicClient } = getClients();
  const vaultAddress = process.env.VAULT_ADDRESS as `0x${string}`;

  console.log(`[executor] ${decision.action} ${decision.fromToken ?? ""}→${decision.toToken ?? ""} for ${userAddress}`);
  console.log(`[executor] Amount: ${decision.amount ?? 0n} | Reason: ${decision.reason}`);

  // ── Try real swap via LI.FI ──────────────────────────────────────────────
  if (
    (decision.action === "REBALANCE" || decision.action === "PROTECT") &&
    decision.fromToken &&
    decision.toToken &&
    decision.amount &&
    decision.amount > 0n
  ) {
    try {
      // Read the configured LI.FI Diamond address from vault
      const lifiDiamond = await publicClient.readContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: "lifiDiamond",
      });

      if (lifiDiamond && lifiDiamond !== "0x0000000000000000000000000000000000000000") {
        console.log(`[executor] Fetching LI.FI quote for ${decision.fromToken}→${decision.toToken}...`);

        const quote = await getLifiSwapData(
          decision.fromToken as "USDY" | "METH",
          decision.toToken as "USDY" | "METH",
          decision.amount,
          vaultAddress,
          decision.action === "PROTECT" ? 0.01 : 0.005 // 1% slippage for protection (urgency)
        );

        if (quote && validateLifiCalldata(quote.calldata, quote.toAddress, lifiDiamond)) {
          console.log(`[executor] LI.FI route found — est. received: ${quote.estimatedReceived}, gas: $${quote.gasCostUsd}`);

          const hash = await walletClient.writeContract({
            address: vaultAddress,
            abi: VAULT_ABI,
            functionName: "executeSwapViaLifi",
            args: [
              userAddress,
              TOKEN_ADDRESS[decision.fromToken],
              TOKEN_ADDRESS[decision.toToken],
              decision.amount,
              quote.minReceived,
              quote.calldata,
            ],
          });

          await publicClient.waitForTransactionReceipt({ hash });
          console.log(`[executor] ✓ Real swap executed via LI.FI: ${hash}`);
          return hash;
        } else {
          console.log("[executor] LI.FI route unavailable, falling back to simulation");
        }
      } else {
        console.log("[executor] LI.FI not configured on vault, using simulation");
      }
    } catch (err) {
      console.warn("[executor] LI.FI execution failed, falling back:", err);
    }
  }

  // ── Fallback: simulation (accounting update only) ────────────────────────
  console.log("[executor] Using logRebalance (simulation)");
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
    console.log(`[executor] ✓ Rebalance simulated: ${hash}`);
    return hash;
  } catch (err) {
    console.error("[executor] Execution failed entirely:", err);
    return null;
  }
}

// ─── Log decision to Agent NFT ────────────────────────────────────────────────

export async function logAgentDecision(
  agentId: bigint,
  decision: Decision,
  outcome: string
): Promise<void> {
  const { walletClient, publicClient } = getClients();
  const agentAddress = process.env.AGENT_ADDRESS as `0x${string}`;

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
    console.log(`[executor] ✓ Decision on-chain: ${hash}`);
  } catch (err) {
    console.error("[executor] Failed to log decision:", err);
  }
}

// ─── ERC-8004: publish reputation feedback ─────────────────────────────────────

/**
 * Publish an ERC-8004 reputation signal for the agent's executed decision.
 * No-op when REPUTATION_ADDRESS is unset. The signed value is the decision's
 * estimated impact (18-decimals), tagged with the action.
 */
export async function recordReputationFeedback(
  agentId: bigint,
  decision: Decision
): Promise<void> {
  const reputationAddress = process.env.REPUTATION_ADDRESS as `0x${string}` | undefined;
  if (!reputationAddress) return;

  const { walletClient, publicClient } = getClients();
  // Clamp to the registry's ±1e38 bound.
  const MAX_ABS = 10n ** 38n;
  let value = decision.impactEstimate;
  if (value > MAX_ABS) value = MAX_ABS;
  if (value < -MAX_ABS) value = -MAX_ABS;

  try {
    const hash = await walletClient.writeContract({
      address: reputationAddress,
      abi: REPUTATION_ABI,
      functionName: "giveFeedback",
      args: [
        agentId,
        value,
        18,
        "impact",
        decision.action,
        "a-mant-autonomous-agent",
        "",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      ],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[executor] ✓ ERC-8004 feedback published: ${hash}`);
  } catch (err) {
    console.error("[executor] Failed to publish reputation feedback:", err);
  }
}

// ─── Write Chronicle chapter ──────────────────────────────────────────────────

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
    console.log(`[executor] ✓ Chapter written: ${hash}`);
  } catch (err) {
    console.error("[executor] Failed to write chapter:", err);
  }
}

// ─── Read user state ──────────────────────────────────────────────────────────

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

    // position is a struct — access by named fields
    return {
      address: userAddress,
      usdyAmount: position.usdyAmount,
      methAmount: position.methAmount,
      goalAmount: position.goalAmount,
      goalDeadline: Number(position.goalDeadline),
      riskMode: position.riskMode,
      active: position.active,
      depositedAt: Number(position.depositedAt),
      agentId: agentId as bigint,
    };
  } catch (err) {
    console.error("[executor] Failed to fetch user state:", err);
    return null;
  }
}
