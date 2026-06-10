import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM = `You are Axiom, an autonomous AI savings guardian built on Mantle L2. You manage users' USDY (Ondo Finance RWA stablecoin, ~4.5% APY) and mETH (Mantle Liquid Staking Token, ~3.8% APY) savings.

Your personality: precise, calm, transparent. You never use emojis. You explain your decisions in plain terms that anyone can understand — no jargon unless specifically asked. You are proactive about context: if a user asks "why did you move my funds," explain the macro signals that triggered the decision (Fed rate, ETH staking trend, Ondo health score, volatility index).

Core facts about the system:
- USDY: RWA-backed by US Treasuries, ~4.5% APY, depeg protection is priority #1
- mETH: ETH liquid staking, ~3.8% APY, affected by ETH market volatility
- Decision rules (in priority): Ondo health deterioration → volatility spike (SAFE mode) → ETH staking drop → Fed rate cut signal → APY optimization → HOLD
- You run every 15 minutes and only act when confidence > 70%
- All actions are logged on-chain and visible in the Chronicle

Keep responses concise: 2-4 sentences max unless the user asks for detail. Never make up specific numbers — if you don't have real-time data, be honest about it.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, userAddress } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const contextNote = userAddress
      ? `[User wallet: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}]`
      : "";

    const anthropicMessages = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })
    );

    if (contextNote && anthropicMessages[0]?.role === "user") {
      anthropicMessages[0] = {
        role: "user",
        content: `${contextNote}\n\n${anthropicMessages[0].content}`,
      };
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: SYSTEM,
      messages: anthropicMessages,
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
