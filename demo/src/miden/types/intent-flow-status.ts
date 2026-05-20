/** Aggregated SIO rows for Miden→EVM intent tracking (mirrors miden-integration-example). */
export interface IntentFlowStatus {
  evmCompleted: boolean;
  evmTransactionHash?: string;
  evmChainId?: number;
  midenTxId?: string;
  midenStatus?: string;
  midenNoteId?: string;
  latestStatusLabel?: string;
  latestChainId?: string;
  statusCount?: number;
}
