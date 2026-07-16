import { useCallback, useMemo, useState } from 'react';
import { getEpochChains, getEpochTokensByChainEnv } from '../epoch-config';
import { useTokenPick } from '../hooks/use-token-pick';
import type { TokenWithChain } from '../components/TokenSelector';
import type { EpochChain, EpochIntentWidgetProps } from '../types';
import { resolveDefaultSource } from './resolve-default-source';

export interface UseSourceSelectionOptions {
  /** Also the eviction key: a pick made on one network can't survive a flip. */
  isTestnet: boolean;
  sourceChainIds?: number[];
  sourceTokenFilter?: EpochIntentWidgetProps['sourceTokenFilter'];
  defaultSourceChainId?: number;
  defaultSourceTokenAddress?: string;
}

export interface SourceSelection {
  availableChains: EpochChain[];
  /** Every source token on offer, after the integrator's filters. */
  allTokens: TokenWithChain[];
  chainId: number | null;
  chain: EpochChain | undefined;
  tokenAddress: string;
  token: TokenWithChain | null;
  select: (chainId: number, tokenAddress: string) => void;
}

/**
 * Resolves what the user is paying with, and from where.
 *
 * Precedence: the user's pick, then the integrator's default, then the first
 * token available. All three resolve during render, so the chain and token can
 * never be observed half-set — an earlier effect-based version set the chain
 * first and let downstream effects fire against a selection with no token yet.
 */
export function useSourceSelection({
  isTestnet,
  sourceChainIds,
  sourceTokenFilter,
  defaultSourceChainId,
  defaultSourceTokenAddress,
}: UseSourceSelectionOptions): SourceSelection {
  // Stores which network the pick was made on, so flipping networks evicts it
  // rather than leaving a chain that no longer exists in the list.
  const [pick, setPick] = useState<{
    forTestnet: boolean;
    chainId: number;
  } | null>(null);
  const chainIdPick = pick?.forTestnet === isTestnet ? pick.chainId : null;

  const sourceChainIdsKey = sourceChainIds ? sourceChainIds.join(',') : '';
  const availableChains = useMemo(() => {
    const all = getEpochChains(isTestnet);
    if (!sourceChainIds || sourceChainIds.length === 0) return all;
    const allow = new Set(sourceChainIds);
    return all.filter((c) => allow.has(c.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTestnet, sourceChainIdsKey]);

  const allTokens = useMemo((): TokenWithChain[] => {
    const flat = availableChains.flatMap((chain) =>
      getEpochTokensByChainEnv(chain.id, isTestnet).map((tok) => ({
        ...tok,
        chain,
      })),
    );
    return sourceTokenFilter ? flat.filter(sourceTokenFilter) : flat;
  }, [availableChains, isTestnet, sourceTokenFilter]);

  const defaultSource = useMemo(
    () =>
      resolveDefaultSource(
        allTokens,
        defaultSourceChainId,
        defaultSourceTokenAddress,
      ),
    [allTokens, defaultSourceChainId, defaultSourceTokenAddress],
  );

  const chainId = chainIdPick ?? defaultSource?.chain.id ?? null;

  // Derived from the filtered `allTokens` so `sourceTokenFilter` applies here
  // too, rather than only to the picker's list.
  const availableTokens = useMemo(
    () => allTokens.filter((tok) => tok.chain.id === chainId),
    [allTokens, chainId],
  );

  // The token pick needs no eviction key: it already resolves against the
  // active list, so a token from the other network simply isn't found.
  const { address, token, setPick: setTokenPick } = useTokenPick(
    availableTokens,
    defaultSource?.address,
  );

  const select = useCallback(
    (nextChainId: number, nextTokenAddress: string) => {
      setPick({ forTestnet: isTestnet, chainId: nextChainId });
      setTokenPick(nextTokenAddress);
    },
    [isTestnet, setTokenPick],
  );

  return {
    availableChains,
    allTokens,
    chainId,
    chain: availableChains.find((c) => c.id === chainId),
    tokenAddress: address,
    token,
    select,
  };
}
