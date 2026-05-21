import { cn } from '../lib/cn';
import { formatAmount } from '../utils';
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
  selectedPosition: EpochEarnPosition | null;
  onSelectPosition: (p: EpochEarnPosition | null) => void;
  withdrawAmount: string;
  onAmountChange: (v: string) => void;
  onMaxClick: (position: EpochEarnPosition, maxHuman: string) => void;
  buildError: string | null;
  isAll: boolean;
  isQuoting: boolean;
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

const PAY_CARD_CLASSES =
  'rounded-md border border-line bg-canvas px-5 py-4 shadow-sm';

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

function PortfolioSummary({ summary }: { summary: EpochEarnPositionsSummary }) {
  const delta = navDelta(summary);
  const deltaVariant = delta && delta.sign === '+' ? 'success' : delta && delta.sign === '-' ? 'danger' : 'neutral';
  return (
    <div className="mb-3 flex flex-col gap-3 rounded-md border border-line bg-surface p-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
            Net Worth
          </div>
          <div className="mt-1 text-[26px] font-bold leading-tight tabular-nums text-fg">
            {formatUsd(summary.navUsd)}
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {delta && (
            <Pill variant={deltaVariant} size="sm">
              24h {delta.sign}
              {delta.pct.toFixed(2)}%
            </Pill>
          )}
          {summary.netAprDecimal > 0 && (
            <Pill variant="success" size="sm">
              Net APR {(summary.netAprDecimal * 100).toFixed(2)}%
            </Pill>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-0.5 rounded-sm border border-line bg-canvas px-2.5 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
            Deposits
          </span>
          <span className="text-sm font-bold tabular-nums text-fg">
            {formatUsd(summary.depositsUsd)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-sm border border-line bg-canvas px-2.5 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
            Debt
          </span>
          <span className="text-sm font-bold tabular-nums text-fg">
            {formatUsd(summary.debtUsd)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-sm border border-line bg-canvas px-2.5 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
            Footprint
          </span>
          <span className="text-sm font-bold tabular-nums text-fg">
            {summary.activeChains} chain{summary.activeChains === 1 ? '' : 's'} · {summary.activeLenders} lender
            {summary.activeLenders === 1 ? '' : 's'}
          </span>
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
  selectedPosition,
  onSelectPosition,
  withdrawAmount,
  onAmountChange,
  onMaxClick,
  buildError,
  isAll,
  isQuoting,
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
        {isLoading
          ? 'Loading positions…'
          : positionsCount === 0
            ? 'No positions'
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
        <div className="flex flex-col gap-2">
          <Shimmer width="100%" height="120px" radius="var(--epoch-radius-md)" />
          <Shimmer width="100%" height="72px" radius="var(--epoch-radius-sm)" />
          <Shimmer width="100%" height="72px" radius="var(--epoch-radius-sm)" />
        </div>
      </>
    );
  }
  if (positions.length === 0) {
    return (
      <>
        {filterRow}
        {summary && <PortfolioSummary summary={summary} />}
        <div className={cn(PAY_CARD_CLASSES, 'text-[13px] leading-relaxed')}>
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
      <div className="flex flex-col gap-2">
        {positions.map((p) => {
          const isSelected = selectedPosition?.id === p.id;
          const maxRaw = p.withdrawableRaw ?? p.underlyingBalanceRaw;
          const maxHuman = (() => {
            try {
              return formatAmount(BigInt(maxRaw), p.market.token.decimals);
            } catch {
              return '0';
            }
          })();
          return (
            <div key={p.id}>
              <PositionRow
                position={p}
                expanded={isSelected}
                onWithdrawClick={() => onSelectPosition(isSelected ? null : p)}
              />
              {isSelected && (
                <div className={cn(PAY_CARD_CLASSES, 'mt-2')}>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder={`0.00 ${p.market.token.symbol}`}
                      value={withdrawAmount}
                      onChange={(e) => onAmountChange(e.target.value)}
                      className="w-full rounded-sm border border-line bg-canvas px-3 py-2.5 text-[15px] text-fg outline-none focus:border-primary"
                      aria-label={`Withdraw amount in ${p.market.token.symbol}`}
                    />
                    <button
                      type="button"
                      className="cursor-pointer rounded-full border border-primary bg-transparent px-2.5 py-1 text-[11px] font-semibold text-primary"
                      onClick={() => onMaxClick(p, maxHuman)}
                    >
                      MAX
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-fg-muted">
                      Available: {maxHuman} {p.market.token.symbol}
                      {p.underlyingUsdValue != null && (
                        <span> · ≈ {formatUsd(p.underlyingUsdValue)}</span>
                      )}
                    </span>
                    {isAll && (
                      <Pill variant="info" size="xs">
                        Max withdraw
                      </Pill>
                    )}
                    {isQuoting && (
                      <Pill variant="neutral" size="xs">
                        Fetching quote…
                      </Pill>
                    )}
                  </div>
                  {buildError && (
                    <p className="mt-2 mb-0 text-[13px] text-error">{buildError}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
