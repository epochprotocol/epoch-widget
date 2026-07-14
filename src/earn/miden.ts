import { mainnetGraph, testnetGraph } from "@epoch-protocol/epoch-commons-sdk";
import {
  MIDEN_TO_EVM_EXTRA_TYPESTRING,
  EVM_TO_MIDEN_EXTRA_TYPESTRING,
} from "@epoch-protocol/epoch-intents-sdk";

/** Virtual chain id used in the widget UI for Miden-sourced deposits. */
export const MIDEN_VIRTUAL_CHAIN_ID = 999_999_999;

export const EVM_ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

/**
 * Default Miden testnet faucet — USDC on Miden, the `tokens.USDC.contractAddress.Miden`
 * entry in the Epoch graph. Used only as a fallback; the live token lists come from
 * {@link getMidenGraphTokens}. (The old value `0x2458e544…` was the MIDEN faucet, not
 * USDC — SIO resolves faucets against the graph, so that id NO_QUOTE'd.)
 */
export const DEFAULT_MIDEN_FAUCET = {
  faucetId: "0xfc90f0f4da30e51168453b60eafed7",
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

/**
 * Miden extraData fields appended to earn protocol-interaction intents (Miden→EVM
 * deposit). Sourced from the SDK's canonical Miden→EVM suffix so the assembled
 * witness always ends with exactly the suffix the allocator validates (no drift,
 * no extra fields).
 */
export const EARN_MIDEN_EXTRA_FIELDS = MIDEN_TO_EVM_EXTRA_TYPESTRING.split(",");

/**
 * Miden extraData fields for an EVM→Miden delivery — the Smart Withdraw case
 * where a lending position is withdrawn on EVM and the proceeds are bridged to a
 * Miden account. Deliberately carries NO `midenSourceAccount`: its absence is
 * what flags the EVM→Miden direction to smallocator (`isEVMToMidenIntent`).
 * Sourced from the SDK's canonical EVM→Miden suffix (midenRecipientAccount +
 * midenFaucetId) so the assembled witness ends with exactly what the allocator
 * validates.
 */
export const EARN_MIDEN_WITHDRAW_EXTRA_FIELDS =
  EVM_TO_MIDEN_EXTRA_TYPESTRING.split(",");

/** A Miden-side token pulled from the Epoch graph (`tokens[*].contractAddress.Miden`). */
export interface MidenGraphToken {
  symbol: string;
  /** Miden faucet id — the "address" used as `smartDestTokenAddress` / `midenFaucetId`. */
  faucetId: string;
  decimals: number;
}

/**
 * Miden tokens declared in the Epoch graph — every token that carries a
 * `contractAddress.Miden` faucet id (USDC/DAI/USDT/WETH/WBTC on testnet). This is
 * the source of truth for the Smart Withdraw "receive on Miden" picker: the
 * widget's `getEpochTokensByChainEnv` (epoch-flows-sdk) is EVM-only and returns
 * nothing for the Miden virtual chain, so the list has to come from the graph.
 */
export function getMidenGraphTokens(isTestnet: boolean): MidenGraphToken[] {
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
  const out: MidenGraphToken[] = [];
  for (const [symbol, def] of Object.entries(graph?.tokens ?? {})) {
    const faucetId = def?.contractAddress?.Miden;
    if (!faucetId) continue;
    out.push({
      symbol,
      faucetId,
      decimals: def?.decimalsByChain?.Miden ?? def?.decimals ?? 6,
    });
  }
  return out;
}

/** Pass-through normalizer — callers should supply hex account/faucet ids from the adapter. */
export function normalizeMidenId(id: string): string {
  const raw = (id ?? "").trim();
  if (!raw) return raw;
  if (raw.startsWith("0x") || raw.startsWith("0X")) return raw;
  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0) return `0x${raw}`;
  return raw;
}
