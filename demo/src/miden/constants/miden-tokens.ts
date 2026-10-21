import { normalizeMidenIdToHex } from "../services/epoch-bridge";

/**
 * Hardcoded Miden faucet → decimals map.
 *
 * Backend (sio/dex-solver/inventory) does not surface faucet decimals to the
 * frontend; relying on the wallet adapter's reported `decimals` is unreliable
 * (some adapters return 8 by default which silently mis-scales 6-decimal
 * tokens by 100x). Frontends must look up decimals here.
 *
 * Keys are normalized to lowercase hex without `0x` prefix. Lookups go through
 * `normalizeMidenIdToHex` first so bech32 faucet ids from the wallet adapter
 * (e.g. `mtst1qxxxxxxxxxxxxx_xxxxxx`) resolve correctly.
 */
const MIDEN_FAUCET_DECIMALS: Record<string, number> = {
  "4cbdcaffe75f0a317482224dae6436": 6, // USDCX
  "5b043dcb48d5721106f7a1ceb2b804": 6, // USDC
  "d41499b8f142ad9119fd9da357a3b2": 6, // DAI
  "0ead4362a745e7d1790d75ea779611": 6, // USDT
  "9368815c611d5d517914a2c1f0bc8d": 6, // WETH
  "1b22d80328f58c5171f67a85f170a3": 6, // WBTC
};

function toMapKey(faucetId: string): string {
  const hex = normalizeMidenIdToHex(faucetId);
  const lower = hex.trim().toLowerCase();
  return lower.startsWith("0x") ? lower.slice(2) : lower;
}

/** Returns Miden faucet decimals, or `undefined` if the faucet is unknown. */
export function getMidenFaucetDecimals(faucetId: string): number | undefined {
  if (!faucetId) return undefined;
  try {
    return MIDEN_FAUCET_DECIMALS[toMapKey(faucetId)];
  } catch {
    return undefined;
  }
}
