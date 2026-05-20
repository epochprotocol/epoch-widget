import type { EpochEarnMarket, OneDeltaConfig, OneDeltaMarketRow } from '../types';
import { chainLabelFor } from './onedelta-markets';

function vaultAddressFromMarketUid(marketUid: string): string {
  const parts = marketUid.split(':');
  return parts[parts.length - 1] ?? marketUid;
}

function chainIdFromMarketUid(marketUid: string): string | undefined {
  const parts = marketUid.split(':');
  return parts[1];
}

/**
 * Build the widget's canonical `EpochEarnMarket` shape from a single 1delta
 * collateral / borrowable row inside a config. Keeps the rest of the deposit
 * flow (intent builder, quote, submit) untouched.
 */
export function toEpochEarnMarket(
  row: OneDeltaMarketRow,
  config: OneDeltaConfig,
  kind: 'lend' | 'borrow' = 'lend',
): EpochEarnMarket {
  const asset = row.underlyingInfo.asset;
  // Per-row chain — derive from the asset's chainId (or the marketUid's chain
  // segment) instead of the parent config. A single config can bundle rows
  // from multiple chains (e.g. AAVE_V3 Main Market lists GHO on Ethereum,
  // Arbitrum and Base) and the row's chain is what actually matters for
  // routing the deposit.
  const rowChainId =
    asset.chainId ?? chainIdFromMarketUid(row.marketUid) ?? config.chainId;
  const chainLabel = chainLabelFor(rowChainId);
  const apr = kind === 'lend' ? row.depositRate / 100 : row.variableBorrowRate / 100;

  return {
    id: `${config.lenderKey}:${config.configId}:${row.marketUid}:${kind}`,
    displayName: `${asset.symbol} · ${config.lenderKey.replace('_', ' ')}`,
    chainLabel,
    aprDecimal: apr,
    vaultAddress: vaultAddressFromMarketUid(row.marketUid),
    token: {
      address: asset.address,
      symbol: asset.symbol,
      decimals: asset.decimals,
    },
    destinationChainName: chainLabel,
    oneDeltaMarketUid: row.marketUid,
    chainId: Number(rowChainId),
    lenderKey: config.lenderKey,
  };
}

/**
 * Flatten all configs into a single list of `EpochEarnMarket`s (collaterals
 * only) — handy for legacy consumers that just want a flat array.
 */
export function flattenConfigsToMarkets(configs: OneDeltaConfig[]): EpochEarnMarket[] {
  const out: EpochEarnMarket[] = [];
  for (const cfg of configs) {
    for (const row of cfg.collaterals) out.push(toEpochEarnMarket(row, cfg, 'lend'));
  }
  return out;
}
