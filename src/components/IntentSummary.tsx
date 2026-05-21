import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { EpochClassNames } from '../types';
import { Shimmer } from './Shimmer';
import { Avatar } from './Avatar';
import { ArrowDownIcon, ArrowDownUpIcon, WalletIcon } from './Icons';
import { truncateAddress } from '../utils';

interface CardData {
  label: string;
  amount: string;
  symbol: string;
  subtitle?: string;
  /** Logo URI for the token shown on the floating pill. */
  logoURI?: string;
  /**
   * Human-readable description of the position (e.g. "1 Raffle Ticket").
   * When set, replaces the default `<amount>` display in the receive card.
   */
  positionLabel?: string;
}

interface IntentSummaryProps {
  /** "You pay" — top card. */
  pay: CardData;
  /** "You receive" — bottom card. */
  receive: CardData;
  /** Whether a quote is currently being fetched. */
  isQuoting?: boolean;
  /**
   * Floating token selector pill. When provided, renders inside the pay card.
   * Clicking opens the chain/token selection view.
   */
  tokenSelectorTrigger?: ReactNode;
  /**
   * When true, only the receive summary card is shown (pay UI is inlined elsewhere,
   * e.g. Earn deposit).
   */
  hidePayCard?: boolean;
  /**
   * Read-only pill shown inside the receive card displaying the desired
   * destination token + chain. Not interactive — intentionally fixed.
   */
  destinationPill?: ReactNode;
  /** Balance string shown below the pay card (when loaded). */
  balanceStr?: string;
  /** Show balance in error colour. */
  balanceError?: boolean;
  /** True while the on-chain balance request is in flight. */
  isBalanceLoading?: boolean;
  /** Whether the user's wallet is currently connected. */
  walletConnected?: boolean;
  /** Connected wallet address — shown at the top of the pay card. */
  walletAddress?: string;
  /** Optional connector icon (e.g. MetaMask fox) shown next to the address. */
  walletIcon?: string;
  classNames?: EpochClassNames;
  /** Visual variant — `pay` (default), `swap`, or `earn`. Controls colour + connector glyph. */
  variant?: 'pay' | 'swap' | 'earn';
}

// Card padding + border shared by both pay and receive cards. Soft inner
// shadow keeps the cards visually grounded against the modal canvas.
const CARD_BASE =
  'relative rounded-md border border-line bg-surface px-5 py-4.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]';

const LABEL_CLASSES = 'text-[13px] font-medium text-fg-muted';

const AMOUNT_CLASSES =
  'm-0 text-2xl font-bold leading-tight tabular-nums -tracking-[0.02em] text-fg';

const META_ROW_CLASSES = 'mt-3 flex min-h-[18px] items-center text-xs leading-[18px] tabular-nums';

/**
 * Two-card summary: pay on top (with floating token pill), receive on bottom.
 * The pay card reserves a fixed-height balance slot even when empty so async
 * balance fetches don't shift the separator circle between the cards.
 */
