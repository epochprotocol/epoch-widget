import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { EpochClassNames } from '../types';
import { ArrowDownIcon, ChevronRightIcon, WalletIcon } from './Icons';
import { Avatar } from './Avatar';
import { Shimmer } from './Shimmer';
import { truncateAddress, formatBalancePortionForInput } from '../utils';

interface SwapIntentSummaryProps {
  sellAmount: string;
  sellSymbol: string;
  sellTokenPill?: ReactNode;
  buyAmount: string;
  buySymbol: string;
  buyTokenPill?: ReactNode;
  walletAddress?: string;
  walletIcon?: string;
  walletConnected?: boolean;
  isQuoting?: boolean;
  balanceStr?: string;
  balanceError?: boolean;
  isBalanceLoading?: boolean;
  sellBalanceRaw?: bigint | null;
  sellDecimals?: number;
  onAmountChange?: ((amount: string) => void) | null;
  classNames?: EpochClassNames;
}

const CARD_BASE = 'rounded-md border border-line px-5 py-4.5 shadow-sm';
const SECTION_LABEL = 'text-[13px] font-semibold text-fg';
const AMOUNT_CLASSES =
  'm-0 overflow-hidden text-ellipsis whitespace-nowrap text-[34px] font-bold leading-[1.05] -tracking-[0.025em] tabular-nums text-fg';
const PCT_BTN =
  'cursor-pointer rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-fg-secondary';

/**
 * Swap-flavoured intent summary — two stacked cards (Sell / Buy) with a small
 * down-arrow chip between them. Buy card has a muted background so the two
 * sides are visually distinct.
 */
export function SwapIntentSummary({
  sellAmount,
  sellSymbol,
  sellTokenPill,
  buyAmount,
  buySymbol,
  buyTokenPill,
  walletAddress,
  walletIcon,
  walletConnected,
  isQuoting,
  balanceStr,
  balanceError,
  isBalanceLoading,
  sellBalanceRaw,
  sellDecimals = 18,
  onAmountChange,
  classNames: cs,
}: SwapIntentSummaryProps) {
  const applyPortion = (num: number, den: number) => {
    if (!onAmountChange || !sellBalanceRaw || sellBalanceRaw === 0n) return;
    onAmountChange(formatBalancePortionForInput(sellBalanceRaw, num, den, sellDecimals));
  };

  const walletBadge = walletAddress ? (
    <div
      className="flex items-center gap-1.5 py-0.75 text-[12.5px] font-bold tabular-nums text-primary"
      title={walletAddress}
    >
      {walletIcon ? <Avatar src={walletIcon} label="Wallet" size={18} /> : <WalletIcon width={14} height={14} />}
      <span>{truncateAddress(walletAddress, 4)}</span>
      <span className="inline-flex text-primary/85">
        <ChevronRightIcon width={12} height={12} />
      </span>
    </div>
  ) : (
    <span className="text-[12.5px] text-fg-muted">Connect wallet</span>
  );

  return (
    <div className="relative flex flex-col">
      <div className={cn(CARD_BASE, 'bg-canvas', cs?.payCard)}>
        <div className="mb-2.5 flex items-center justify-between gap-2.5">
          <span className={SECTION_LABEL}>Sell</span>
          {walletBadge}
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isQuoting ? <Shimmer width="120px" height="34px" radius="8px" /> : <p className={AMOUNT_CLASSES}>{sellAmount || '0'}</p>}
          </div>
          {sellTokenPill}
        </div>
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-[12.5px] tabular-nums text-fg-muted">
          <span>≈ $—</span>
          <div className="flex flex-wrap items-center gap-2">
            {isBalanceLoading ? (
              <Shimmer width="100px" height="12px" radius="4px" />
            ) : (
              <span
                className={cn(
                  balanceError ? 'font-semibold text-error' : 'font-medium text-fg-secondary',
                )}
              >
                {balanceStr ?? (walletConnected ? `Balance: 0 ${sellSymbol}` : 'Balance: —')}
              </span>
            )}
            {onAmountChange && sellBalanceRaw ? (
              <div className="flex gap-1.5">
                <button type="button" className={PCT_BTN} onClick={() => applyPortion(20, 100)}>20%</button>
                <button type="button" className={PCT_BTN} onClick={() => applyPortion(50, 100)}>50%</button>
                <button type="button" className={PCT_BTN} onClick={() => applyPortion(1, 1)}>Max</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none relative z-[2] flex h-0 justify-center"
      >
        <div className="absolute top-0 -translate-y-1/2 flex h-8.5 w-8.5 items-center justify-center rounded-full border border-line bg-canvas text-fg-secondary shadow-[0_0_0_4px_var(--epoch-color-bg)]">
          <ArrowDownIcon width={14} height={14} />
        </div>
      </div>

      <div className={cn(CARD_BASE, 'mt-2 bg-surface', cs?.receiveCard)}>
        <div className="mb-2.5 flex items-center justify-between gap-2.5">
          <span className={SECTION_LABEL}>Buy</span>
          {walletBadge}
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isQuoting ? <Shimmer width="120px" height="34px" radius="8px" /> : <p className={AMOUNT_CLASSES}>{buyAmount || '0'}</p>}
          </div>
          {buyTokenPill}
        </div>
        <div className="mt-3.5 flex items-center justify-end text-[12.5px] tabular-nums text-fg-muted">
          <span>Balance: 0 {buySymbol}</span>
        </div>
      </div>
    </div>
  );
}
