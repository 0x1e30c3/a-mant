import { NextRequest, NextResponse } from "next/server";

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";

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
    const { messages, userAddress, vaultContext, recentChapters } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Build context string
    let contextNote = "";

    if (userAddress) {
      contextNote += `[User wallet: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}]\n`;
    }

    if (vaultContext) {
      contextNote += `[Portfolio: $${vaultContext.totalValue} total, Goal: $${(
        Number(vaultContext.goalAmount) / 1e18
      ).toFixed(2)}, USDY: $${(Number(vaultContext.usdyAmount) / 1e18).toFixed(2)}, mETH: ${(
        Number(vaultContext.methAmount) / 1e18
      ).toFixed(4)}]\n`;
    }

    if (recentChapters && recentChapters.length > 0) {
      contextNote += `[Recent decisions: ${recentChapters
        .map((c: any) => `"${c.title}"`)
        .join(", ")}]\n`;
    }

    const chatMessages = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })
    );

    if (contextNote && chatMessages[0]?.role === "user") {
      chatMessages[0] = {
        role: "user",
        content: `${contextNote}\n${chatMessages[0].content}`,
      };
    }

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        max_tokens: 512,
        messages: [{ role: "system", content: SYSTEM }, ...chatMessages],
      }),
    });

    if (!response.ok) {
      throw new Error(`Nvidia NIM API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
