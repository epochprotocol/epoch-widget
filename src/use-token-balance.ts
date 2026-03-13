import { useState, useEffect } from 'react';
import { fetchTokenBalanceOnChain } from './chain-providers';

export function useTokenBalance(
  chainId: number | null,
  tokenAddress: string,
  userAddress: string | undefined,
  customRpcUrls?: Record<number, string>,
): { balance: bigint | null; isLoading: boolean } {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (
      !chainId ||
      !tokenAddress ||
      !tokenAddress.startsWith('0x') ||
      !userAddress ||
      !userAddress.startsWith('0x')
    ) {
      setBalance(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchTokenBalanceOnChain(chainId, tokenAddress, userAddress, customRpcUrls)
      .then((result) => {
        if (!cancelled) {
          setBalance(result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBalance(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chainId, tokenAddress, userAddress]);

  return { balance, isLoading };
}
