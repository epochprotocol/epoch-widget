import {
  createPublicClient,
  http,
  erc20Abi,
  type PublicClient,
} from 'viem';

const DEFAULT_RPC_URLS: Record<number, string> = {
  137: 'https://polygon.lava.build',
  10: 'https://mainnet.optimism.io',
  8453: 'https://api.zan.top/base-mainnet',
  42161: 'https://arb1.arbitrum.io/rpc',
  84532: 'https://sepolia.base.org',
  11155111: 'https://eth-sepolia-testnet.api.pocket.network',
};

// Cache key is `chainId:rpcUrl` so custom RPCs get their own client instances
const clientCache = new Map<string, PublicClient>();

export function getDefaultRpcUrl(chainId: number): string | undefined {
  return DEFAULT_RPC_URLS[chainId];
}

export function getChainPublicClient(
  chainId: number,
  customRpcUrls?: Record<number, string>,
): PublicClient | null {
  const rpcUrl = customRpcUrls?.[chainId] ?? DEFAULT_RPC_URLS[chainId];
  if (!rpcUrl) return null;

  const cacheKey = `${chainId}:${rpcUrl}`;
  if (clientCache.has(cacheKey)) return clientCache.get(cacheKey)!;

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

export async function fetchTokenBalanceOnChain(
  chainId: number,
  tokenAddress: string,
  userAddress: string,
  customRpcUrls?: Record<number, string>,
): Promise<bigint | null> {
  const client = getChainPublicClient(chainId, customRpcUrls);
  if (!client) return null;

  try {
    const balance = await client.readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`],
    });
    return balance as bigint;
  } catch {
    return null;
  }
}

/** Merge default RPC URLs with consumer-supplied overrides */
export function resolveRpcUrl(chainId: number, customRpcUrls?: Record<number, string>): string | undefined {
  return customRpcUrls?.[chainId] ?? DEFAULT_RPC_URLS[chainId];
}
