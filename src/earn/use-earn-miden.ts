import { useMemo } from 'react';
import type {
  EarnMidenAdapter,
  EpochChain,
  EpochToken,
} from '../types';
import {
  DEFAULT_MIDEN_FAUCET,
  MIDEN_VIRTUAL_CHAIN_ID,
  getMidenGraphTokens,
  midenFaucetKey,
} from './miden';

/** A Miden faucet offered as a source asset, with the wallet's balance if known. */
export interface MidenAsset {
  faucetId: string;
  symbol: string;
  decimals: number;
  balance?: bigint;
  logoURI?: string;
}

/** A faucet offered as a Smart Withdraw destination. */
export interface MidenDestFaucet {
  faucetId: string;
  symbol: string;
  logoURI?: string;
}

export interface UseEarnMidenOptions {
  earnMiden?: EarnMidenAdapter;
  isTestnet: boolean;
  /** Miden is only offered when the adapter is present and enabled. */
  midenEnabled: boolean;
  fundingSource: 'evm' | 'miden';
  selectedMidenFaucetId: string;
  earnTab: 'deposit' | 'withdraw';
  smartWithdraw: boolean;
  smartDestChainId: number | null;
  smartDestTokenAddress: string;
}

export interface EarnMiden {
  /** Source faucets for a Miden-funded deposit, balances overlaid. */
  assets: MidenAsset[];
  selectedAsset: MidenAsset | null;
  /** `selectedAsset` shaped as an EpochToken on the Miden virtual chain. */
  sourceToken: EpochToken | null;
  /** The Miden virtual chain, for the source pill. */
  chain: EpochChain;
  balance: bigint | null;
  /** Miden funding payload for the quote, or undefined when not Miden-funded. */
  quoteSource:
    | {
        accountId: string;
        faucetId: string;
        decimals: number;
        createP2IDNote: EarnMidenAdapter['createP2IDNote'];
      }
    | undefined;
  /** Faucets offered in the Smart Withdraw destination picker. */
  destFaucets: MidenDestFaucet[];
  destEnabled: boolean;
  /** Miden delivery payload for a Smart Withdraw, when fully configured. */
  smartDest:
    | { recipientAccount: string; faucetId: string; decimals: number }
    | undefined;
  /** Miden destination picked, but no account connected → quote can't be built. */
  smartDestNotReady: boolean;
}

/**
 * All Miden-specific derivation for the earn widget: source assets, the quote
 * funding payload, and the Smart Withdraw delivery target.
 *
 * Faucet ids are canonical to the Epoch graph, never to the wallet. The host
 * adapter supplies *balances* only, overlaid here by faucet id and falling back
 * to symbol, since wallets may encode the same id as bech32 or hex. An earlier
 * version filtered adapter assets by the bundled default faucet — whose id had
 * gone stale against the graph — so deposits quoted against an unresolvable
 * faucet and failed with NO_QUOTE.
 */
