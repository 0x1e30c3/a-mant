import Anthropic from "@anthropic-ai/sdk";
import { Decision, MacroSignals, OnChainSignals, ChapterData } from "../types/index.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CHAPTER_TYPE_MAP: Record<string, 0 | 1 | 2 | 3 | 4> = {
  REBALANCE: 0,
  PROTECT: 1,
  MILESTONE: 2,
  COMPOUND: 3,
  DISTRIBUTE: 3,
  HOLD: 0,
};

export async function generateChapter(
  decision: Decision,
  macro: MacroSignals,
  onChain: OnChainSignals,
  userName?: string
): Promise<ChapterData> {
  const worldContext = buildWorldContext(macro, onChain);

  const prompt = `You are writing a short, human-readable chapter in a savings journey story.
The AI guardian (named "Axiom") just made a decision about the user's savings.

Decision made: ${decision.action}
${decision.fromToken ? `From: ${decision.fromToken}` : ""}
${decision.toToken ? `To: ${decision.toToken}` : ""}
Reason: ${decision.reason}
Signal that triggered this: ${decision.signalSource}
Estimated impact: ${formatImpact(decision.impactEstimate)}
Confidence: ${Math.round(decision.confidence * 100)}%

World context right now:
${worldContext}

Write a chapter with:
1. A short, evocative TITLE (4-6 words, like a chapter title in a novel)
2. A NARRATIVE (2-3 sentences max) that explains what happened in simple, human language. No jargon. Write as if explaining to someone who doesn't know crypto.

Respond in JSON: {"title": "...", "narrative": "..."}
Keep it personal, warm, and clear. Do not use technical terms like APY, DeFi, liquidity, protocol.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[^}]+\}/s);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title ?? generateFallbackTitle(decision),
        narrative: parsed.narrative ?? decision.reason,
        impactAmount: decision.impactEstimate,
        chapterType: CHAPTER_TYPE_MAP[decision.action] ?? 0,
        worldContext,
      };
    }
  } catch (err) {
    console.error("[narrator] Claude generation failed:", err);
  }

  // Fallback if Claude fails
  return {
    title: generateFallbackTitle(decision),
    narrative: decision.reason,
    impactAmount: decision.impactEstimate,
    chapterType: CHAPTER_TYPE_MAP[decision.action] ?? 0,
    worldContext,
  };
}

function buildWorldContext(macro: MacroSignals, onChain: OnChainSignals): string {
  const lines: string[] = [];

  lines.push(`Fed Rate: ${macro.fedRatePercent.toFixed(2)}% (${macro.fedRateTrend})`);
  lines.push(`ETH Staking Rate: ${macro.ethStakingRatePercent.toFixed(1)}% (${macro.ethStakingTrend})`);
  lines.push(`USDY Backing Health: ${macro.ondoHealthScore}/100`);
  lines.push(`Market Volatility Index: ${macro.globalVolatilityIndex}/100`);
  lines.push(`Best USDY Yield: ${onChain.bestUsdyApy.toFixed(1)}% on ${onChain.bestUsdyProtocol}`);
  lines.push(`Best mETH Yield: ${onChain.bestMethApy.toFixed(1)}% on ${onChain.bestMethProtocol}`);

  return lines.join("\n");
}

function formatImpact(wei: bigint): string {
  if (wei === 0n) return "neutral";
  const usd = Number(wei) / 1e18;
  return usd > 0
    ? `+$${usd.toFixed(4)} estimated gain`
    : `-$${Math.abs(usd).toFixed(4)} estimated loss prevented`;
}

function generateFallbackTitle(decision: Decision): string {
  const titles: Record<string, string> = {
    REBALANCE: "A Calculated Move",
    PROTECT: "Standing Guard",
    COMPOUND: "Letting It Grow",
    DISTRIBUTE: "Your Earnings, Delivered",
    HOLD: "Steady as She Goes",
  };
  return titles[decision.action] ?? "A New Chapter";
}
