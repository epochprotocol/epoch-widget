import { useMemo, useState } from 'react';
import { cn } from '../lib/cn';
import type { EpochEarnMarket, OneDeltaConfig, OneDeltaMarketRow } from '../types';
import { toEpochEarnMarket } from '../earn/onedelta-adapter';
import { MarketRowCard } from './earn/MarketRowCard';
import { FilterDropdown, type FilterOption } from './ui/FilterDropdown';
import { SearchInput } from './ui/SearchInput';
import { Skeleton } from './ui/Skeleton';

interface FlatRow {
  config: OneDeltaConfig;
  row: OneDeltaMarketRow;
  market: EpochEarnMarket;
}

interface Props {
  configs: OneDeltaConfig[];
  selectedId?: string;
  isLoading: boolean;
  error: Error | null;
  onSelect: (market: EpochEarnMarket, row: OneDeltaMarketRow, config: OneDeltaConfig) => void;
  pageSize?: number;
  /** When set, markets on this chain bubble to the top of the list. */
  sourceChainId?: number | null;
}

const ALL_LENDERS = '__all__';
const FAMILY_DISPLAY: Record<string, string> = {
  AAVE: 'Aave',
  AAVE_V2: 'Aave V2',
  AAVE_V3: 'Aave V3',
  AAVE_V3_PRIME: 'Aave V3 Prime',
  COMPOUND: 'Compound',
  MORPHO: 'Morpho',
  FLUID: 'Fluid',
  EULER: 'Euler',
  SPARK: 'Spark',
  VENUS: 'Venus',
  YLDR: 'YLDR',
};

function familyOf(cfg: OneDeltaConfig): string {
  return cfg.lenderFamily ?? cfg.lenderKey;
}

function familyLabel(family: string): string {
  // Always prefer the family-level label — bucket labels are per-market
  // (e.g. "Morpho wstETH-USDT 86") and would flood the dropdown.
  return FAMILY_DISPLAY[family] ?? family.replace(/_/g, ' ');
}

function flatten(configs: OneDeltaConfig[]): FlatRow[] {
  const out: FlatRow[] = [];
  for (const cfg of configs) {
    for (const row of cfg.collaterals) {
      out.push({ config: cfg, row, market: toEpochEarnMarket(row, cfg, 'lend') });
    }
  }
  const seen = new Set<string>();
  return out.filter((x) => (seen.has(x.market.id) ? false : (seen.add(x.market.id), true)));
}

function rowMatches(item: FlatRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const a = item.row.underlyingInfo.asset;
  const family = familyOf(item.config);
  return `${a.symbol} ${a.name} ${family} ${item.config.label}`
    .toLowerCase()
    .includes(q);
}

function sortByRate(items: FlatRow[], sourceChainId?: number | null): FlatRow[] {
  return [...items].sort((a, b) => {
    if (sourceChainId != null) {
      const aSame = a.market.chainId === sourceChainId ? 0 : 1;
      const bSame = b.market.chainId === sourceChainId ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
    }
    return b.row.depositRate - a.row.depositRate;
  });
}

const FAMILY_DOT: Record<string, string> = {
  AAVE: '#b6509e',
  AAVE_V2: '#b6509e',
  AAVE_V3: '#b6509e',
  AAVE_V3_PRIME: '#b6509e',
  COMPOUND: '#00d395',
  MORPHO: '#2b5cff',
  FLUID: '#36b6ff',
  EULER: '#4d9aff',
  SPARK: '#ffaa00',
  VENUS: '#f6c344',
  YLDR: '#ffb547',
};

function familyDot(family: string): string {
  return FAMILY_DOT[family] ?? 'var(--epoch-color-primary)';
}

const ALL_GRADIENT = 'linear-gradient(135deg, #b6509e 0%, #2ebac6 100%)';

export function MarketPickerPage({
  configs,
  selectedId,
  isLoading,
  error,
  onSelect,
  pageSize = 20,
  sourceChainId,
}: Props) {
  const [query, setQuery] = useState('');
  const [lenderKey, setLenderKey] = useState<string>(ALL_LENDERS);
  const [page, setPage] = useState(0);

  // Dedupe by family + count rows per family so the dropdown can surface a
  // tally chip — Morpho buckets each market under its own `MORPHO_BLUE_<hash>`
  // key, so without this we'd flood the menu with one entry per market.
  const { lenderOptions, totalMarkets } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of configs) {
      const fam = familyOf(c);
      counts.set(fam, (counts.get(fam) ?? 0) + c.collaterals.length);
    }
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    const sorted = Array.from(counts.keys()).sort((a, b) =>
      familyLabel(a).toLowerCase().localeCompare(familyLabel(b).toLowerCase()),
    );
    const options: FilterOption[] = [
      {
        value: ALL_LENDERS,
        label: 'All lenders',
        count: total,
        dotBackground: ALL_GRADIENT,
      },
      ...sorted.map((k) => ({
        value: k,
        label: familyLabel(k),
        count: counts.get(k) ?? 0,
        dotColor: familyDot(k),
      })),
    ];
    return { lenderOptions: options, totalMarkets: total };
  }, [configs]);
  void totalMarkets;

  const filtered = useMemo(() => {
    const all = flatten(configs);
    return sortByRate(
      all.filter(
        (item) =>
          rowMatches(item, query) &&
          (lenderKey === ALL_LENDERS || familyOf(item.config) === lenderKey),
      ),
      sourceChainId,
    );
  }, [configs, query, lenderKey, sourceChainId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  if (error) {
    return <p className="m-0 text-[13px] text-error">Failed to load markets: {error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <SearchInput
        value={query}
        onChange={(v) => {
          setQuery(v);
          setPage(0);
        }}
        placeholder="Filter markets"
        autoFocus
        ariaLabel="Filter markets"
      />

      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          ariaLabel="Filter markets by lender"
          value={lenderKey}
          onChange={(v) => {
            setLenderKey(v);
            setPage(0);
          }}
          options={lenderOptions}
        />
      </div>

      <div className="mt-3.5 mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
        Available markets
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton width="100%" height={72} radius="var(--epoch-radius-sm)" />
          <Skeleton width="100%" height={72} radius="var(--epoch-radius-sm)" />
          <Skeleton width="100%" height={72} radius="var(--epoch-radius-sm)" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="my-3 text-[13px] text-fg-muted">No markets match your search.</p>
      ) : (
        <div className="flex max-h-[460px] flex-col overflow-x-hidden overflow-y-auto">
          {pageItems.map((item) => (
            <MarketRowCard
              key={item.market.id}
              row={item.row}
              config={item.config}
              kind="lend"
              selected={selectedId === item.market.id}
              onClick={() => onSelect(item.market, item.row, item.config)}
            />
          ))}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="mt-1 flex items-center justify-between border-t border-line pt-3 text-[12.5px] text-fg-muted">
          <span>
            Showing {filtered.length} market{filtered.length === 1 ? '' : 's'} · Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              className={cn(
                'border-0 bg-transparent p-0 font-semibold',
                currentPage === 0 ? 'cursor-not-allowed text-fg-muted opacity-50' : 'cursor-pointer text-fg',
              )}
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className={cn(
                'border-0 bg-transparent p-0 font-semibold',
                currentPage >= totalPages - 1
                  ? 'cursor-not-allowed text-fg-muted opacity-50'
                  : 'cursor-pointer text-fg',
              )}
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
