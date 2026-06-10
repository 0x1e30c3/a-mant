import axios from "axios";
import { MacroSignals } from "../types/index.js";

// Cache to avoid hammering APIs
let cache: { data: MacroSignals; expiresAt: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function fetchMacroSignals(): Promise<MacroSignals> {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  const [fedRate, ethStaking, mantleTvl] = await Promise.allSettled([
    fetchFedRate(),
    fetchEthStakingRate(),
    fetchMantleTvl(),
  ]);

  const signals: MacroSignals = {
    fedRatePercent: fedRate.status === "fulfilled" ? fedRate.value.rate : 5.25,
    fedRateTrend: fedRate.status === "fulfilled" ? fedRate.value.trend : "STABLE",
    ondoHealthScore: await fetchOndoHealth(),
    usdyRedemptionQueueNormal: true,
    ethStakingRatePercent: ethStaking.status === "fulfilled" ? ethStaking.value.rate : 3.8,
    ethStakingTrend: ethStaking.status === "fulfilled" ? ethStaking.value.trend : "STABLE",
    mantleTvlUsd: mantleTvl.status === "fulfilled" ? mantleTvl.value.tvl : 200_000_000,
    mantleTvlTrend: mantleTvl.status === "fulfilled" ? mantleTvl.value.trend : "STABLE",
    globalVolatilityIndex: await fetchVolatilityIndex(),
    fetchedAt: new Date(),
  };

  cache = { data: signals, expiresAt: Date.now() + CACHE_TTL };
  return signals;
}

async function fetchFedRate(): Promise<{ rate: number; trend: "UP" | "DOWN" | "STABLE" }> {
  try {
    // FRED API: Federal Funds Effective Rate
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) {
      return { rate: 5.25, trend: "STABLE" };
    }

    const res = await axios.get(
      `https://api.stlouisfed.org/fred/series/observations`,
      {
        params: {
          series_id: "FEDFUNDS",
          api_key: apiKey,
          file_type: "json",
          sort_order: "desc",
          limit: 3,
        },
        timeout: 5000,
      }
    );

    const observations = res.data.observations;
    const latest = parseFloat(observations[0].value);
    const previous = parseFloat(observations[1]?.value ?? observations[0].value);

    const trend: "UP" | "DOWN" | "STABLE" =
      latest > previous + 0.1 ? "UP"
      : latest < previous - 0.1 ? "DOWN"
      : "STABLE";

    return { rate: latest, trend };
  } catch {
    return { rate: 5.25, trend: "STABLE" };
  }
}

async function fetchEthStakingRate(): Promise<{ rate: number; trend: "UP" | "DOWN" | "STABLE" }> {
  try {
    // Beacon chain staking APR from rated.network or similar
    const res = await axios.get(
      "https://beaconcha.in/api/v1/ethstore/latest",
      { timeout: 5000 }
    );

    const apr = (res.data?.data?.apr ?? 0.038) * 100;
    return { rate: apr, trend: "STABLE" };
  } catch {
    // Fallback to typical ETH staking rate
    return { rate: 3.8, trend: "STABLE" };
  }
}

async function fetchMantleTvl(): Promise<{ tvl: number; trend: "UP" | "DOWN" | "STABLE" }> {
  try {
    const res = await axios.get(
      "https://api.llama.fi/tvl/mantle",
      { timeout: 5000 }
    );
    const tvl = res.data ?? 200_000_000;
    return { tvl, trend: "STABLE" };
  } catch {
    return { tvl: 200_000_000, trend: "STABLE" };
  }
}

async function fetchOndoHealth(): Promise<number> {
  // Monitor USDY backing and redemption queue
  // In production: query Ondo Finance's API or on-chain oracle
  // For now: return healthy score with some randomness to simulate
  try {
    // Check USDY price stability via DeFiLlama or Coingecko
    const res = await axios.get(
      "https://coins.llama.fi/prices/current/mantle:0x5bE26527e817998A7206475496fDE1E68957c5A6",
      { timeout: 5000 }
    );

    const priceData = Object.values(res.data?.coins ?? {})[0] as any;
    const price = priceData?.price ?? 1.0;

    // If USDY deviates more than 0.5% from $1, health score drops
    const deviation = Math.abs(price - 1.0);
    const healthScore = Math.max(0, 100 - deviation * 10000);

    return Math.round(healthScore);
  } catch {
    return 92; // Default healthy
  }
}

async function fetchVolatilityIndex(): Promise<number> {
  try {
    // Use crypto fear & greed index as proxy
    const res = await axios.get(
      "https://api.alternative.me/fng/?limit=1",
      { timeout: 5000 }
    );
    const value = parseInt(res.data?.data?.[0]?.value ?? "50");
    // Invert: high fear = high volatility for our purposes
    return Math.max(0, Math.min(100, 100 - value));
  } catch {
    return 50;
  }
}
