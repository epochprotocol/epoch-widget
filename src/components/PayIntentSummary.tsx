import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { EpochClassNames } from '../types';
import { Avatar } from './Avatar';
import { Shimmer } from './Shimmer';
import { ChevronRightIcon, WalletIcon } from './Icons';
import { TokenAmountCard } from './ui/TokenAmountCard';
import { truncateAddress } from '../utils';

interface PayIntentSummaryProps {
  receiveAmount: string;
  receiveSymbol: string;
  positionLabel?: string;
  destinationChainName?: string;
  recipientAddress?: string;
  payAmount: string;
  paySymbol: string;
  tokenSelectorTrigger?: ReactNode;
  walletAddress?: string;
  walletIcon?: string;
  walletConnected?: boolean;
  isQuoting?: boolean;
  balanceStr?: string;
  balanceError?: boolean;
  isBalanceLoading?: boolean;
  /** Optional USD equivalent for the pay amount (e.g. "≈ $1.23"). */
  usdEquivalent?: string | null;
  classNames?: EpochClassNames;
}

const HERO_CARD =
  'rounded-lg border border-line bg-surface px-5 pt-6 pb-5 text-center shadow-sm';

/**
 * Pay-flavoured intent summary — hero "you receive" card on top with the
 * recipient inline, plus a "Pay with" source card beneath. Distinct from
 * Swap (which uses a stacked from/to layout).
 */
export function PayIntentSummary({
  receiveAmount,
  receiveSymbol,
  positionLabel,
  destinationChainName,
  recipientAddress,
  payAmount,
  paySymbol,
  tokenSelectorTrigger,
  walletAddress,
  walletIcon,
  walletConnected,
  isQuoting,
  balanceStr,
  balanceError,
  isBalanceLoading,
  usdEquivalent,
  classNames: cs,
}: PayIntentSummaryProps) {
  const walletBadge = walletAddress ? (
    <div
      className="flex items-center gap-1.5 rounded-full py-0.75 pl-0.75 pr-2 text-[12.5px] font-bold tabular-nums text-primary"
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

  const footerLeft = usdEquivalent ? <span>{usdEquivalent}</span> : null;
  const footerRight = isBalanceLoading ? (
    <Shimmer width="120px" height="12px" radius="4px" />
  ) : balanceStr ? (
    <span
      className={cn(
        balanceError ? 'font-semibold text-error' : 'font-medium text-fg-secondary',
      )}
    >
      {balanceStr}
    </span>
  ) : !walletConnected ? (
    <span className="opacity-70">Balance: —</span>
  ) : (
    <span className="opacity-55">Balance: 0 {paySymbol}</span>
  );

  return (
    <div className="flex animate-overlay-in flex-col gap-2.5">
      <div className={cn(HERO_CARD, cs?.receiveCard)}>
        {isQuoting ? (
          <Shimmer width="160px" height="44px" radius="10px" />
        ) : (
          <p
            className={cn(
              'm-0 font-bold leading-tight -tracking-[0.025em] tabular-nums text-fg',
              positionLabel ? 'text-2xl' : 'text-[46px]',
            )}
          >
            {positionLabel ?? (
              <>
                {receiveAmount}
                <span className="ml-2 text-[0.55em] text-fg-muted">{receiveSymbol}</span>
              </>
            )}
          </p>
        )}
        <div className="mt-3.5 inline-flex items-center gap-2 text-sm font-medium text-fg-secondary">
          <span>{recipientAddress ? 'Recipient' : 'Destination'}</span>
          {recipientAddress ? (
            <span
              className="inline-flex items-center gap-1.5 font-bold text-primary"
              title={recipientAddress}
            >
              {walletIcon ? <Avatar src={walletIcon} label="Wallet" size={18} /> : null}
              <span className="tabular-nums">{truncateAddress(recipientAddress, 4)}</span>
            </span>
          ) : (
            <span className="font-semibold text-fg">{destinationChainName ?? '—'}</span>
          )}
        </div>
      </div>

      <TokenAmountCard
        label="Pay with"
        labelAdornment={walletBadge}
        amount={payAmount}
        amountLoading={isQuoting}
        tokenPill={tokenSelectorTrigger}
        footerLeft={footerLeft}
        footerRight={footerRight}
        tone="canvas"
        className={cs?.payCard}
      />
    </div>
  );
}
