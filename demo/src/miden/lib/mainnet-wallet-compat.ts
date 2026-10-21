import type { WalletAdapterNetwork } from "@miden-sdk/miden-wallet-adapter-base";

/**
 * Bread already accepts the mainnet wire value, while the 0.17.5 adapter enum
 * still declares only devnet/testnet/localnet. Keep the unavoidable cast at
 * this single compatibility boundary so it can be removed when the enum adds
 * Mainnet. Never substitute Testnet here: that silently connects the demo to
 * the wrong network.
 */
export const MIDEN_MAINNET_WALLET_NETWORK = "mainnet" as WalletAdapterNetwork;

interface MidenAccountId {
  isPublic(): boolean;
  toString(): string;
}

/** Reject private accounts before a quote can be requested. */
export function normalizeMidenAccount(
  accountId: MidenAccountId,
): { hex: string; isPublic: boolean } {
  return { hex: accountId.toString(), isPublic: accountId.isPublic() };
}

export function requirePublicMidenAccount(accountId: MidenAccountId): string {
  if (!accountId.isPublic()) {
    throw new Error("A public Miden account is required for this bridge");
  }
  return normalizeMidenAccount(accountId).hex;
}
