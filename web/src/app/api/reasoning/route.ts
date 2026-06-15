import { NextResponse } from "next/server";

// Mock implementation — replace with actual agent reasoning data
// In production, this would read from the agent's last 15-min cycle
export async function GET() {
  try {
    // TODO: Read from agent API or on-chain AgentProfile.lastDecision
    // For now, return mock reasoning data

    const data = {
      timestamp: Date.now() - 3 * 60 * 1000, // 3 min ago
      signals: [
        { label: "Fed Funds Rate", value: "5.25%", change: "stable" as const },
        { label: "USDY APY", value: "4.52%", change: "up" as const, changeValue: "+0.08%" },
        { label: "mETH APY", value: "3.81%", change: "down" as const, changeValue: "-0.12%" },
        { label: "ETH Fear & Greed", value: "62", change: "stable" as const },
      ],
      decision: "Hold current allocation",
      confidence: 85,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching reasoning:", error);
    return NextResponse.json(
      {
        timestamp: Date.now(),
        signals: [],
        decision: "Reading signals...",
        confidence: 0,
      },
      { status: 200 }
    );
  }
}
