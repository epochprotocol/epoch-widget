import { useMemo } from 'react';
import type { EarnMidenAdapter } from '../types';
import { MIDEN_VIRTUAL_CHAIN_ID, midenFaucetKey } from '../earn/miden';
import type { SourceSelection } from './use-source-selection';
import type { DestinationSelection } from './use-destination-selection';

/** Miden→EVM funding payload — the source is a Miden P2ID note. */
export interface PaySwapMidenSource {
  accountId: string;
  faucetId: string;
  decimals: number;
  createP2IDNote: EarnMidenAdapter['createP2IDNote'];
}

/** EVM→Miden delivery payload — the output lands on a Miden account. */
export interface PaySwapMidenDest {
  recipientAccount: string;
  faucetId: string;
  decimals: number;
}

export interface PaySwapMiden {
  isMidenSource: boolean;
  isMidenDest: boolean;
  midenConnected: boolean;
  /** Funding payload, present only when the source is Miden and the wallet is ready. */
  midenSource: PaySwapMidenSource | undefined;
  /** Delivery payload, present only when the destination is Miden and the wallet is ready. */
  midenDest: PaySwapMidenDest | undefined;
  /** Miden source-token balance from the adapter — an EVM RPC can't see chain 999999999. */
  midenBalance: bigint | null;
}

export interface UsePaySwapMidenOptions {
  miden?: EarnMidenAdapter;
  source: SourceSelection;
  destination: DestinationSelection;
}

/**
 * Miden derivation for the pay/swap flow. Unlike earn — which picks Miden through
 * a dedicated funding toggle — pay/swap surfaces Miden through the ordinary source
 * and destination pickers, so the direction reads straight off the selected chain
 * ids. The injected adapter supplies the account, the P2ID signer, and balances;
 * faucet ids come from the picked token (its "address" is the faucet id).
 */
export function usePaySwapMiden({
  miden,
  source,
  destination,
}: UsePaySwapMidenOptions): PaySwapMiden {
  const isMidenSource = source.chainId === MIDEN_VIRTUAL_CHAIN_ID;
  const isMidenDest = destination.chainId === MIDEN_VIRTUAL_CHAIN_ID;
  const midenConnected = !!miden?.connected;
  const accountId = miden?.accountId ?? undefined;

  // Memoized so the quote/submit inputs stay referentially stable — an inline
  // object would re-fire the auto-quote effect on every render.
  const midenSource = useMemo<PaySwapMidenSource | undefined>(() => {
    if (!isMidenSource || !midenConnected || !accountId || !source.token) {
      return undefined;
    }
    return {
      accountId,
      faucetId: source.token.address,
      decimals: source.token.decimals,
      createP2IDNote: miden!.createP2IDNote,
    };
  }, [isMidenSource, midenConnected, accountId, source.token, miden]);

  const midenDest = useMemo<PaySwapMidenDest | undefined>(() => {
    if (!isMidenDest || !midenConnected || !accountId) return undefined;
    return {
      recipientAccount: accountId,
      faucetId: destination.tokenAddress,
      decimals: destination.requiredToken.decimals,
    };
  }, [
    isMidenDest,
    midenConnected,
    accountId,
    destination.tokenAddress,
    destination.requiredToken.decimals,
  ]);

  const midenBalance = useMemo(() => {
    if (!isMidenSource) return null;
    const key = midenFaucetKey(source.tokenAddress);
    const match = (miden?.assets ?? []).find(
      (a) => midenFaucetKey(a.faucetId) === key,
    );
    return match?.balance ?? null;
  }, [isMidenSource, miden?.assets, source.tokenAddress]);

  return {
    isMidenSource,
    isMidenDest,
    midenConnected,
    midenSource,
    midenDest,
    midenBalance,
  };
}
