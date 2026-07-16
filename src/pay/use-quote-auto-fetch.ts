import { useEffect } from 'react';
import { useLatestRef } from '../hooks/use-latest-ref';
import type { EpochToken } from '../types';

export interface UseQuoteAutoFetchOptions {
  /** Only fixed-output flows need a quote to learn what the user pays. */
  enabled: boolean;
  sourceChainId: number | null;
  sourceToken: EpochToken | null;
  /** Destination identity — a change here invalidates the previous quote. */
  destChainId: number;
  destTokenAddress: string;
  address: string | undefined;
  hasWalletClient: boolean;
  isWrongNetwork: boolean;
  fetchQuote: (input: {
    sourceChainId: number;
    sourceToken: EpochToken;
  }) => void;
}

/**
 * Re-quotes whenever the thing being quoted changes.
 *
 * Keyed on `sourceTokenAddress` rather than the token object, and on
 * `hasWalletClient` rather than the client itself: wagmi hands back fresh
 * objects on many renders, and depending on their identity would loop quote
 * requests forever.
 */
export function useQuoteAutoFetch({
  enabled,
  sourceChainId,
  sourceToken,
  destChainId,
  destTokenAddress,
  address,
  hasWalletClient,
  isWrongNetwork,
  fetchQuote,
}: UseQuoteAutoFetchOptions): void {
  const fetchQuoteRef = useLatestRef(fetchQuote);
  const sourceTokenAddress = sourceToken?.address ?? '';

  useEffect(() => {
    if (!enabled) return;
    if (!sourceChainId || !sourceToken) return;
    if (!hasWalletClient || !address || isWrongNetwork) return;
    fetchQuoteRef.current({ sourceChainId, sourceToken });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    sourceChainId,
    sourceTokenAddress,
    address,
    hasWalletClient,
    isWrongNetwork,
    destChainId,
    destTokenAddress,
    fetchQuoteRef,
  ]);
}
