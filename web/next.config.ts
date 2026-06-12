import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Optional dep MetaMask SDK only needs in React Native — stub it on web.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };

    // Silence the noisy (harmless) warnings from wallet/web3 deps.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /@metamask\/sdk/ },
      { module: /node_modules\/ox\// },
      { message: /Critical dependency: the request of a dependency is an expression/ },
    ];

    return config;
  },
};

export default nextConfig;
