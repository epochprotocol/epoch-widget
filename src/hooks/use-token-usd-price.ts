import { useEffect, useRef, useState } from 'react';

export type UsdPriceFn = (token: {
  chainId: number;
  address: string;
  symbol: string;
}) => number | null | Promise<number | null>;

interface Options {
  chainId: number | null;
  tokenAddress: string;
  tokenSymbol: string;
  /** Integrator-supplied price lookup. Omit to disable USD display. */
  resolver?: UsdPriceFn | null;
}

interface Result {
  priceUsd: number | null;
  isLoading: boolean;
}

const cacheKey = (chainId: number, addr: string) => `${chainId}:${addr.toLowerCase()}`;

/**
 * Fetch USD spot price for the active source token via integrator-supplied
 * callback. Caches results per `(chainId, address)` so flipping back to a
 * recently-seen token is instant. No-op when no resolver is provided.
 */
export function useTokenUsdPrice({
  chainId,
  tokenAddress,
  tokenSymbol,
  resolver,
}: Options): Result {
  const cacheRef = useRef<Map<string, number | null>>(new Map());
  const inflightRef = useRef<Map<string, Promise<number | null>>>(new Map());
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!resolver || !chainId || !tokenAddress || !tokenAddress.startsWith('0x')) {
      setPriceUsd(null);
      setIsLoading(false);
      return;
    }
    const key = cacheKey(chainId, tokenAddress);
    const cached = cacheRef.current.get(key);
    if (cached !== undefined) {
      setPriceUsd(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const existing = inflightRef.current.get(key);
    const fetchP = existing ?? Promise.resolve(
      resolver({ chainId, address: tokenAddress, symbol: tokenSymbol }),
    );
    if (!existing) inflightRef.current.set(key, fetchP);

    fetchP
      .then((value) => {
        cacheRef.current.set(key, value ?? null);
        inflightRef.current.delete(key);
        if (cancelled) return;
        setPriceUsd(value ?? null);
        setIsLoading(false);
      })
      .catch(() => {
        cacheRef.current.set(key, null);
        inflightRef.current.delete(key);
        if (cancelled) return;
        setPriceUsd(null);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chainId, tokenAddress, tokenSymbol, resolver]);

  return { priceUsd, isLoading };
}
