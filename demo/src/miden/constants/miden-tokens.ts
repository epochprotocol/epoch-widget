import { normalizeMidenId } from "@epoch-protocol/epoch-commons-sdk";
import { EPOCH_MIDEN_MAINNET_TOKENS } from "@epoch-protocol/epoch-flows-sdk";
import { MIDEN_MAINNET } from "../../config/miden-mainnet";

function toMapKey(faucetId: string): string {
  return normalizeMidenId(faucetId).trim().toLowerCase().replace(/^0x/, "");
}

export function isMidenMainnetUsdcx(faucetId: string): boolean {
  if (!faucetId) return false;
  try {
    return toMapKey(faucetId) === toMapKey(MIDEN_MAINNET.usdcx.faucetId);
  } catch {
    return false;
  }
}

export function getMidenFaucetDecimals(faucetId: string): number | undefined {
  try {
    const key = toMapKey(faucetId);
    return EPOCH_MIDEN_MAINNET_TOKENS.find((token) => toMapKey(token.address) === key)?.decimals;
  } catch {
    return undefined;
  }
}
