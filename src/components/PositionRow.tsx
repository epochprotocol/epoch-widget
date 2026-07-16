import { cn } from '../lib/cn';
import { formatUsdPrice } from '../lib/format-usd';
import { formatAmount } from '../utils';
import type { EpochEarnPosition } from '../types';

interface Props {
  position: EpochEarnPosition;
  expanded: boolean;
  onWithdrawClick: () => void;
  /** Per-row entry delay (ms) — used to stagger the list on first mount. */
  entryDelayMs?: number;
}

const LOGO_CLASSES = 'h-9 w-9 shrink-0 rounded-full bg-surface object-cover';

const ROW_CLASSES =
  'flex animate-row-in items-center gap-3 rounded-md border bg-canvas p-3.5 shadow-sm transition-[border-color,background-color] duration-150';

const BTN_BASE =
  'inline-flex cursor-pointer items-center justify-center rounded-md border-0 px-3.5 py-2 text-[13px] font-semibold';

export function PositionRow({ position, expanded, onWithdrawClick, entryDelayMs }: Props) {
  const { market } = position;
  const balanceRaw = position.withdrawableRaw ?? position.underlyingBalanceRaw;
  let underlyingHuman = '—';
  try {
    underlyingHuman = formatAmount(BigInt(balanceRaw), market.token.decimals);
  } catch {
    /* keep dash */
  }
  const usd = formatUsdPrice(position.underlyingUsdValue);
  const lender = market.lenderName ?? market.lenderKey ?? 'Lender';

  return (
    <div
      className={cn(
        ROW_CLASSES,
        expanded ? 'border-primary bg-accent-soft' : 'border-line',
      )}
      style={entryDelayMs ? { animationDelay: `${entryDelayMs}ms` } : undefined}
    >
      {market.token.logoURI ? (
        <img src={market.token.logoURI} alt={market.token.symbol} className={LOGO_CLASSES} />
      ) : (
        <span
          className={cn(
            LOGO_CLASSES,
            'inline-flex items-center justify-center border border-line text-[11px] font-bold text-fg-muted',
          )}
        >
          {market.token.symbol.slice(0, 3).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold leading-tight text-fg">
          {market.token.symbol}
        </div>
        <div className="mt-0.5 truncate text-xs text-fg-muted">
          {market.chainLabel} · {lender}
        </div>
      </div>
      <div className="text-right tabular-nums">
        {usd ? (
          <>
            <div className="text-[15px] font-bold text-fg">{usd}</div>
            <div className="mt-0.5 text-[11px] text-fg-muted">
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
        className={cn(BTN_BASE, 'bg-primary text-white hover:bg-primary-hover')}
        onClick={onWithdrawClick}
      >
        Withdraw
      </button>
    </div>
  );
}
