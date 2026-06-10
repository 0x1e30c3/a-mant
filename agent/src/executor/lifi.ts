import axios from "axios";

const LIFI_API = "https://li.quest/v1";
const MANTLE_CHAIN_ID = "5000";
const MANTLE_TESTNET_CHAIN_ID = "5003";

const TOKEN_ADDRESS: Record<string, string> = {
  USDY: "0x5bE26527e817998A7206475496fDE1E68957c5A6",
  METH: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0",
};

export interface LifiSwapResult {
  calldata: `0x${string}`;
  toAddress: `0x${string}`;
  minReceived: bigint;
  estimatedReceived: bigint;
  gasCostUsd: string;
  durationSeconds: number;
}

/**
 * Fetch an optimal swap quote from LI.FI.
 * Returns null if no route is available (testnet, low liquidity, etc.).
 *
 * The vault address is used as both fromAddress and toAddress — the vault
 * holds funds and receives the swapped tokens directly.
 */
export async function getLifiSwapData(
  fromToken: "USDY" | "METH",
  toToken: "USDY" | "METH",
  fromAmount: bigint,
  vaultAddress: string,
  slippage = 0.005
): Promise<LifiSwapResult | null> {
  const chainId = process.env.USE_TESTNET === "true"
    ? MANTLE_TESTNET_CHAIN_ID
    : MANTLE_CHAIN_ID;

  try {
    const response = await axios.get(`${LIFI_API}/quote`, {
      params: {
        fromChain: chainId,
        toChain: chainId,
        fromToken: TOKEN_ADDRESS[fromToken],
        toToken: TOKEN_ADDRESS[toToken],
        fromAmount: fromAmount.toString(),
        fromAddress: vaultAddress,
        toAddress: vaultAddress,
        slippage: slippage.toString(),
        integrator: "a-mant",
        order: "RECOMMENDED",
      },
      timeout: 10_000,
    });

    const quote = response.data;

    if (!quote?.transactionRequest?.data) {
      console.warn("[lifi] Quote returned but missing transactionRequest.data");
      return null;
    }

    const gasCost = quote.estimate?.gasCosts?.[0]?.amountUSD ?? "0";

    return {
      calldata: quote.transactionRequest.data as `0x${string}`,
      toAddress: quote.transactionRequest.to as `0x${string}`,
      minReceived: BigInt(quote.estimate.toAmountMin),
      estimatedReceived: BigInt(quote.estimate.toAmount),
      gasCostUsd: gasCost,
      durationSeconds: quote.estimate.executionDuration ?? 30,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const msg = err.response?.data?.message ?? err.message;

      if (status === 404) {
        // No route found — common on testnet, silently fall back
        console.log(`[lifi] No route for ${fromToken}→${toToken} on chain ${chainId}`);
      } else {
        console.warn(`[lifi] Quote failed (${status}): ${msg}`);
      }
    } else {
      console.warn("[lifi] Unexpected error fetching quote:", err);
    }
    return null;
  }
}

/**
 * Sanity check: verify the LI.FI calldata targets the expected Diamond contract,
 * not an arbitrary address. Guards against agent wallet compromise.
 */
export function validateLifiCalldata(
  calldata: string,
  toAddress: string,
  lifiDiamondAddress: string
): boolean {
  return toAddress.toLowerCase() === lifiDiamondAddress.toLowerCase();
}
