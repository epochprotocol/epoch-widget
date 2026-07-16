import { useCallback, useMemo, useState } from 'react';
import {
  getEpochChainById,
  getEpochChains,
  getEpochTokensByChainEnv,
} from '../epoch-config';
import type { EpochChain, EpochToken, IntentConfig, IntentProps } from '../types';

/** The intent's token shape — narrower than a registry `EpochToken`. */
type RequiredToken = IntentProps['requiredToken'];

/** Fallback destinations when the intent pins none. */
const DEFAULT_DEST_CHAIN_ID = { mainnet: 8453, testnet: 84532 } as const;

interface TokenOnChain extends EpochToken {
  chain: EpochChain;
}

export interface UseDestinationSelectionOptions {
  /** The intent's config — carries the pinned destination chain. */
  intentConfig: IntentConfig;
  /** The intent's pinned destination token. */
  requiredToken: RequiredToken;
  /** Also the eviction key: an address from one network can't survive a flip. */
  isTestnet: boolean;
  /**
   * When true the destination is fixed by the integrator and the user's
   * overrides are ignored entirely.
   */
  locked: boolean;
}

export interface DestinationSelection {
  /** Every token the destination picker may offer. */
  allTokens: TokenOnChain[];
  chainId: number;
  chain: EpochChain | undefined;
  tokenAddress: string;
  /** Registry entry for the destination token, or null for a custom address. */
  meta: TokenOnChain | null;
  /** Registry entry to draw the pill from — carries the logo and decimals. */
  tokenMeta: EpochToken | undefined;
  /** The destination token to quote against — registry entry when we have one. */
  requiredToken: RequiredToken;
  /** `intentConfig` with the chosen destination chain written in. */
  intentConfig: IntentConfig;
  /** Record a user pick. No-ops downstream while `locked`. */
  select: (chainId: number, tokenAddress: string) => void;
}

/**
 * Resolves what the user receives and where.
 *
 * Two sources feed one answer: the intent props pin a destination, and — only
 * when `locked` is false — the user may override it. Everything downstream (the
 * pill, the quote inputs, the submitted intent) reads the resolved values, so
 * the override can't be honoured in one place and missed in another.
 */
export function useDestinationSelection({
  intentConfig,
  requiredToken,
  isTestnet,
  locked,
}: UseDestinationSelectionOptions): DestinationSelection {
  // Stores which network the override was set on, so flipping networks evicts
  // it rather than pointing the intent at an address from the other env.
  const [override, setOverride] = useState<{
    forTestnet: boolean;
    chainId: number;
    tokenAddress: string;
  } | null>(null);
  const active = override?.forTestnet === isTestnet ? override : null;

  const pinnedChainId =
    (isTestnet
      ? intentConfig.destinationTestnetChainId
      : intentConfig.destinationChainId) ??
    (isTestnet ? DEFAULT_DEST_CHAIN_ID.testnet : DEFAULT_DEST_CHAIN_ID.mainnet);

  const allTokens = useMemo(
    (): TokenOnChain[] =>
      getEpochChains(isTestnet).flatMap((chain) =>
        getEpochTokensByChainEnv(chain.id, isTestnet).map((tok) => ({
          ...tok,
          chain,
        })),
      ),
    [isTestnet],
  );

  const chainId = locked ? pinnedChainId : (active?.chainId ?? pinnedChainId);
  const tokenAddress = locked
    ? requiredToken.address
    : active?.tokenAddress || requiredToken.address;

  const meta = useMemo(
    () =>
      allTokens.find(
        (t) =>
          t.chain.id === chainId &&
          t.address.toLowerCase() === tokenAddress.toLowerCase(),
      ) ?? null,
    [allTokens, chainId, tokenAddress],
  );

  // Prefer the registry entry so logo and decimals are right; fall back to the
  // integrator's token for addresses we don't bundle (custom tokens).
  const resolvedRequiredToken = useMemo(
    () =>
      meta
        ? { address: meta.address, symbol: meta.symbol, decimals: meta.decimals }
        : requiredToken,
    [meta, requiredToken],
  );

  // Falls back to a same-chain lookup by the resolved token address: `meta`
  // misses when a user override points at an address the registry doesn't
  // bundle, and the pill still wants a logo.
  const tokenMeta = useMemo(
    () =>
      meta ??
      getEpochTokensByChainEnv(chainId, isTestnet).find(
        (tok) =>
          tok.address.toLowerCase() ===
          resolvedRequiredToken.address.toLowerCase(),
      ),
    [meta, chainId, isTestnet, resolvedRequiredToken.address],
  );

  const resolvedIntentConfig = useMemo(() => {
    if (locked) return intentConfig;
    return {
      ...intentConfig,
      ...(isTestnet
        ? { destinationTestnetChainId: chainId }
        : { destinationChainId: chainId }),
    };
  }, [intentConfig, isTestnet, chainId, locked]);

  const select = useCallback(
    (nextChainId: number, nextTokenAddress: string) => {
      setOverride({
        forTestnet: isTestnet,
        chainId: nextChainId,
        tokenAddress: nextTokenAddress,
      });
    },
    [isTestnet],
  );

  return {
    allTokens,
    chainId,
    chain: getEpochChainById(chainId),
    tokenAddress,
    meta,
    tokenMeta,
    requiredToken: resolvedRequiredToken,
    intentConfig: resolvedIntentConfig,
    select,
  };
}
