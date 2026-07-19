export interface MidenAccount {
  id: string;
  label: string;
  type: 'wallet' | 'faucet';
}

export interface MidenFaucetInfo extends MidenAccount {
  type: 'faucet';
  symbol: string;
  /** Optional persisted label; decimals for math come from `useFaucetDecimals` (MidenClient + faucet component). */
  decimals?: number;
  maxSupply: string;
}

export interface VaultAsset {
  faucetId: string;
  amount: string;
}

export interface CrossChainIntentParams {
  midenAccountId: string;
  midenFaucetId: string;
  /** Set to use direct-bridge path (same-token). Omit/pass "0" to use minTokenOut reverse-quote route */
  midenAmount?: string;
  /** From `useFaucetDecimals(midenFaucetId).decimals` (same RPC path as dex-solver inventory). Required for scaling. */
  midenDecimals: number;
  evmRecipient: string;
  destinationChainId: number;
  outputTokenAddress: string;
  outputTokenDecimals?: number;
  minTokenOut: string;
}

export interface IntentResult {
  taskTypeString: string;
  intentData: Record<string, unknown>;
  solveResult?: {
    resourceLockRequired?: boolean;
    transactions?: Array<{
      to: string;
      data: string;
      value?: string;
    }>;
    compact?: any;
    hash?: string;
    nonce?: string;
    /**
     * Client-side EVM deposit into The Compact contract (depositERC20AndRegister
     * / depositNativeAndRegister). Populated by the SDK after the user's wallet
     * signs the deposit tx; only present for EVM-collateral flows.
     */
    depositResult?: {
      success?: boolean;
      transactionHash?: string;
    };
  };
  error?: string;
  /** The intent nonce used for status tracking (userAddress:intentNonce in SIO) */
  intentNonce?: string;
  /** Chain id the compact deposit landed on (= source EVM chain). */
  depositChainId?: number;
}
