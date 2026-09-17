import {
  mainnetGraph,
  SOLANA_DEVNET_CHAIN_ID,
  SOLANA_MAINNET_CHAIN_ID,
  testnetGraph,
} from "@epoch-protocol/epoch-commons-sdk";
import type { EpochChain, EpochToken } from "./types";

/** Solana's protocol IDs fit the Compact's uint32 chain-id field. */
export { SOLANA_DEVNET_CHAIN_ID, SOLANA_MAINNET_CHAIN_ID };

/** Solana chain metadata, shaped for the widget's shared token picker. */
export function getSolanaChain(isTestnet: boolean): EpochChain {
  return {
    id: isTestnet ? SOLANA_DEVNET_CHAIN_ID : SOLANA_MAINNET_CHAIN_ID,
    name: isTestnet ? "Solana Devnet" : "Solana",
    network: isTestnet ? "solana-devnet" : "solana-mainnet",
  };
}

/** A Solana mint declared in Epoch's graph. */
export interface SolanaGraphToken {
  symbol: string;
  /** Base58 SPL mint. Case-sensitive — never lowercase it. */
  mint: string;
  decimals: number;
}

/**
 * Read Solana mints from Epoch's graph, the same source the allocator and
 * solver use to identify supported assets.
 */
export function getSolanaGraphTokens(isTestnet: boolean): SolanaGraphToken[] {
  const graph = (isTestnet ? testnetGraph : mainnetGraph) as unknown as {
    tokens?: Record<
      string,
      {
        contractAddress?: Record<string, string>;
        decimals?: number;
        decimalsByChain?: Record<string, number>;
      }
    >;
  };
  const out: SolanaGraphToken[] = [];
  for (const [symbol, definition] of Object.entries(graph.tokens ?? {})) {
    const mint = definition.contractAddress?.Solana;
    if (!mint) continue;
    out.push({
      symbol,
      mint,
      decimals:
        definition.decimalsByChain?.Solana ?? definition.decimals ?? 6,
    });
  }
  return out;
}

/** Solana graph tokens in the generic picker shape. */
export function getSolanaChainTokens(
  isTestnet: boolean,
): Array<EpochToken & { chain: EpochChain }> {
  const chain = getSolanaChain(isTestnet);
  return getSolanaGraphTokens(isTestnet).map((token) => ({
    address: token.mint,
    symbol: token.symbol,
    name: token.symbol,
    decimals: token.decimals,
    chainId: chain.id,
    chain,
  }));
}
