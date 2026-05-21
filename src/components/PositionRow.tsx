import { cn } from '../lib/cn';
import { formatAmount } from '../utils';
import type { EpochEarnPosition } from '../types';
import { Pill } from './ui/Pill';

interface Props {
  position: EpochEarnPosition;
  expanded: boolean;
  onWithdrawClick: () => void;
}

function formatUsd(v: number | undefined): string | null {
  if (v === undefined || !Number.isFinite(v)) return null;
  if (v >= 1) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (v >= 0.01) return `$${v.toFixed(4)}`;
  if (v > 0) return `<$0.01`;
  return `$0.00`;
}

function change24hVariant(delta: number | undefined): 'success' | 'danger' | 'neutral' {
  if (delta === undefined || !Number.isFinite(delta)) return 'neutral';
  if (delta > 0.01) return 'success';
  if (delta < -0.01) return 'danger';
  return 'neutral';
}

function formatChange(delta: number | undefined): string | null {
  if (delta === undefined || !Number.isFinite(delta)) return null;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(2)}%`;
}

const LOGO_CLASSES = 'h-8 w-8 shrink-0 rounded-full bg-surface object-cover';

const ROW_CLASSES =
  'flex items-center gap-3 rounded-md border bg-canvas p-3.5 shadow-sm transition-[border-color,background-color] duration-150';

const BTN_BASE =
  'inline-flex cursor-pointer items-center justify-center rounded-sm border-0 px-3.5 py-2 text-[13px] font-semibold';

export function PositionRow({ position, expanded, onWithdrawClick }: Props) {
  const { market } = position;
  const balanceRaw = position.withdrawableRaw ?? position.underlyingBalanceRaw;
  let underlyingHuman = '—';
  try {
    underlyingHuman = formatAmount(BigInt(balanceRaw), market.token.decimals);
  } catch {
    /* keep dash */
  }
  const usd = formatUsd(position.underlyingUsdValue);
  const change = formatChange(position.priceChange24h);
  const changeVariant = change24hVariant(position.priceChange24h);

  return (
    <div
      className={cn(
        ROW_CLASSES,
        expanded ? 'border-primary bg-accent-soft' : 'border-line',
      )}
    >
      {market.token.logoURI ? (
        <img src={market.token.logoURI} alt={market.token.symbol} className={LOGO_CLASSES} />
      ) : (
        <span className={cn(LOGO_CLASSES, 'inline-flex items-center justify-center border border-line text-[11px] font-bold text-fg-muted')}>
          {market.token.symbol.slice(0, 3).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-fg">
          {market.token.symbol}{' '}
          <span className="text-xs font-normal text-fg-muted">
            · {market.lenderName ?? market.lenderKey ?? 'Lender'}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Pill variant="neutral" size="xs">{market.chainLabel}</Pill>
          {market.aprDecimal > 0 && (
            <Pill variant="success" size="xs">
              {(market.aprDecimal * 100).toFixed(2)}% APR
            </Pill>
          )}
          {change && (
            <Pill variant={changeVariant} size="xs">
              24h {change}
            </Pill>
          )}
          {position.collateralEnabled && (
            <Pill variant="info" size="xs">Collateral</Pill>
          )}
        </div>
      </div>
      <div className="text-right tabular-nums">
        {usd ? (
          <>
            <div className="text-[15px] font-bold text-fg">{usd}</div>
            <div className="mt-0.75 text-[11px] text-fg-muted">
              {underlyingHuman} {market.token.symbol}
            </div>
          </>
        ) : (
          <div className="text-[15px] font-bold text-fg">
            {underlyingHuman} {market.token.symbol}
          </div>
        )}
      </div>
      <button
        type="button"
        className={cn(
          BTN_BASE,
          expanded
            ? 'border border-line bg-transparent text-fg'
            : 'bg-primary text-white',
        )}
        onClick={onWithdrawClick}
      >
        {expanded ? 'Cancel' : 'Withdraw'}
      </button>
    </div>
  );
}
