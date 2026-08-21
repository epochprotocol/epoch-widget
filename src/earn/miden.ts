import { mainnetGraph, testnetGraph } from "@epoch-protocol/epoch-commons-sdk";
import {
  EVM_ZERO_ADDRESS,
  MIDEN_TO_EVM_EXTRA_TYPESTRING,
  MIDEN_VIRTUAL_CHAIN_ID,
} from "@epoch-protocol/epoch-intents-sdk";
import type { EpochChain, EpochToken } from "../types";

// Re-exported (not re-declared) so the widget's public surface keeps these names
// while the SDK stays the single source of truth — the chain id and the sentinel
// are the same values the SDK branches its EVM→Miden intent build on.
export { EVM_ZERO_ADDRESS, MIDEN_VIRTUAL_CHAIN_ID };

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

/** The virtual chain Miden tokens live on, shaped like any other EpochChain. */
export const MIDEN_CHAIN: EpochChain = {
  id: MIDEN_VIRTUAL_CHAIN_ID,
  name: "Miden",
  network: "miden-testnet",
};

/**
 * Miden graph tokens as selectable tokens on {@link MIDEN_CHAIN}, so any
 * chain/token picker can offer Miden alongside the EVM chains. The faucet id is
 * used as the token address (that's what the intent build reads back).
 */
export function getMidenChainTokens(
  isTestnet: boolean,
): Array<EpochToken & { chain: EpochChain }> {
  return getMidenGraphTokens(isTestnet).map((t) => ({
    address: t.faucetId,
    symbol: t.symbol,
    name: t.symbol,
    decimals: t.decimals,
    chainId: MIDEN_VIRTUAL_CHAIN_ID,
    chain: MIDEN_CHAIN,
  }));
}

const BECH32_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const BECH32_CHECKSUM = 1;
const BECH32M_CHECKSUM = 0x2bc830a3;
/** A Miden account id is 15 bytes; bech32 prefixes it with one address-type byte. */
const MIDEN_ACCOUNT_ID_BYTES = 15;

function bech32Polymod(values: number[]): number {
  const generator = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const value of values) {
    const top = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ value;
    for (let i = 0; i < 5; i += 1) {
      if ((top >>> i) & 1) chk ^= generator[i];
    }
  }
  return chk >>> 0;
}

function bech32HrpExpand(hrp: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < hrp.length; i += 1) out.push(hrp.charCodeAt(i) >> 5);
  out.push(0);
  for (let i = 0; i < hrp.length; i += 1) out.push(hrp.charCodeAt(i) & 31);
  return out;
}

/**
 * Decode a Miden bech32 address/account id to `0x`-prefixed hex, or null when the
 * input isn't a checksum-valid bech32(m) string.
 *
 * Hand-rolled rather than delegating to `@miden-sdk/miden-sdk`: that decoder is
 * WASM, and the widget must stay a dependency-light React package. The checksum
 * is verified so a non-bech32 string can never be silently mangled into a hex id
 * that then travels into intent extraData.
 */
function decodeMidenBech32(input: string): string | null {
  // `AccountId.toBech32` appends an `_<interface>` tag; the address itself is the
  // part before it (`mtst1ar7f…_qr7qqq9wr6w`).
  const raw = input.split("_")[0].toLowerCase();
  const sep = raw.lastIndexOf("1");
  if (sep < 1 || sep + 7 > raw.length) return null;

  const words: number[] = [];
  for (const ch of raw.slice(sep + 1)) {
    const value = BECH32_CHARSET.indexOf(ch);
    if (value < 0) return null;
    words.push(value);
  }

  const checksum = bech32Polymod([...bech32HrpExpand(raw.slice(0, sep)), ...words]);
  if (checksum !== BECH32_CHECKSUM && checksum !== BECH32M_CHECKSUM) return null;

  let acc = 0;
  let bits = 0;
  const bytes: number[] = [];
  for (const word of words.slice(0, -6)) {
    acc = (acc << 5) | word;
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      bytes.push((acc >> bits) & 0xff);
    }
  }
  if (bytes.length < MIDEN_ACCOUNT_ID_BYTES + 1) return null;

  return `0x${bytes
    .slice(1, 1 + MIDEN_ACCOUNT_ID_BYTES)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Normalize a Miden account/faucet id to hex. Hex passes through; bech32 — which
 * is what the wallet adapter hands back for `requestAssets()` faucet ids — is
 * decoded, so wallet-reported ids compare equal to the graph's hex ones.
 */
export function normalizeMidenId(id: string): string {
  const raw = (id ?? "").trim();
  if (!raw) return raw;
  if (raw.startsWith("0x") || raw.startsWith("0X")) return raw;
  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0) return `0x${raw}`;
  return decodeMidenBech32(raw) ?? raw;
}
