import { createPublicClient, http, parseAbi } from "viem";
import { OnChainSignals, ProtocolAPY } from "../types/index.js";

const mantleChain = {
  id: 5000,
  name: "Mantle",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.MANTLE_RPC_URL ?? "https://rpc.mantle.xyz"] },
  },
} as const;

const publicClient = createPublicClient({
  chain: mantleChain,
  transport: http(),
});

// Aave V3 Pool on Mantle
const AAVE_POOL = "0xcC1e9a0b9a5bc5DD0a97b1e2a09cC7CE34a0F6E" as `0x${string}`;
const USDY_ADDRESS = "0x5bE26527e817998A7206475496fDE1E68957c5A6" as `0x${string}`;
const METH_ADDRESS = "0xcDA86A272531e8640cD7F1a92c01839911B90bb0" as `0x${string}`;

const AAVE_POOL_ABI = parseAbi([
  "function getReserveData(address asset) view returns (uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt)",
]);

// Cache
let cache: { data: OnChainSignals; expiresAt: number } | null = null;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export async function fetchOnChainSignals(): Promise<OnChainSignals> {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  const protocols = await Promise.all([
    fetchAaveAPY("USDY", USDY_ADDRESS),
    fetchAaveAPY("METH", METH_ADDRESS),
    fetchAgniAPY("USDY"),
    fetchAgniAPY("METH"),
  ]);

  const validProtocols = protocols.filter((p) => p !== null) as ProtocolAPY[];

  const usdyProtocols = validProtocols.filter((p) => p.token === "USDY");
  const methProtocols = validProtocols.filter((p) => p.token === "METH");

  const bestUsdy = usdyProtocols.reduce(
    (best, p) => (p.apy > best.apy ? p : best),
    usdyProtocols[0] ?? { apy: 4.5, protocol: "Aave" }
  );

  const bestMeth = methProtocols.reduce(
    (best, p) => (p.apy > best.apy ? p : best),
    methProtocols[0] ?? { apy: 3.8, protocol: "Aave" }
  );

  const signals: OnChainSignals = {
    protocols: validProtocols,
    bestUsdyApy: bestUsdy.apy,
    bestMethApy: bestMeth.apy,
    bestUsdyProtocol: bestUsdy.protocol,
    bestMethProtocol: bestMeth.protocol,
    fetchedAt: new Date(),
  };

  cache = { data: signals, expiresAt: Date.now() + CACHE_TTL };
  return signals;
}

async function fetchAaveAPY(
  token: "USDY" | "METH",
  tokenAddress: `0x${string}`
): Promise<ProtocolAPY | null> {
  try {
    const data = await publicClient.readContract({
      address: AAVE_POOL,
      abi: AAVE_POOL_ABI,
      functionName: "getReserveData",
      args: [tokenAddress],
    });

    // currentLiquidityRate is in RAY (1e27), convert to APY %
    const liquidityRateRay = data[2]; // index 2 = currentLiquidityRate
    const apyDecimal = Number(liquidityRateRay) / 1e27;
    const apy = apyDecimal * 100;

    return {
      protocol: "Aave",
      token,
      apy: apy > 0 ? apy : token === "USDY" ? 4.5 : 3.8,
      tvlUsd: 0,
      utilizationRate: 0,
    };
  } catch {
    // Fallback APYs based on typical rates
    return {
      protocol: "Aave",
      token,
      apy: token === "USDY" ? 4.5 : 3.8,
      tvlUsd: 0,
      utilizationRate: 0,
    };
  }
}

async function fetchAgniAPY(token: "USDY" | "METH"): Promise<ProtocolAPY | null> {
  // Agni Finance: concentrated liquidity pool fees as yield proxy
  // In production: query Agni's subgraph for real fee APY
  // Fallback to typical rates
  return {
    protocol: "Agni Finance",
    token,
    apy: token === "USDY" ? 5.1 : 4.2,
    tvlUsd: 0,
    utilizationRate: 0,
  };
}
