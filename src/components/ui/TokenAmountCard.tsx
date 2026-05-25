import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Shimmer } from '../Shimmer';

interface Props {
  /** Section heading (e.g. "Pay with", "Sell", "Buy"). */
  label: string;
  /** Optional badge rendered on the right of the label row (wallet, etc). */
  labelAdornment?: ReactNode;
  /** Display amount string. */
  amount: string;
  /** Replace amount with a shimmer while true. */
  amountLoading?: boolean;
  /** Token/chain pill on the right of the amount row. */
  tokenPill?: ReactNode;
  /** Footer left slot (USD equiv, hint copy). */
  footerLeft?: ReactNode;
  /** Footer right slot (balance, quick-pct buttons). */
  footerRight?: ReactNode;
  /** `canvas` for primary cards, `surface` for muted/destination cards. */
  tone?: 'canvas' | 'surface';
  className?: string;
}

const BASE =
  'rounded-md border border-line px-5 py-4 shadow-sm transition-colors duration-150';

const TONE: Record<NonNullable<Props['tone']>, string> = {
  canvas: 'bg-canvas',
  surface: 'bg-surface',
};

const LABEL =
  'text-[13px] font-semibold text-fg';
const AMOUNT =
  'm-0 overflow-hidden text-ellipsis whitespace-nowrap text-[32px] font-bold leading-[1.05] -tracking-[0.025em] tabular-nums text-fg';

/**
 * Shared "Pay with / Sell / Buy" amount card used by both PayIntentSummary and
 * SwapIntentSummary so spacing, typography, and shimmer dimensions stay in
 * lockstep across the Pay and Swap surfaces.
 */
export function TokenAmountCard({
  label,
  labelAdornment,
  amount,
  amountLoading,
  tokenPill,
  footerLeft,
  footerRight,
  tone = 'canvas',
  className,
}: Props) {
  const hasFooter = footerLeft != null || footerRight != null;
  return (
    <div className={cn(BASE, TONE[tone], className)}>
      <div className="mb-2.5 flex items-center justify-between gap-2.5">
        <span className={LABEL}>{label}</span>
        {labelAdornment}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {amountLoading ? (
            <Shimmer width="140px" height="34px" radius="8px" />
          ) : (
            <p className={AMOUNT}>{amount || '0'}</p>
          )}
        </div>
        {tokenPill}
      </div>
      {hasFooter && (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-[12.5px] tabular-nums text-fg-muted">
          <span className="min-w-0">{footerLeft}</span>
          <span className="flex flex-wrap items-center gap-2">{footerRight}</span>
        </div>
      )}
    </div>
  );
}
