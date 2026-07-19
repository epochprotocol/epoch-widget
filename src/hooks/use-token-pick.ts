import { useCallback, useMemo, useState } from 'react';
import type { EpochToken } from '../types';

export interface TokenPick<T extends EpochToken> {
  /** The address actually in effect — always present in `availableTokens`. */
  address: string;
  /** The resolved token object, or null when there is nothing to pick from. */
  token: T | null;
  /** Record the user's choice. Resolution still runs against the active list. */
  setPick: (address: string) => void;
  /** Drop the choice so the first available token takes over again. */
  clearPick: () => void;
}

/**
 * Holds the user's raw token choice and resolves it against the tokens actually
 * available right now.
 *
 * The raw pick routinely falls out of the list underneath the user: the chain
 * changes, the network toggle swaps the whole catalogue, a withdraw position
 * pins its own chain. Resolving during render — rather than letting an effect
 * write a corrected value back into state — keeps the widget from spending a
 * render displaying a token that isn't on the active chain, and from firing a
 * balance fetch for that invalid chain/token pair.
 *
 * Precedence is: the user's pick, then `preferredAddress` (an integrator
 * default), then the first token available. Anything the user chose outranks a
 * default, and a default only applies while it is still on the active chain.
 */
export function useTokenPick<T extends EpochToken>(
  availableTokens: T[],
  preferredAddress?: string,
): TokenPick<T> {
  const [pick, setPick] = useState('');

  // Resolves to the token object, so the address we hand back is always the
  // list's canonical casing — callers compare it with `===` elsewhere, and an
  // integrator's `preferredAddress` may well be cased differently.
  const token = useMemo(() => {
    if (availableTokens.length === 0) return null;
    const match = (addr: string) =>
      availableTokens.find(
        (tok) => tok.address.toLowerCase() === addr.toLowerCase(),
      );
    return (
      (pick ? match(pick) : undefined) ??
      (preferredAddress ? match(preferredAddress) : undefined) ??
      availableTokens[0]
    );
  }, [availableTokens, pick, preferredAddress]);

  const address = token?.address ?? '';

  const clearPick = useCallback(() => setPick(''), []);

  return { address, token, setPick, clearPick };
}
