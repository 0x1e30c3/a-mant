import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";

export const mantle = defineChain({
  id: 5000,
  name: "Mantle",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mantle.xyz"] },
    public: { http: ["https://rpc.mantle.xyz"] },
  },
  blockExplorers: {
    default: { name: "Mantle Explorer", url: "https://explorer.mantle.xyz" },
  },
});

export const mantleTestnet = defineChain({
  id: 5003,
  name: "Mantle Testnet",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia.mantle.xyz"] },
    public: { http: ["https://rpc.sepolia.mantle.xyz"] },
  },
  blockExplorers: {
    default: { name: "Mantle Testnet Explorer", url: "https://explorer.sepolia.mantle.xyz" },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [mantleTestnet, mantle],
  connectors: [injected()],
  transports: {
    [mantleTestnet.id]: http(undefined, { retryCount: 3, retryDelay: 1500 }),
    [mantle.id]: http(undefined, { retryCount: 3, retryDelay: 1500 }),
  },
});
