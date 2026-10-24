import { useMemo } from "react";
import type { SolanaAdapter } from "../types";
import {
  SOLANA_DEVNET_CHAIN_ID,
  SOLANA_MAINNET_CHAIN_ID,
} from "../solana";
import type { DestinationSelection } from "./use-destination-selection";
import type { SourceSelection } from "./use-source-selection";

/** Solana-funded intent payload supplied to the flows SDK. */
export interface PaySwapSolanaSource {
  accountId: string;
  mint: string;
  decimals: number;
  openEscrow: NonNullable<SolanaAdapter["openEscrow"]>;
}

/** Solana destination payload supplied to the flows SDK. */
export interface PaySwapSolanaDest {
  recipientAccount: string;
  mint: string;
  decimals: number;
  chainId: number;
}

export interface PaySwapSolana {
  isSolanaSource: boolean;
  isSolanaDest: boolean;
  solanaConnected: boolean;
  solanaSource: PaySwapSolanaSource | undefined;
  solanaDest: PaySwapSolanaDest | undefined;
  /** Source-token balance from the host adapter — EVM RPC cannot read SPL. */
  solanaBalance: bigint | null;
}

export interface UsePaySwapSolanaOptions {
  solana?: SolanaAdapter;
  source: SourceSelection;
  destination: DestinationSelection;
}

function isSolanaChain(chainId: number | null): boolean {
  return (
    chainId === SOLANA_MAINNET_CHAIN_ID || chainId === SOLANA_DEVNET_CHAIN_ID
  );
}

/** Derives stable Solana quote/submit payloads from picker state and host wallet. */
export function usePaySwapSolana({
  solana,
  source,
  destination,
}: UsePaySwapSolanaOptions): PaySwapSolana {
  const isSolanaSource = isSolanaChain(source.chainId);
  const isSolanaDest = isSolanaChain(destination.chainId);
  const solanaConnected = !!solana?.connected;
  const accountId = solana?.accountId ?? undefined;

  const solanaSource = useMemo<PaySwapSolanaSource | undefined>(() => {
    if (
      !isSolanaSource ||
      !solanaConnected ||
      !accountId ||
      !source.token ||
      !solana?.openEscrow
    ) {
      return undefined;
    }
    return {
      accountId,
      mint: source.token.address,
      decimals: source.token.decimals,
      openEscrow: solana.openEscrow,
    };
  }, [isSolanaSource, solanaConnected, accountId, source.token, solana]);

  const solanaDest = useMemo<PaySwapSolanaDest | undefined>(() => {
    if (!isSolanaDest || !solanaConnected || !accountId) return undefined;
    return {
      recipientAccount: accountId,
      mint: destination.tokenAddress,
      decimals: destination.requiredToken.decimals,
      chainId: destination.chainId,
    };
  }, [
    isSolanaDest,
    solanaConnected,
    accountId,
    destination.tokenAddress,
    destination.requiredToken.decimals,
    destination.chainId,
  ]);

  const solanaBalance = useMemo(() => {
    if (!isSolanaSource) return null;
    return (
      solana?.assets.find((asset) => asset.mint === source.tokenAddress)
        ?.balance ?? null
    );
  }, [isSolanaSource, solana?.assets, source.tokenAddress]);

  return {
    isSolanaSource,
    isSolanaDest,
    solanaConnected,
    solanaSource,
    solanaDest,
    solanaBalance,
  };
}
