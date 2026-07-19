import { parseUnits } from "viem";
import {
  EPOCH_SUPPORTED_TOKENS,
  EPOCH_TESTNET_TOKENS,
} from "../../config/tokens.js";
import { getChainName } from "../../config/chains.js";
import type { IntentProps } from "../../types.js";

export interface FlatPayInputs {
  toAddress?: `0x${string}`;
  toAmount?: string;
  toChainId?: number;
  toToken?: `0x${string}`;
  toTokenDecimals?: number;
  toTokenSymbol?: string;
}

export type FlatPayBuild =
  | { ok: true; intent: IntentProps }
  | { ok: false; error: string };

function looksLikeTestnet(chainId: number): boolean {
  return [84532, 11155111, 11155420, 1337, 31337].includes(chainId);
}

function lookupTokenMeta(
  chainId: number,
  tokenAddr: `0x${string}`,
): { symbol: string; decimals: number } | null {
  const isTestnet = looksLikeTestnet(chainId);
  const pool = isTestnet ? EPOCH_TESTNET_TOKENS : EPOCH_SUPPORTED_TOKENS;
  const hit = pool.find(
    (t) =>
      t.chainId === chainId &&
      t.address.toLowerCase() === tokenAddr.toLowerCase(),
  );
  return hit ? { symbol: hit.symbol, decimals: hit.decimals } : null;
}

/**
 * Build an `IntentProps` from flat Trails-style props. Used when the caller
 * doesn't pass a nested `intent={...}` object.
 *
 * Default protocol/action ("transfer"/"pay") is a placeholder — solver-side
 * action for plain wallet→wallet pay-flows should match what the allocator
 * expects. Callers needing custom protocol routing should pass `intent={...}`
 * directly.
 */
export function buildPayIntentFromFlatProps(
  input: FlatPayInputs,
): FlatPayBuild {
  const { toAddress, toAmount, toChainId, toToken } = input;
  if (!toAddress) return { ok: false, error: "Missing `toAddress`." };
  if (!toAmount) return { ok: false, error: "Missing `toAmount`." };
  if (!toChainId) return { ok: false, error: "Missing `toChainId`." };
  if (!toToken) return { ok: false, error: "Missing `toToken`." };

  const meta = lookupTokenMeta(toChainId, toToken);
  const decimals = input.toTokenDecimals ?? meta?.decimals;
  const symbol = input.toTokenSymbol ?? meta?.symbol ?? "TOKEN";
  if (decimals == null) {
    return {
      ok: false,
      error:
        "Unknown destination token. Pass `toTokenDecimals` (and `toTokenSymbol`) when using a token outside the built-in registry.",
    };
  }

  const trimmed = toAmount.trim().replace(/,/g, "");
  if (!/^\d*\.?\d+$/.test(trimmed) || Number.parseFloat(trimmed) <= 0) {
    return { ok: false, error: "Enter a valid positive `toAmount`." };
  }
  let raw: bigint;
  try {
    raw = parseUnits(trimmed, decimals);
  } catch {
    return { ok: false, error: "Could not parse `toAmount`." };
  }

  const isTestnet = looksLikeTestnet(toChainId);

  const intent: IntentProps = {
    requiredToken: { address: toToken, symbol, decimals },
    requiredAmount: raw,
    destinationChainName: getChainName(toChainId),
    receiver: toAddress,
    config: {
      protocol: "transfer",
      action: "pay",
      // NOTE: do NOT declare `recipient` here — it is a base mandate field (set from
      // `receiver` in pay/session.ts) and re-declaring it collides with the base field, which
      // the SDK's getTaskData guard rejects ("collides with a base mandate field").
      fixedOutput: true,
      ...(isTestnet
        ? { destinationTestnetChainId: toChainId }
        : { destinationChainId: toChainId }),
    },
  };

  return { ok: true, intent };
}
