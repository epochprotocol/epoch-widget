import { useEffect } from 'react';
import { useLatestRef } from '../hooks/use-latest-ref';
import type { EpochToken } from '../types';
import type {
  PaySwapMidenSource,
  PaySwapMidenDest,
} from './use-pay-swap-miden';

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
  /** Miden legs must be quoted with the same payload they'll submit with. */
  midenSource?: PaySwapMidenSource;
  midenDest?: PaySwapMidenDest;
  fetchQuote: (input: {
    sourceChainId: number;
    sourceToken: EpochToken;
    midenSource?: PaySwapMidenSource;
    midenDest?: PaySwapMidenDest;
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
  midenSource,
  midenDest,
  fetchQuote,
}: UseQuoteAutoFetchOptions): void {
  const fetchQuoteRef = useLatestRef(fetchQuote);
  const sourceTokenAddress = sourceToken?.address ?? '';
  // Re-quote when the Miden payload resolves (e.g. the wallet connects); the
  // engine already excludes a Miden source from `isWrongNetwork`.
  const midenKey = `${midenSource?.accountId ?? ''}|${midenDest?.recipientAccount ?? ''}`;

  useEffect(() => {
    if (!enabled) return;
    if (!sourceChainId || !sourceToken) return;
    if (!hasWalletClient || !address || isWrongNetwork) return;
    fetchQuoteRef.current({ sourceChainId, sourceToken, midenSource, midenDest });
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
    midenKey,
    fetchQuoteRef,
  ]);
}
