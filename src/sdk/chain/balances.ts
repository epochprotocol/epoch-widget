import { erc20Abi } from 'viem';
import { getChainPublicClient } from './providers.js';

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
