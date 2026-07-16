import type { EpochChain, EpochToken } from '../types';

/** A token paired with the chain it lives on. */
interface TokenOnChain extends EpochToken {
  chain: EpochChain;
}

/**
 * Pick where the widget starts before the user has chosen anything.
 *
 * Preference order, each step narrower than the last:
 *   1. the integrator's exact chain + token, if it survived filtering
 *   2. any token on the integrator's chain
 *   3. the first token available at all
 *
 * Returns null only when there are no tokens — the caller then has nothing to
 * select and renders its empty state.
 *
 * Pure on purpose: this used to run inside an effect that wrote the result back
 * into state, which cost a render and let downstream effects (parent
 * notification, auto-quote) fire against a half-initialised selection.
 */
export function resolveDefaultSource(
  allTokens: TokenOnChain[],
  defaultChainId?: number,
  defaultTokenAddress?: string,
): TokenOnChain | null {
  if (allTokens.length === 0) return null;

  if (defaultChainId && defaultTokenAddress) {
    const exact = allTokens.find(
      (t) =>
        t.chain.id === defaultChainId &&
        t.address.toLowerCase() === defaultTokenAddress.toLowerCase(),
    );
    if (exact) return exact;
  }

  if (defaultChainId) {
    const onChain = allTokens.find((t) => t.chain.id === defaultChainId);
    if (onChain) return onChain;
  }

  return allTokens[0];
}
