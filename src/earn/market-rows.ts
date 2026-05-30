import { toEpochEarnMarket } from '@epoch-protocol/epoch-flows-sdk';
import type {
  EarnMarketRow,
  PoolSortBy,
  PoolSortDir,
} from '@epoch-protocol/epoch-flows-sdk';
import type { OneDeltaConfig } from '../types';

/** Page size for the market picker — shared by the live and static paths. */
export const MARKETS_PAGE_SIZE = 100;
export const ALL_LENDERS = '__all__';

/**
 * Flatten bundled `OneDeltaConfig[]` into ordered market rows. Used ONLY on the
 * static / no-proxy path (demo, offline). The live path gets server-ordered
 * rows straight from `fetchLendingPoolsPage` and never touches this.
 */
export function configsToRows(configs: OneDeltaConfig[]): EarnMarketRow[] {
  const out: EarnMarketRow[] = [];
  const seen = new Set<string>();
  for (const cfg of configs) {
    for (const row of cfg.collaterals) {
      const market = toEpochEarnMarket(row, cfg, 'lend');
      if (seen.has(market.id)) continue;
      seen.add(market.id);
      out.push({ market, row, config: cfg });
    }
  }
  return out;
}

function familyOf(cfg: OneDeltaConfig): string {
  return cfg.lenderFamily ?? cfg.lenderKey;
}

function rowValue(r: EarnMarketRow, sortBy: PoolSortBy): number {
  switch (sortBy) {
    case 'depositRate':
      return r.row.depositRate;
    case 'variableBorrowRate':
      return r.row.variableBorrowRate;
    case 'totalLiquidityUsd':
      return r.row.totalLiquidityUsd;
    case 'utilization':
      return r.row.utilization;
    case 'totalDepositsUsd':
    default:
      return r.row.totalDepositsUsd;
  }
}

export interface ClientPageParams {
  /** Single chain filter; undefined = all chains. */
  chainId?: number;
  /** Lender family key; undefined or `ALL_LENDERS` = all lenders. */
  lender?: string;
  sortBy: PoolSortBy;
  sortDir: PoolSortDir;
  page: number;
  pageSize?: number;
}

/**
 * Mirror the server's filter → sort → paginate on the static path so the
 * no-proxy demo behaves like production. Returns one page + whether another
 * exists. (On the live path the server does all of this.)
 */
export function clientPage(
  rows: EarnMarketRow[],
  p: ClientPageParams,
): { rows: EarnMarketRow[]; hasMore: boolean } {
  const size = p.pageSize ?? MARKETS_PAGE_SIZE;
  const dir = p.sortDir === 'ASC' ? 1 : -1;
  const filtered = rows.filter((r) => {
    if (p.chainId != null && Number(r.config.chainId) !== p.chainId) return false;
    if (p.lender && p.lender !== ALL_LENDERS && familyOf(r.config) !== p.lender)
      return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    const d = (rowValue(a, p.sortBy) - rowValue(b, p.sortBy)) * dir;
    if (d !== 0) return d;
    return b.row.totalDepositsUsd - a.row.totalDepositsUsd;
  });
  const startIdx = p.page * size;
  const slice = sorted.slice(startIdx, startIdx + size);
  return { rows: slice, hasMore: startIdx + size < sorted.length };
}
