import { MIDEN_MAINNET } from "../../config/miden-mainnet";
import { normalizeMidenIdToHex } from "../services/epoch-bridge";

function toMapKey(faucetId: string): string {
  const lower = normalizeMidenIdToHex(faucetId).trim().toLowerCase();
  return lower.startsWith("0x") ? lower.slice(2) : lower;
}

const MAINNET_USDCX_KEY = toMapKey(MIDEN_MAINNET.usdcx.faucetId);

export function isMidenMainnetUsdcx(faucetId: string): boolean {
  if (!faucetId) return false;
  try {
    return toMapKey(faucetId) === MAINNET_USDCX_KEY;
  } catch {
    return false;
  }
}

export function getMidenFaucetDecimals(faucetId: string): number | undefined {
  return isMidenMainnetUsdcx(faucetId)
    ? MIDEN_MAINNET.usdcx.decimals
    : undefined;
}
