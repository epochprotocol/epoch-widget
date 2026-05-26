import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { EpochClassNames } from '../types';
import { ArrowDownIcon, ChevronRightIcon, WalletIcon } from './Icons';
import { Avatar } from './Avatar';
import { Shimmer } from './Shimmer';
import { TokenAmountCard } from './ui/TokenAmountCard';
import { truncateAddress, formatBalancePortionForInput } from '../utils';

interface SwapIntentSummaryProps {
  sellAmount: string;
  sellSymbol: string;
  sellTokenPill?: ReactNode;
  buyAmount: string;
  buyTokenPill?: ReactNode;
  /** Destination chain name shown on the Buy card footer. */
  destinationChainName?: string;
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
  /** Optional USD equivalent for the sell amount (e.g. "≈ $1.23"). */
  usdEquivalent?: string | null;
  classNames?: EpochClassNames;
}

const PCT_BTN =
  'cursor-pointer rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-fg-secondary transition-colors duration-150 hover:border-line-strong hover:text-fg';

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
  buyTokenPill,
  destinationChainName,
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
  usdEquivalent,
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

  const sellFooterLeft = usdEquivalent ? <span>{usdEquivalent}</span> : null;
  const sellFooterRight = (
    <>
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
        <span className="flex gap-1.5">
          <button type="button" className={PCT_BTN} onClick={() => applyPortion(20, 100)}>20%</button>
          <button type="button" className={PCT_BTN} onClick={() => applyPortion(50, 100)}>50%</button>
          <button type="button" className={PCT_BTN} onClick={() => applyPortion(1, 1)}>Max</button>
        </span>
      ) : null}
    </>
  );

  // Destination side: omit the wallet badge (recipient = same wallet, redundant
  // with the Sell card) and skip a fake balance. Surface the destination chain
  // name instead so the user knows where the asset lands.
  const buyFooterRight = destinationChainName ? (
    <span className="text-fg-muted">on {destinationChainName}</span>
  ) : null;

  return (
    <div className="relative flex animate-overlay-in flex-col">
      <TokenAmountCard
        label="You pay"
        labelAdornment={walletBadge}
        amount={sellAmount}
        amountLoading={isQuoting}
        tokenPill={sellTokenPill}
        footerLeft={sellFooterLeft}
        footerRight={sellFooterRight}
        tone="canvas"
        className={cs?.payCard}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none relative z-[2] flex h-0 justify-center"
      >
        <div className="absolute top-0 -translate-y-1/2 flex h-8.5 w-8.5 items-center justify-center rounded-full border border-line bg-canvas text-fg-secondary shadow-[0_0_0_4px_var(--epoch-color-bg)]">
          <ArrowDownIcon width={14} height={14} />
        </div>
      </div>

      <TokenAmountCard
        label="You receive"
        amount={buyAmount}
        amountLoading={isQuoting}
        tokenPill={buyTokenPill}
        footerRight={buyFooterRight}
        tone="surface"
        className={cn('mt-2', cs?.receiveCard)}
      />
    </div>
  );
}
