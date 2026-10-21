import {
  EPOCH_MIDEN_MAINNET_CHAIN,
  EPOCH_MIDEN_MAINNET_TOKENS,
  EPOCH_SUPPORTED_TOKENS,
} from "@epoch-protocol/epoch-flows-sdk";

interface ViteApiEnvironment {
  VITE_EPOCH_API_BASE_URL?: string;
}

function required<T>(value: T | undefined, description: string): T {
  if (value === undefined) {
    throw new Error(`Epoch Flows SDK is missing ${description}`);
  }
  return value;
}

const baseUsdc = required(
  EPOCH_SUPPORTED_TOKENS.find(
    (token) => token.chainId === 8453 && token.symbol === "USDC",
  ),
  "Base USDC metadata",
);

const midenUsdcx = required(
  EPOCH_MIDEN_MAINNET_TOKENS.find((token) => token.symbol === "USDCX"),
  "Miden mainnet USDCX metadata",
);

export const BASE_MAINNET_USDC = Object.freeze({
  symbol: baseUsdc.symbol,
  address: baseUsdc.address,
  decimals: baseUsdc.decimals,
  chainId: baseUsdc.chainId,
});

export const MIDEN_MAINNET = Object.freeze({
  chainId: EPOCH_MIDEN_MAINNET_CHAIN.id,
  network: EPOCH_MIDEN_MAINNET_CHAIN.network,
  rpcUrl: required(EPOCH_MIDEN_MAINNET_CHAIN.rpcUrl, "Miden Cedar RPC"),
  explorer: required(EPOCH_MIDEN_MAINNET_CHAIN.explorer, "Midenscan URL"),
  usdcx: Object.freeze({
    symbol: midenUsdcx.symbol,
    faucetId: midenUsdcx.address,
    decimals: midenUsdcx.decimals,
  }),
});

export function resolveEpochApiBaseUrl(env: ViteApiEnvironment): string {
  const configured = env.VITE_EPOCH_API_BASE_URL?.trim();
  return configured ? configured.replace(/\/$/, "") : "/allocator";
}
