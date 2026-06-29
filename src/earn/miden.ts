/** Virtual chain id used in the widget UI for Miden-sourced deposits. */
export const MIDEN_VIRTUAL_CHAIN_ID = 999_999_999;

export const EVM_ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

/**
 * Default Miden testnet faucet — USDC on Miden (matches epoch graph `Miden` key).
 * Only this asset is surfaced in the earn widget for now.
 */
export const DEFAULT_MIDEN_FAUCET = {
  faucetId: "0x2458e5446128e6b150b75b8ebd9ce1",
  symbol: "USDC",
  decimals: 6,
} as const;

/** Lowercase hex key (no `0x`) for comparing faucet ids from different encodings. */
export function midenFaucetKey(id: string): string {
  const normalized = normalizeMidenId(id).toLowerCase();
  return normalized.startsWith("0x") ? normalized.slice(2) : normalized;
}

export function isDefaultMidenFaucet(id: string): boolean {
  return midenFaucetKey(id) === midenFaucetKey(DEFAULT_MIDEN_FAUCET.faucetId);
}

/** Miden extraData fields appended to earn protocol-interaction intents. */
export const EARN_MIDEN_EXTRA_FIELDS = [
  "string midenSourceAccount",
  "string midenFaucetId",
  "string midenNoteType",
  "string midenNoteId",
  "uint256 midenReclaimHeight",
] as const;

/** Pass-through normalizer — callers should supply hex account/faucet ids from the adapter. */
export function normalizeMidenId(id: string): string {
  const raw = (id ?? "").trim();
  if (!raw) return raw;
  if (raw.startsWith("0x") || raw.startsWith("0X")) return raw;
  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0) return `0x${raw}`;
  return raw;
}