export function IntentSummary({
  pay,
  receive,
  isQuoting,
  tokenSelectorTrigger,
  hidePayCard = false,
  destinationPill,
  balanceStr,
  balanceError,
  isBalanceLoading,
  walletConnected,
  walletAddress,
  walletIcon,
  classNames: cs,
  variant = 'pay',
}: IntentSummaryProps) {
  // Variant-specific accent colour for the separator + swap-card top edge.
  const accentColor =
    variant === 'swap'
      ? '#0ea5a4'
      : variant === 'earn'
        ? 'var(--epoch-color-success)'
        : 'var(--epoch-color-primary)';

  const receiveCardClasses = cn(
    CARD_BASE,
    'text-left',
    variant === 'swap'
      ? 'border-[rgba(14,165,164,0.35)] bg-[rgba(14,165,164,0.06)] border-t-2'
      : variant === 'earn'
        ? 'bg-[rgba(22,163,74,0.05)]'
        : '',
  );

  return (
    <div
      className={cn(
        'relative flex flex-col',
        hidePayCard ? 'gap-0' : 'gap-1.5',
      )}
    >
      {!hidePayCard && (
        <>
          {/* ── Pay card (top) ─────────────────────────────────── */}
          <div className={cn(CARD_BASE, cs?.payCard)}>
            <div className="mb-2.5 flex min-h-5 items-center justify-between gap-3">
              <span className={cn(LABEL_CLASSES, cs?.payLabel)}>{pay.label}</span>
              {walletAddress && (
                <div
                  className="flex items-center gap-1.5 rounded-full border border-line bg-canvas py-1 pl-1 pr-2 text-xs font-semibold leading-none text-fg-secondary"
                  title={walletAddress}
                >
                  {walletIcon ? (
                    <Avatar src={walletIcon} label="Wallet" size={16} />
                  ) : (
                    <span className="flex items-center text-fg-muted">
                      <WalletIcon width={14} height={14} />
                    </span>
                  )}
                  <span className="tabular-nums">{truncateAddress(walletAddress, 4)}</span>
                </div>
              )}
            </div>
            <div className="flex min-h-11 items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                {isQuoting ? (
                  <Shimmer width="140px" height="36px" radius="8px" />
                ) : (
                  <p className={cn(AMOUNT_CLASSES, cs?.payAmount)}>{pay.amount}</p>
                )}
              </div>
              <div className="flex items-center">{tokenSelectorTrigger}</div>
            </div>
            <div
              className={cn(
                META_ROW_CLASSES,
                balanceError ? 'font-semibold text-error' : 'font-medium text-fg-muted',
              )}
            >
              {isBalanceLoading ? (
                <Shimmer width="150px" height="12px" radius="4px" />
              ) : balanceStr ? (
                <span>{balanceStr}</span>
              ) : !walletConnected ? (
                <span className="opacity-75">Connect your wallet to see balance</span>
              ) : (
                <span className="opacity-55">—</span>
              )}
            </div>
          </div>

          {/* ── Separator: arrow (pay/earn) or swap-flip (swap) ──── */}
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-[2] flex h-0 justify-center"
          >
            <div
              className="absolute top-0 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border bg-canvas shadow-[0_0_0_4px_var(--epoch-color-bg),0_2px_8px_rgba(15,23,42,0.08)]"
              style={{
                color: accentColor,
                borderColor: variant === 'swap' ? accentColor : 'var(--epoch-color-border)',
              }}
            >
              {variant === 'swap' ? (
                <ArrowDownUpIcon width={16} height={16} />
              ) : (
                <ArrowDownIcon width={16} height={16} />
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Receive card (bottom) ───────────────────────────── */}
      <div
        className={cn(receiveCardClasses, cs?.receiveCard)}
        style={variant === 'swap' ? { borderTopColor: accentColor } : undefined}
      >
        <div className="mb-2.5 flex min-h-5 items-center justify-between gap-3">
          <span className={cn(LABEL_CLASSES, cs?.receiveLabel)}>{receive.label}</span>
        </div>
        <div className="flex min-h-11 items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'm-0 overflow-hidden text-ellipsis font-bold leading-tight tabular-nums -tracking-[0.02em] text-fg',
                receive.positionLabel
                  ? 'whitespace-normal break-words text-[22px]'
                  : 'whitespace-nowrap text-[32px]',
                cs?.receiveAmount,
              )}
            >
              {receive.positionLabel ?? receive.amount}
            </p>
          </div>
          <div className="flex items-center">{destinationPill}</div>
        </div>
        <div
          className={cn(
            META_ROW_CLASSES,
            'justify-between gap-2 font-medium text-fg-muted',
          )}
        >
          <span className="opacity-75">
            {receive.subtitle ? `Settles on ${receive.subtitle}` : 'Settled instantly'}
          </span>
        </div>
      </div>
    </div>
  );
}
