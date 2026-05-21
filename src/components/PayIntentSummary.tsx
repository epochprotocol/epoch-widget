import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { EpochClassNames } from '../types';
import { Avatar } from './Avatar';
import { Shimmer } from './Shimmer';
import { ChevronRightIcon, WalletIcon } from './Icons';
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
  classNames?: EpochClassNames;
}

const HERO_CARD =
  'rounded-lg border border-line bg-surface px-5.5 pt-7 pb-5.5 text-center shadow-sm';
const PAY_CARD =
  'relative rounded-md border border-line bg-canvas px-5 pt-4.5 pb-4 shadow-sm';
const SECTION_LABEL = 'text-[13px] font-medium text-fg-muted';

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
  classNames: cs,
}: PayIntentSummaryProps) {
  return (
    <div className="flex flex-col gap-2.5">
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

      <div className={cn(PAY_CARD, cs?.payCard)}>
        <div className="mb-2 flex items-center justify-between gap-2.5">
          <span className={cn(SECTION_LABEL, cs?.payLabel)}>Pay with</span>
          {walletAddress ? (
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
            <span className={SECTION_LABEL}>Connect wallet</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isQuoting ? (
              <Shimmer width="140px" height="36px" radius="8px" />
            ) : (
              <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[32px] font-bold leading-tight -tracking-[0.025em] tabular-nums text-fg">
                {payAmount}
              </p>
            )}
          </div>
          {tokenSelectorTrigger}
        </div>

        <div className="mt-3.5 flex items-center justify-between text-[12.5px] tabular-nums text-fg-muted">
          <span>≈ $—</span>
          {isBalanceLoading ? (
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
          )}
        </div>
      </div>
    </div>
  );
}