export function useEarnMiden({
  earnMiden,
  isTestnet,
  midenEnabled,
  fundingSource,
  selectedMidenFaucetId,
  earnTab,
  smartWithdraw,
  smartDestChainId,
  smartDestTokenAddress,
}: UseEarnMidenOptions): EarnMiden {
  const graphTokens = useMemo(() => getMidenGraphTokens(isTestnet), [isTestnet]);

  const assets = useMemo<MidenAsset[]>(() => {
    const adapterAssets = earnMiden?.assets ?? [];
    if (graphTokens.length === 0) return adapterAssets;
    return graphTokens.map((t) => {
      const match =
        adapterAssets.find(
          (a) => midenFaucetKey(a.faucetId) === midenFaucetKey(t.faucetId),
        ) ??
        adapterAssets.find(
          (a) => (a.symbol ?? '').toUpperCase() === t.symbol.toUpperCase(),
        );
      return {
        faucetId: t.faucetId,
        symbol: t.symbol,
        decimals: t.decimals,
        balance: match?.balance,
        logoURI: match?.logoURI,
      };
    });
  }, [earnMiden?.assets, graphTokens]);

  // Falls back to the first asset, so a faucet id left over from another network
  // can never strand the picker on nothing.
  const selectedAsset = useMemo(
    () =>
      assets.find(
        (a) => a.faucetId.toLowerCase() === selectedMidenFaucetId.toLowerCase(),
      ) ??
      assets[0] ??
      null,
    [assets, selectedMidenFaucetId],
  );

  const sourceToken = useMemo<EpochToken | null>(() => {
    if (!selectedAsset) return null;
    return {
      address: '0x0000000000000000000000000000000000000000',
      symbol: selectedAsset.symbol,
      name: selectedAsset.symbol,
      decimals: selectedAsset.decimals,
      chainId: MIDEN_VIRTUAL_CHAIN_ID,
      logoURI: selectedAsset.logoURI,
    };
  }, [selectedAsset]);

  const chain = useMemo<EpochChain>(
    () => ({
      id: MIDEN_VIRTUAL_CHAIN_ID,
      name: 'Miden',
      network: 'miden-testnet',
    }),
    [],
  );

  // Memoized because it feeds the quote callback's deps — an inline object would
  // make that callback (and the auto-quote effect) re-fire every render, looping
  // quote fetches.
  const quoteSource = useMemo(
    () =>
      fundingSource === 'miden' && earnMiden?.accountId && selectedAsset
        ? {
            accountId: earnMiden.accountId,
            faucetId: selectedAsset.faucetId,
            decimals: selectedAsset.decimals,
            createP2IDNote: earnMiden.createP2IDNote,
          }
        : undefined,
    [
      fundingSource,
      earnMiden?.accountId,
      earnMiden?.createP2IDNote,
      selectedAsset,
    ],
  );

  // Destination tokens come from the Epoch graph — `getEpochTokensByChainEnv` is
  // EVM-only and returns nothing for the Miden virtual chain. Adapter assets and
  // the bundled default are fallbacks for a graph with no Miden tokens.
  const destFaucets = useMemo<MidenDestFaucet[]>(() => {
    if (graphTokens.length > 0) {
      return graphTokens.map((t) => ({ faucetId: t.faucetId, symbol: t.symbol }));
    }
    if (assets.length > 0) {
      return assets.map((a) => ({
        faucetId: a.faucetId,
        symbol: a.symbol,
        logoURI: a.logoURI,
      }));
    }
    return [
      { faucetId: DEFAULT_MIDEN_FAUCET.faucetId, symbol: DEFAULT_MIDEN_FAUCET.symbol },
    ];
  }, [graphTokens, assets]);

  // The withdrawal still executes on the EVM position chain; only the swap-leg
  // output is bridged. The connected adapter account is the recipient — the same
  // one used to fund Miden deposits.
  const smartDest = useMemo(() => {
    if (
      earnTab !== 'withdraw' ||
      !smartWithdraw ||
      smartDestChainId !== MIDEN_VIRTUAL_CHAIN_ID ||
      !earnMiden?.accountId ||
      !smartDestTokenAddress
    ) {
      return undefined;
    }
    return {
      recipientAccount: earnMiden.accountId,
      faucetId: smartDestTokenAddress,
      decimals:
        graphTokens.find(
          (t) => t.faucetId.toLowerCase() === smartDestTokenAddress.toLowerCase(),
        )?.decimals ?? DEFAULT_MIDEN_FAUCET.decimals,
    };
  }, [
    earnTab,
    smartWithdraw,
    smartDestChainId,
    smartDestTokenAddress,
    earnMiden?.accountId,
    graphTokens,
  ]);

  const smartDestNotReady =
    earnTab === 'withdraw' &&
    smartWithdraw &&
    smartDestChainId === MIDEN_VIRTUAL_CHAIN_ID &&
    !smartDest;

  return {
    assets,
    selectedAsset,
    sourceToken,
    chain,
    balance: selectedAsset?.balance ?? null,
    quoteSource,
    destFaucets,
    // Offered whenever the adapter is present; a recipient is enforced by
    // `smartDest` / `smartDestNotReady`, which prompt a connect instead.
    destEnabled: midenEnabled,
    smartDest,
    smartDestNotReady,
  };
}
