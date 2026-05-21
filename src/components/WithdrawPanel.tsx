import { cn } from '../lib/cn';
import type { EpochEarnPosition, EpochEarnPositionsSummary } from '../types';
import { Banner } from './Banner';
import { PositionRow } from './PositionRow';
import { Shimmer } from './Shimmer';
import { Pill } from './ui/Pill';

// Compact chain options. Default = Base. Single-chain request keeps the picker
// readable; extend the list to surface more chains.
const POSITIONS_CHAIN_OPTIONS: { value: string; label: string }[] = [
  { value: '8453', label: 'Base' },
  { value: '1', label: 'Ethereum' },
  { value: '42161', label: 'Arbitrum' },
  { value: '10', label: 'Optimism' },
  { value: '137', label: 'Polygon' },
];

// Lender filter. Empty = all supported lenders (1delta defaults to all when
// `lenders` is omitted). List trimmed to the lenders epoch routinely sees in
// production; obscure ones are reachable by editing this constant.
const POSITIONS_LENDER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All lenders' },
  { value: 'AAVE_V3', label: 'Aave V3' },
  { value: 'COMPOUND_V3', label: 'Compound V3' },
  { value: 'MORPHO', label: 'Morpho' },
  { value: 'EULER_V2', label: 'Euler V2' },
];

interface Props {
  positions: EpochEarnPosition[];
  summary: EpochEarnPositionsSummary | null;
  isLoading: boolean;
  error: Error | null;
  walletConnected: boolean;
  selectedPositionId: string | null;
  /** Per-row Withdraw click → caller swaps modal body to the detail view. */
  onPickPosition: (p: EpochEarnPosition) => void;
  chainFilter: string;
  onChainFilterChange: (v: string) => void;
  lenderFilter: string;
  onLenderFilterChange: (v: string) => void;
}

// Native chip-style <select>. Pre-built CSS doesn't strip the appearance
// reset Tailwind would otherwise need, so we still need the inline image
// for the chevron — `appearance-none` is a utility, the chevron URL is not.
const CHIP_CLASSES =
  'cursor-pointer appearance-none rounded-full border border-line bg-canvas py-1 pr-6 pl-2.5 text-xs font-medium text-fg';
const CHIP_BG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'><path d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>\")";

function formatUsd(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (v >= 1) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (v >= 0.01) return `$${v.toFixed(4)}`;
  if (v > 0) return '<$0.01';
  return '$0.00';
}

function navDelta(summary: EpochEarnPositionsSummary): { pct: number; sign: '+' | '-' | '' } | null {
  const prev = summary.nav24hUsd;
  const now = summary.navUsd;
  if (!Number.isFinite(prev) || prev <= 0 || !Number.isFinite(now)) return null;
  const pct = ((now - prev) / prev) * 100;
  const sign = pct > 0 ? '+' : pct < 0 ? '-' : '';
  return { pct: Math.abs(pct), sign };
}

/**
 * Two-column portfolio summary card: Net Worth on the left (with optional 24h
 * delta pill + Net APR line), Total Debt on the right. Mirrors the design
 * pattern the user requested — fewer stats, clearer hierarchy.
 */
function PortfolioSummary({ summary }: { summary: EpochEarnPositionsSummary }) {
  const delta = navDelta(summary);
  const deltaVariant =
    delta && delta.sign === '+' ? 'success' : delta && delta.sign === '-' ? 'danger' : 'neutral';
  return (
    <div className="mb-3 grid grid-cols-2 rounded-md border border-line bg-surface">
      <div className="flex flex-col gap-1.5 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold tracking-[0.02em] text-fg-secondary">
            Net Worth
          </span>
          {delta && (
            <Pill variant={deltaVariant} size="xs">
              24h {delta.sign}
              {delta.pct.toFixed(2)}%
            </Pill>
          )}
        </div>
        <div className="text-[20px] font-bold leading-tight tabular-nums text-fg">
          {formatUsd(summary.navUsd)}
        </div>
        {summary.netAprDecimal > 0 && (
          <div className="text-[11px] font-medium text-success">
            Net APR {(summary.netAprDecimal * 100).toFixed(2)}%
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 border-l border-line px-4 py-3">
        <span className="text-[11px] font-semibold tracking-[0.02em] text-fg-secondary">
          Total Debt
        </span>
        <div className="text-[20px] font-bold leading-tight tabular-nums text-fg">
          {formatUsd(summary.debtUsd)}
        </div>
      </div>
    </div>
  );
}

export function WithdrawPanel({
  positions,
  summary,
  isLoading,
  error,
  walletConnected,
  selectedPositionId,
  onPickPosition,
  chainFilter,
  onChainFilterChange,
  lenderFilter,
  onLenderFilterChange,
}: Props) {
  const positionsCount = positions.length;
  const chipBgStyle = {
    backgroundImage: CHIP_BG,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '8px 5px',
  } as const;

  const filterRow = (
    <div className="mb-3 flex items-center justify-between gap-2">
      <span className="text-[11px] font-medium text-fg-muted">
        {isLoading || positionsCount === 0
          ? ''
          : `${positionsCount} position${positionsCount === 1 ? '' : 's'}`}
      </span>
      <div className="flex gap-1.5">
        <select
          aria-label="Filter positions by chain"
          value={chainFilter}
          onChange={(e) => onChainFilterChange(e.target.value)}
          className={CHIP_CLASSES}
          style={chipBgStyle}
        >
          {POSITIONS_CHAIN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter positions by lender"
          value={lenderFilter}
          onChange={(e) => onLenderFilterChange(e.target.value)}
          className={CHIP_CLASSES}
          style={chipBgStyle}
        >
          {POSITIONS_LENDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  if (!walletConnected) {
    return (
      <Banner variant="info">Connect your wallet to load your positions.</Banner>
    );
  }
  if (error) {
    return (
      <>
        {filterRow}
        <Banner variant="error">Failed to load positions: {error.message}</Banner>
      </>
    );
  }
  if (isLoading) {
    return (
      <>
        {filterRow}
        <Shimmer width="100%" height="80px" radius="var(--epoch-radius-md)" />
        <div className="mt-3 mb-2 text-[12px] font-semibold tracking-[0.02em] text-fg-secondary">
          Your Portfolio
        </div>
        <div className="flex flex-col gap-2">
          <Shimmer width="100%" height="76px" radius="var(--epoch-radius-md)" />
          <Shimmer width="100%" height="76px" radius="var(--epoch-radius-md)" />
          <Shimmer width="100%" height="76px" radius="var(--epoch-radius-md)" />
        </div>
      </>
    );
  }
  if (positions.length === 0) {
    return (
      <>
        {filterRow}
        {summary && <PortfolioSummary summary={summary} />}
        <div className={cn('rounded-md border border-line bg-canvas px-5 py-4 shadow-sm text-[13px] leading-relaxed')}>
          <p className="m-0 font-semibold text-fg">No active positions</p>
          <p className="mt-2 mb-0 text-fg-muted">
            Deposit into a market first and your withdrawable positions will show up here.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {filterRow}
      {summary && <PortfolioSummary summary={summary} />}
      <div className="mt-1 mb-2 text-[12px] font-semibold tracking-[0.02em] text-fg-secondary">
        Your Portfolio
      </div>
      <div className="flex flex-col gap-2">
        {positions.map((p) => (
          <PositionRow
            key={p.id}
            position={p}
            expanded={selectedPositionId === p.id}
            onWithdrawClick={() => onPickPosition(p)}
          />
        ))}
      </div>
    </>
  );
}
