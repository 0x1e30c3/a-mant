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
  chains: [mantle, mantleTestnet],
  connectors: [injected()],
  transports: {
    [mantle.id]: http(),
    [mantleTestnet.id]: http(),
  },
});
