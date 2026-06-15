import { NextResponse } from "next/server";

// Cache for 1 hour
let cache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    // Check cache
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json(cache.data);
    }

    // TODO: Fetch live APY data
    // - USDY APY: Ondo Finance API or on-chain price feed
    // - mETH APY: Mantle LSP staking rate (can use agent/src/signals/onchain.ts logic)

    // Mock data for now
    const data = {
      usdy: {
        apy: "4.52",
        provider: "Ondo Finance",
        type: "Treasury",
        updated: Date.now(),
      },
      meth: {
        apy: "3.81",
        provider: "Mantle",
        type: "ETH Staking",
        updated: Date.now(),
      },
    };

    // Update cache
    cache = { data, timestamp: Date.now() };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching APY data:", error);

    // Return fallback values
    return NextResponse.json(
      {
        usdy: { apy: "4.50", provider: "Ondo Finance", type: "Treasury", updated: Date.now() },
        meth: { apy: "3.80", provider: "Mantle", type: "ETH Staking", updated: Date.now() },
      },
      { status: 200 }
    );
  }
}
