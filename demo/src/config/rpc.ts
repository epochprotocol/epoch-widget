import {
  mainnet, base, optimism, polygon, arbitrum,
  baseSepolia, sepolia, optimismSepolia, robinhood, robinhoodTestnet,
} from "viem/chains";
import type { Chain } from "viem";

// Infura supports these EVM networks. Miden keeps its separate native RPC.
export const INFURA_NETWORKS: Record<number, string> = {
  1: "mainnet",
  8453: "base-mainnet",
  10: "optimism-mainnet",
  137: "polygon-mainnet",
  42161: "arbitrum-mainnet",
  84532: "base-sepolia",
  11155111: "sepolia",
  11155420: "optimism-sepolia",
};

export const DEMO_RPC_PATHS: Record<number, string> = {
  1: "/widget/rpc/ethereum",
  8453: "/widget/rpc/base",
  10: "/widget/rpc/optimism",
  137: "/widget/rpc/polygon",
  42161: "/widget/rpc/arbitrum",
  84532: "/widget/rpc/base-sepolia",
  11155111: "/widget/rpc/sepolia",
  11155420: "/widget/rpc/optimism-sepolia",
};

export function getDemoRpcUrls(env: {
  VITE_INFURA_RPC_PROXY_ENABLED?: boolean;
  VITE_ANKR_API_KEY?: string;
  VITE_BASE_RPC_URL?: string;
  VITE_ROBINHOOD_RPC_URL?: string;
  VITE_ROBINHOOD_TESTNET_RPC_URL?: string;
}): Record<number, string> {
  return {
    ...(env.VITE_INFURA_RPC_PROXY_ENABLED ? DEMO_RPC_PATHS : {
      1: mainnet.rpcUrls.default.http[0],
      8453: getBaseRpcUrl(env.VITE_ANKR_API_KEY, env.VITE_BASE_RPC_URL),
      10: "https://mainnet.optimism.io",
      137: "https://polygon.lava.build",
      42161: "https://arb1.arbitrum.io/rpc",
      84532: "https://sepolia.base.org",
      11155111: "https://eth-sepolia-testnet.api.pocket.network",
      11155420: "https://sepolia.optimism.io",
    }),
    [robinhood.id]: env.VITE_ROBINHOOD_RPC_URL?.trim() || robinhood.rpcUrls.default.http[0],
    [robinhoodTestnet.id]: env.VITE_ROBINHOOD_TESTNET_RPC_URL?.trim() || robinhoodTestnet.rpcUrls.default.http[0],
  };
}

export function getDemoChains(rpcUrls: Record<number, string>): [Chain, ...Chain[]] {
  // SDK reads may use walletClient.chain.rpcUrls rather than Wagmi's transport.
  const withRpc = (chain: Chain): Chain => ({
    ...chain,
    rpcUrls: { default: { http: [rpcUrls[chain.id]] } },
  });
  return [withRpc(mainnet), ...[
    base, optimism, polygon, arbitrum, baseSepolia, sepolia, optimismSepolia,
    robinhood, robinhoodTestnet,
  ].map(withRpc)];
}

export function getBaseRpcUrl(apiKey?: string, rpcUrl?: string): string {
  if (rpcUrl?.trim()) return rpcUrl.trim();
  const key = apiKey?.trim();
  return key
    ? `https://rpc.ankr.com/base/${key}`
    : "https://mainnet.base.org";
}
