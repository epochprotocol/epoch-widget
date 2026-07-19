import { createPublicClient, http, type PublicClient } from 'viem';

const DEFAULT_RPC_URLS: Record<number, string> = {
  137: 'https://polygon.lava.build',
  10: 'https://mainnet.optimism.io',
  8453: 'https://mainnet.base.org',
  42161: 'https://arb1.arbitrum.io/rpc',
  84532: 'https://sepolia.base.org',
  11155111: 'https://eth-sepolia-testnet.api.pocket.network',
};

const clientCache = new Map<string, PublicClient>();

export function getDefaultRpcUrl(chainId: number): string | undefined {
  return DEFAULT_RPC_URLS[chainId];
}

export function resolveRpcUrl(
  chainId: number,
  customRpcUrls?: Record<number, string>,
): string | undefined {
  return customRpcUrls?.[chainId] ?? DEFAULT_RPC_URLS[chainId];
}

export function getChainPublicClient(
  chainId: number,
  customRpcUrls?: Record<number, string>,
): PublicClient | null {
  const rpcUrl = resolveRpcUrl(chainId, customRpcUrls);
  if (!rpcUrl) return null;

  const cacheKey = `${chainId}:${rpcUrl}`;
  const cached = clientCache.get(cacheKey);
  if (cached) return cached;

  const client = createPublicClient({
    chain: {
      id: chainId,
      name: `Chain ${chainId}`,
      network: `chain-${chainId}`,
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] } },
    } as any,
    transport: http(rpcUrl),
  }) as any as PublicClient;

  clientCache.set(cacheKey, client);
  return client;
}
