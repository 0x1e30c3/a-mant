import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import cron from "node-cron";
import { fetchMacroSignals } from "./signals/macro.js";
import { fetchOnChainSignals } from "./signals/onchain.js";
import { makeDecision, shouldExecute } from "./engine/decision.js";
import {
  executeDecision,
  logAgentDecision,
  recordReputationFeedback,
  writeChapter,
  getUserState,
} from "./executor/index.js";
import { generateChapter } from "./narrator/index.js";
import { UserState } from "./types/index.js";

// Active users to monitor (in production: fetched from DB or vault events)
const MONITORED_USERS: `0x${string}`[] = (
  process.env.MONITORED_USERS?.split(",") ?? []
) as `0x${string}`[];

async function runCycle(userAddress: `0x${string}`) {
  console.log(`\n[agent] ── Cycle for ${userAddress} ──`);

  // 1. Fetch all signals in parallel
  const [macro, onChain, userState] = await Promise.all([
    fetchMacroSignals(),
    fetchOnChainSignals(),
    getUserState(userAddress),
  ]);

  if (!userState || !userState.active) {
    console.log("[agent] User not active, skipping.");
    return;
  }

  if (userState.usdyAmount === 0n && userState.methAmount === 0n) {
    console.log("[agent] No assets deposited, skipping.");
    return;
  }

  // 2. Make decision
  const decision = makeDecision(macro, onChain, userState);
  console.log(`[agent] Decision: ${decision.action} (confidence: ${Math.round(decision.confidence * 100)}%)`);
  console.log(`[agent] Reason: ${decision.reason}`);

  // 3. Execute on-chain (only if action required)
  let txHash: string | null = null;
  if (shouldExecute(decision, userState)) {
    txHash = await executeDecision(userAddress, decision, userState.agentId);
  }

  // 4. Generate narrative chapter via LLM (NVIDIA NIM) — always, even for HOLD
  const chapter = await generateChapter(decision, macro, onChain);
  console.log(`[agent] Chapter: "${chapter.title}"`);

  // 5. Write chapter on-chain — always
  await writeChapter(
    userAddress,
    chapter.title,
    chapter.narrative,
    chapter.impactAmount,
    chapter.chapterType,
    chapter.worldContext
  );

  // 6. Log agent decision (reputation + on-chain proof) — always
  if (userState.agentId > 0n) {
    await logAgentDecision(
      userState.agentId,
      decision,
      txHash ? `Executed: ${txHash}` : "HOLD — no action taken"
    );

    // 7. Publish ERC-8004 reputation signal
    await recordReputationFeedback(userState.agentId, decision);
  }

  console.log(`[agent] Cycle complete for ${userAddress}`);
}

async function runAllUsers() {
  if (MONITORED_USERS.length === 0) {
    console.log("[agent] No users to monitor. Set MONITORED_USERS env var.");
    return;
  }

  // Run cycles for all users (in parallel, with error isolation)
  await Promise.allSettled(MONITORED_USERS.map(runCycle));
}

// Main
async function main() {
  console.log("a-MANT Agent starting...");
  console.log(`Monitoring ${MONITORED_USERS.length} users`);
  console.log(`Mantle RPC: ${process.env.MANTLE_RPC_URL}`);

  // Run immediately on start
  await runAllUsers();

  // Then run every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    console.log("\n[agent] ── Scheduled cycle ──");
    await runAllUsers();
  });

  console.log("\n[agent] Running. Cycle every 15 minutes.");
}

main().catch((err) => {
  console.error("[agent] Fatal error:", err);
  process.exit(1);
});
