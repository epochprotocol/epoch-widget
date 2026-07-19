import { useState, useEffect, useMemo } from 'react';
import { fetchTokenBalanceOnChain } from './chain-providers';

export function useTokenBalance(
  chainId: number | null,
  tokenAddress: string,
  userAddress: string | undefined,
  customRpcUrls?: Record<number, string>,
): { balance: bigint | null; isLoading: boolean } {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Integrators routinely inline `api.rpcUrls`, so a fresh object identity
  // arrives every render. Key the refetch on the map's *contents* — depending
  // on the raw object would refetch forever; omitting it (the old behaviour)
  // meant an RPC-url change was silently ignored until some other dep moved.
  const rpcUrlsKey = JSON.stringify(customRpcUrls ?? null);
  const rpcUrls = useMemo(
    () =>
      rpcUrlsKey === 'null'
        ? undefined
        : (JSON.parse(rpcUrlsKey) as Record<number, string>),
    [rpcUrlsKey],
  );

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

    fetchTokenBalanceOnChain(chainId, tokenAddress, userAddress, rpcUrls)
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
  }, [chainId, tokenAddress, userAddress, rpcUrls]);

  return { balance, isLoading };
}
