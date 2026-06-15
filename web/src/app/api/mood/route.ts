import { NextResponse } from "next/server";

// Mock implementation — replace with actual agent decision data
// In production, this would read from the agent's last cycle data
export async function GET() {
  try {
    // TODO: Read from agent's last decision or on-chain AgentProfile.lastDecision
    // For now, return a computed mood based on a simple heuristic

    // Mock signal scores (0-100) — in production, fetch from agent API
    const fearGreedIndex = 62; // from alternative.me API
    const volatility = 0.15; // ETH 30-day volatility

    // Compute blended mood
    let moodLevel = 0;

    if (fearGreedIndex < 25 || volatility > 0.4) {
      moodLevel = 3; // High stress
    } else if (fearGreedIndex < 40 || volatility > 0.3) {
      moodLevel = 2; // Elevated risk
    } else if (fearGreedIndex < 55 || volatility > 0.2) {
      moodLevel = 1; // Mild tension
    } else {
      moodLevel = 0; // Calm
    }

    return NextResponse.json({
      moodLevel,
      signals: {
        fearGreed: fearGreedIndex,
        volatility,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching mood:", error);
    return NextResponse.json({ moodLevel: 0 }, { status: 200 }); // Fallback to calm
  }
}
