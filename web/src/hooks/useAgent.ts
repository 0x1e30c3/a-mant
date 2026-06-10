"use client";

import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { ADDRESSES, AGENT_ABI, CHRONICLE_ABI } from "@/lib/contracts";
import { AgentProfile, Chapter } from "@/types";

export function useAgentProfile() {
  const { address } = useAccount();

  const { data: hasAgentRaw } = useReadContract({
    address: ADDRESSES.AGENT,
    abi: AGENT_ABI,
    functionName: "hasAgent",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const hasAgent = !!hasAgentRaw;

  const { data: profile, isLoading } = useReadContract({
    address: ADDRESSES.AGENT,
    abi: AGENT_ABI,
    functionName: "getProfile",
    args: address ? [address] : undefined,
    query: { enabled: !!address && hasAgent },
  });

  const { data: reputation } = useReadContract({
    address: ADDRESSES.AGENT,
    abi: AGENT_ABI,
    functionName: "getReputation",
    args: address ? [address] : undefined,
    query: { enabled: !!address && hasAgent },
  });

  const raw = profile as AgentProfile | undefined;

  return {
    hasAgent,
    profile: raw?.createdAt ? raw : null,
    reputation: reputation as bigint | undefined,
    isLoading,
  };
}

export function useChapters() {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: ADDRESSES.CHRONICLE,
    abi: CHRONICLE_ABI,
    functionName: "getChapters",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 60_000 },
  });

  const { data: latestData } = useReadContract({
    address: ADDRESSES.CHRONICLE,
    abi: CHRONICLE_ABI,
    functionName: "getLatestChapter",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 60_000 },
  });

  const latest = latestData as Chapter | undefined;

  return {
    chapters: (data as Chapter[] | undefined) ?? [],
    latestChapter: latest?.timestamp ? latest : undefined,
    isLoading,
    refetch,
  };
}

export function useChapterCount() {
  const { address } = useAccount();

  const { data } = useReadContract({
    address: ADDRESSES.CHRONICLE,
    abi: CHRONICLE_ABI,
    functionName: "getChapterCount",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return { count: data as bigint | undefined };
}
