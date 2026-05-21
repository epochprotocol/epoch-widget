import { useMemo, useState } from 'react';
import { cn } from '../lib/cn';
import type { EpochEarnMarket, OneDeltaConfig, OneDeltaMarketRow } from '../types';
import { toEpochEarnMarket } from '../earn/onedelta-adapter';
import { MarketRowCard } from './earn/MarketRowCard';
import { ChevronDownIcon } from './Icons';
import { SearchInput } from './ui/SearchInput';
import { SegmentedTabs } from './ui/SegmentedTabs';
import { Skeleton } from './ui/Skeleton';

type SideTab = 'lend' | 'borrow';

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
  defaultSide?: SideTab;
  pageSize?: number;
  /** When set, markets on this chain bubble to the top of the list. */
  sourceChainId?: number | null;
}

const ALL_LENDERS = '__all__';
const LENDER_DISPLAY: Record<string, string> = {
  AAVE_V3: 'Aave',
  AAVE_V2: 'Aave v2',
  COMPOUND_V3: 'Compound',
  MORPHO_BLUE: 'Morpho',
  VENUS: 'Venus',
};

function lenderLabel(key: string): string {
  return LENDER_DISPLAY[key] ?? key.replace('_', ' ');
}

function flatten(configs: OneDeltaConfig[], side: SideTab): FlatRow[] {
  const out: FlatRow[] = [];
  for (const cfg of configs) {
    const rows = side === 'lend' ? cfg.collaterals : cfg.borrowables;
    for (const row of rows) {
      out.push({ config: cfg, row, market: toEpochEarnMarket(row, cfg, side) });
    }
  }
  const seen = new Set<string>();
  return out.filter((x) => (seen.has(x.market.id) ? false : (seen.add(x.market.id), true)));
}

function rowMatches(item: FlatRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const a = item.row.underlyingInfo.asset;
  return `${a.symbol} ${a.name} ${item.config.lenderKey} ${lenderLabel(item.config.lenderKey)}`
    .toLowerCase()
    .includes(q);
}

function sortByRate(items: FlatRow[], side: SideTab, sourceChainId?: number | null): FlatRow[] {
  const key = side === 'lend' ? 'depositRate' : 'variableBorrowRate';
  return [...items].sort((a, b) => {
    if (sourceChainId != null) {
      const aSame = a.market.chainId === sourceChainId ? 0 : 1;
      const bSame = b.market.chainId === sourceChainId ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
    }
    return b.row[key] - a.row[key];
  });
}

const FILTER_CHIP =
  'inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-canvas px-3 py-2 text-[13px] font-semibold text-fg shadow-sm';
const DROPDOWN_ITEM_BASE =
  'cursor-pointer rounded-xs px-2.5 py-2 text-[13px] font-medium';

export function MarketPickerPage({
  configs,
  selectedId,
  isLoading,
  error,
  onSelect,
  defaultSide = 'lend',
  pageSize = 20,
  sourceChainId,
}: Props) {
  const [side, setSide] = useState<SideTab>(defaultSide);
  const [query, setQuery] = useState('');
  const [lenderKey, setLenderKey] = useState<string>(ALL_LENDERS);
  const [lenderOpen, setLenderOpen] = useState(false);
  const [page, setPage] = useState(0);

  const availableLenders = useMemo(() => {
    const set = new Set<string>();
    for (const c of configs) set.add(c.lenderKey);
    return Array.from(set);
  }, [configs]);

  const filtered = useMemo(() => {
    const all = flatten(configs, side);
    return sortByRate(
      all.filter(
        (item) =>
          rowMatches(item, query) &&
          (lenderKey === ALL_LENDERS || item.config.lenderKey === lenderKey),
      ),
      side,
      sourceChainId,
    );
  }, [configs, side, query, lenderKey, sourceChainId]);

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
        <div className="relative">
          <button
            type="button"
            className={FILTER_CHIP}
            onClick={() => setLenderOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={lenderOpen}
          >
            <span
              className="inline-block h-4.5 w-4.5 shrink-0 rounded-full"
              style={{ background: 'linear-gradient(135deg, #b6509e 0%, #2ebac6 100%)' }}
              aria-hidden
            />
            {lenderKey === ALL_LENDERS ? 'All lenders' : lenderLabel(lenderKey)}
            <ChevronDownIcon />
          </button>
          {lenderOpen && (
            <div
              role="listbox"
              className="absolute left-0 top-[calc(100%+6px)] z-10 flex min-w-[180px] flex-col gap-0.5 rounded-sm border border-line bg-canvas p-1.5 shadow-lg"
            >
              <button
                type="button"
                className={cn(
                  DROPDOWN_ITEM_BASE,
                  lenderKey === ALL_LENDERS
                    ? 'bg-accent-soft text-primary'
                    : 'bg-transparent text-fg',
                )}
                onClick={() => {
                  setLenderKey(ALL_LENDERS);
                  setLenderOpen(false);
                  setPage(0);
                }}
              >
                All lenders
              </button>
              {availableLenders.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={cn(
                    DROPDOWN_ITEM_BASE,
                    lenderKey === k
                      ? 'bg-accent-soft text-primary'
                      : 'bg-transparent text-fg',
                  )}
                  onClick={() => {
                    setLenderKey(k);
                    setLenderOpen(false);
                    setPage(0);
                  }}
                >
                  {lenderLabel(k)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto min-w-[168px]">
          <SegmentedTabs<SideTab>
            tabs={[
              { value: 'lend', label: 'Lend' },
              { value: 'borrow', label: 'Borrow' },
            ]}
            value={side}
            onChange={(v) => {
              setSide(v);
              setPage(0);
            }}
          />
        </div>
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
        <div className="flex max-h-[460px] flex-col overflow-y-auto">
          {pageItems.map((item) => (
            <MarketRowCard
              key={item.market.id}
              row={item.row}
              config={item.config}
              kind={side}
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
