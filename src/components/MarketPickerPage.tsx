import { useMemo, useState, type CSSProperties } from 'react';
import { t } from '../theme';
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
  // dedupe by market.id (same underlying may appear in multiple configs)
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

function sortByRate(
  items: FlatRow[],
  side: SideTab,
  sourceChainId?: number | null,
): FlatRow[] {
  const key = side === 'lend' ? 'depositRate' : 'variableBorrowRate';
  return [...items].sort((a, b) => {
    // Primary: same-chain markets first (so users always see what they can
    // deposit into without a bridge).
    if (sourceChainId != null) {
      const aSame = a.market.chainId === sourceChainId ? 0 : 1;
      const bSame = b.market.chainId === sourceChainId ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
    }
    // Secondary: best APR first.
    return b.row[key] - a.row[key];
  });
}

const sectionLabel: CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: t.textMuted,
  margin: '14px 0 4px',
};

const filterChipBase: CSSProperties = {
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderRadius: '999px',
  border: `1px solid ${t.border}`,
  backgroundColor: t.bg,
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  color: t.text,
  boxShadow: t.shadowSm,
  fontFamily: 'inherit',
};

const dropdownStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  zIndex: 10,
  background: t.bg,
  border: `1px solid ${t.border}`,
  borderRadius: t.radiusSm,
  boxShadow: t.shadowLg,
  padding: 6,
  minWidth: 180,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const dropdownItem = (active: boolean): CSSProperties => ({
  all: 'unset',
  cursor: 'pointer',
  padding: '8px 10px',
  borderRadius: t.radiusXs,
  fontSize: '13px',
  fontWeight: 500,
  color: active ? t.primary : t.text,
  backgroundColor: active ? t.accentSoft : 'transparent',
});

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
          rowMatches(item, query) && (lenderKey === ALL_LENDERS || item.config.lenderKey === lenderKey),
      ),
      side,
      sourceChainId,
    );
  }, [configs, side, query, lenderKey, sourceChainId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  if (error) {
    return <p style={{ color: t.error, fontSize: '13px', margin: 0 }}>Failed to load markets: {error.message}</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            style={filterChipBase}
            onClick={() => setLenderOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={lenderOpen}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #b6509e 0%, #2ebac6 100%)',
                display: 'inline-block',
                flexShrink: 0,
              }}
              aria-hidden
            />
            {lenderKey === ALL_LENDERS ? 'All lenders' : lenderLabel(lenderKey)}
            <ChevronDownIcon />
          </button>
          {lenderOpen && (
            <div style={dropdownStyle} role="listbox">
              <button
                type="button"
                style={dropdownItem(lenderKey === ALL_LENDERS)}
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
                  style={dropdownItem(lenderKey === k)}
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

        <div style={{ marginLeft: 'auto', minWidth: 168 }}>
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

      <div style={sectionLabel}>Available markets</div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton width="100%" height={72} radius={t.radiusSm as string} />
          <Skeleton width="100%" height={72} radius={t.radiusSm as string} />
          <Skeleton width="100%" height={72} radius={t.radiusSm as string} />
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color: t.textMuted, fontSize: '13px', margin: '12px 0' }}>No markets match your search.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 460, overflowY: 'auto' }}>
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `1px solid ${t.border}`,
            paddingTop: 12,
            marginTop: 4,
            fontSize: '12.5px',
            color: t.textMuted,
          }}
        >
          <span>
            Showing {filtered.length} market{filtered.length === 1 ? '' : 's'} · Page {currentPage + 1} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              style={{
                all: 'unset',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                color: currentPage === 0 ? t.textMuted : t.text,
                fontWeight: 600,
                opacity: currentPage === 0 ? 0.5 : 1,
              }}
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              style={{
                all: 'unset',
                cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                color: currentPage >= totalPages - 1 ? t.textMuted : t.text,
                fontWeight: 600,
                opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
              }}
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
