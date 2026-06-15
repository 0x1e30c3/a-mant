"use client";

import { useState, useEffect } from "react";

type APYData = {
  usdy: {
    apy: string;
    provider: string;
    type: string;
    updated: number;
  };
  meth: {
    apy: string;
    provider: string;
    type: string;
    updated: number;
  };
};

export function useAPY() {
  const [data, setData] = useState<APYData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAPY = async () => {
      try {
        const res = await fetch("/api/apy");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch APY:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAPY();
    // Refresh every 30 minutes
    const interval = setInterval(fetchAPY, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    isLoading,
    usdyAPY: data?.usdy.apy || "4.50",
    methAPY: data?.meth.apy || "3.80",
  };
}
