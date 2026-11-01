export interface MainnetOracleGraph {
  oracles?: Record<string, { rpcUrl: string }>;
}

export const DEFAULT_MIDEN_MAINNET_RPC_URL = "https://rpc.cedar.miden.io";

/**
 * commons-sdk 2.0.0's published mainnet graph omits the oracle entry that the
 * pinned flows SDK reads at module initialization. Populate that missing
 * compatibility field before importing the flows SDK.
 */
export function ensurePragmaMidenMainnetOracle(
  graph: MainnetOracleGraph,
  rpcUrl: string,
): { oracles: Record<string, { rpcUrl: string }> } {
  graph.oracles ??= {};
  graph.oracles.PragmaMidenV1 ??= { rpcUrl };
  return { oracles: graph.oracles };
}
