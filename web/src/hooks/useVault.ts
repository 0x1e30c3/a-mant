"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { useAccount } from "wagmi";
import { ADDRESSES, VAULT_ABI, ERC20_ABI } from "@/lib/contracts";
import { UserPosition } from "@/types";
import { formatUnits } from "viem";

export function useVaultPosition() {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: ADDRESSES.VAULT,
    abi: VAULT_ABI,
    functionName: "getPosition",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 30_000 },
  });

  const pos = data as UserPosition | undefined;

  if (!pos || pos.depositedAt === 0n) {
    return { position: null, isLoading, refetch };
  }

  return {
    position: {
      ...pos,
      usdyFormatted: formatUnits(pos.usdyAmount, 18),
      methFormatted: formatUnits(pos.methAmount, 18),
      goalFormatted: formatUnits(pos.goalAmount, 18),
    },
    isLoading,
    refetch,
  };
}

export function useTotalValue() {
  const { address } = useAccount();

  const { data, isLoading } = useReadContract({
    address: ADDRESSES.VAULT,
    abi: VAULT_ABI,
    functionName: "getTotalValue",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 30_000 },
  });

  const total = data as bigint | undefined;

  return {
    totalValue: total,
    totalFormatted: total ? formatUnits(total, 18) : "0",
    isLoading,
  };
}

export function usePendingYield() {
  const { address } = useAccount();

  const { data, isLoading } = useReadContract({
    address: ADDRESSES.VAULT,
    abi: VAULT_ABI,
    functionName: "pendingYield",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 60_000 },
  });

  const yld = data as bigint | undefined;

  return {
    pendingYield: yld,
    yieldFormatted: yld ? formatUnits(yld, 18) : "0",
    isLoading,
  };
}

export function useRebalanceHistory() {
  const { address } = useAccount();

  const { data, isLoading } = useReadContract({
    address: ADDRESSES.VAULT,
    abi: VAULT_ABI,
    functionName: "getRebalanceHistory",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return { history: data as unknown[] | undefined, isLoading };
}

export function useTokenBalances() {
  const { address } = useAccount();

  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        address: ADDRESSES.USDY,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
      },
      {
        address: ADDRESSES.METH,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
      },
    ],
    query: { enabled: !!address },
  });

  const usdy = data?.[0]?.result as bigint | undefined;
  const meth = data?.[1]?.result as bigint | undefined;

  return {
    usdyBalance: usdy,
    methBalance: meth,
    usdyFormatted: usdy ? formatUnits(usdy, 18) : "0",
    methFormatted: meth ? formatUnits(meth, 18) : "0",
    isLoading,
  };
}
