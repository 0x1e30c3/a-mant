import { NextResponse } from "next/server";

// Cache for 24 hours
let cache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  try {
    // Check cache
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json(cache.data);
    }

    // TODO: Fetch live data from:
    // - a-MANT APY: weighted average from /api/apy (USDY + mETH)
    // - US Savings rate: FRED API (PSAVERT or similar)
    // - T-Bill: FRED 3-month treasury yield (DGS3MO)

    // Mock data for now
    const amantAPY = 4.3;
    const savingsAPY = 0.5;
    const tbillAPY = 4.2;

    const data = {
      amant: {
        apy: amantAPY.toFixed(1),
        yearlyOn1k: (1000 * (amantAPY / 100)).toFixed(0),
      },
      savings: {
        apy: savingsAPY.toFixed(1),
        yearlyOn1k: (1000 * (savingsAPY / 100)).toFixed(0),
      },
      tbill: {
        apy: tbillAPY.toFixed(1),
        yearlyOn1k: (1000 * (tbillAPY / 100)).toFixed(0),
      },
      updated: Date.now(),
    };

    // Update cache
    cache = { data, timestamp: Date.now() };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching yield comparison:", error);

    // Return fallback values
    return NextResponse.json(
      {
        amant: { apy: "4.3", yearlyOn1k: "43" },
        savings: { apy: "0.5", yearlyOn1k: "5" },
        tbill: { apy: "4.2", yearlyOn1k: "42" },
        updated: Date.now(),
      },
      { status: 200 }
    );
  }
}
