import { useMemo } from "react";
import type { EpochChain, EpochToken, SolanaAdapter } from "../types";
import { getSolanaChain, getSolanaChainTokens } from "../solana";

export interface EarnSolanaAsset {
  mint: string;
  symbol: string;
  decimals: number;
  balance?: bigint;
  logoURI?: string;
}

export interface UseEarnSolanaOptions {
  solana?: SolanaAdapter;
  isTestnet: boolean;
  solanaEnabled: boolean;
  fundingSource: "evm" | "miden" | "solana";
  selectedSolanaMint: string;
}

export interface EarnSolana {
  /** SPL assets the host made available for an Earn deposit. */
  assets: EarnSolanaAsset[];
  selectedAsset: EarnSolanaAsset | null;
  sourceToken: EpochToken | null;
  chain: EpochChain;
  balance: bigint | null;
  /** Solana collateral payload for the quote and post-quote escrow open. */
  quoteSource:
    | {
        accountId: string;
        mint: string;
        decimals: number;
        openEscrow: NonNullable<SolanaAdapter["openEscrow"]>;
      }
    | undefined;
}

/**
 * Converts the host-owned Solana adapter into the source shape Earn consumes.
 *
 * Solana Earn is deliberately testnet-only for now: it must use the allocator's
 * Devnet escrow program and a Devnet SPL mint. A mainnet adapter is never
 * silently pointed at a Devnet endpoint.
 */
export function useEarnSolana({
  solana,
  isTestnet,
  solanaEnabled,
  fundingSource,
  selectedSolanaMint,
}: UseEarnSolanaOptions): EarnSolana {
  const assets = useMemo<EarnSolanaAsset[]>(() => {
    if (!solanaEnabled || !isTestnet) return [];
    const graphTokens = getSolanaChainTokens(true);
    return solana?.assets.map((asset) => {
      const graph = graphTokens.find((token) => token.address === asset.mint);
      return {
        mint: asset.mint,
        symbol: graph?.symbol ?? asset.symbol,
        decimals: graph?.decimals ?? asset.decimals,
        balance: asset.balance,
        logoURI: asset.logoURI ?? graph?.logoURI,
      };
    }) ?? [];
  }, [isTestnet, solana?.assets, solanaEnabled]);

  const selectedAsset = useMemo(
    () =>
      assets.find((asset) => asset.mint === selectedSolanaMint) ??
      assets[0] ??
      null,
    [assets, selectedSolanaMint],
  );

  const chain = useMemo(() => getSolanaChain(true), []);
  const sourceToken = useMemo<EpochToken | null>(
    () =>
      selectedAsset
        ? {
            address: selectedAsset.mint,
            symbol: selectedAsset.symbol,
            name: selectedAsset.symbol,
            decimals: selectedAsset.decimals,
            chainId: chain.id,
            logoURI: selectedAsset.logoURI,
          }
        : null,
    [chain.id, selectedAsset],
  );

  const quoteSource = useMemo(
    () =>
      fundingSource === "solana" &&
      solana?.accountId &&
      selectedAsset &&
      solana.openEscrow
        ? {
            accountId: solana.accountId,
            mint: selectedAsset.mint,
            decimals: selectedAsset.decimals,
            openEscrow: solana.openEscrow,
          }
        : undefined,
    [fundingSource, selectedAsset, solana?.accountId, solana?.openEscrow],
  );

  return {
    assets,
    selectedAsset,
    sourceToken,
    chain,
    balance: selectedAsset?.balance ?? null,
    quoteSource,
  };
}
