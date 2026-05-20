import type { ReactNode } from 'react';
import { s } from '../styles';
import { t } from '../theme';
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

// Reserve a stable height for the meta row under each card's amount. This is
// the whole reason the separator stays put — if this row collapsed when the
// balance was absent, the pay card would shrink and the separator would jump.
const META_ROW_HEIGHT = 18;

// Numeric displays use tabular figures so digits don't shift as values change
// (e.g. while streaming a quote or balance update).
const NUMERIC: React.CSSProperties = {
  fontVariantNumeric: 'tabular-nums',
  fontFeatureSettings: '"tnum"',
};

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
  classNames: cn,
  variant = 'pay',
}: IntentSummaryProps) {
  const accent =
    variant === 'swap' ? '#0ea5a4' : variant === 'earn' ? (t.success as string) : (t.primary as string);

  const receiveTint =
    variant === 'swap'
      ? 'rgba(14,165,164,0.06)'
      : variant === 'earn'
      ? 'rgba(22,163,74,0.05)'
      : (t.surface as string);

  const cardStyle: React.CSSProperties = {
    ...s.payCard,
    padding: '18px 20px',
    position: 'relative',
    backgroundColor: t.surface,
    border: `1px solid ${t.border}`,
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: hidePayCard ? '0' : '6px',
        position: 'relative',
      }}
    >
      {!hidePayCard && (
        <>
      {/* ── Pay card (top) ─────────────────────────────────── */}
      <div
        className={cn?.payCard}
        style={cn?.payCard ? undefined : cardStyle}
      >
        {/* Label row — "You pay" on the left, wallet badge on the right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '10px',
            minHeight: '20px',
          }}
        >
          <span
            className={cn?.payLabel}
            style={cn?.payLabel ? undefined : s.payLabel}
          >
            {pay.label}
          </span>

          {walletAddress && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: t.textSecondary,
                lineHeight: 1,
                padding: '4px 8px 4px 4px',
                borderRadius: '999px',
                backgroundColor: t.bg,
                border: `1px solid ${t.border}`,
              }}
              title={walletAddress}
            >
              {walletIcon ? (
                <Avatar src={walletIcon} label="Wallet" size={16} />
              ) : (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: t.textMuted,
                  }}
                >
                  <WalletIcon width={14} height={14} />
                </span>
              )}
              <span style={NUMERIC}>{truncateAddress(walletAddress, 4)}</span>
            </div>
          )}
        </div>

        {/* Amount row — amount on left, floating pill vertically centered on right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            minHeight: '44px',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {isQuoting ? (
              <Shimmer width="140px" height="36px" radius="8px" />
            ) : (
              <p
                className={cn?.payAmount}
                style={
                  cn?.payAmount
                    ? undefined
                    : { ...s.payAmount, ...NUMERIC, margin: 0 }
                }
              >
                {pay.amount}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {tokenSelectorTrigger}
          </div>
        </div>

        {/* Balance row — always rendered at a fixed height so the pay card
            never resizes when the balance resolves. This is what prevents the
            separator circle from jumping. */}
        <div
          style={{
            marginTop: '12px',
            minHeight: `${META_ROW_HEIGHT}px`,
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            lineHeight: `${META_ROW_HEIGHT}px`,
            color: balanceError ? t.error : t.textMuted,
            fontWeight: balanceError ? 600 : 500,
            ...NUMERIC,
          }}
        >
          {isBalanceLoading ? (
            <Shimmer width="150px" height="12px" radius="4px" />
          ) : balanceStr ? (
            <span>{balanceStr}</span>
          ) : !walletConnected ? (
            <span style={{ opacity: 0.75 }}>
              Connect your wallet to see balance
            </span>
          ) : (
            <span style={{ opacity: 0.55 }}>—</span>
          )}
        </div>
      </div>

      {/* ── Separator: arrow (pay/earn) or swap-flip (swap) ──── */}
      <div
        aria-hidden="true"
        style={{
          height: 0,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            transform: 'translateY(-50%)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: t.bg,
            border: `1px solid ${variant === 'swap' ? accent : t.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            boxShadow:
              '0 0 0 4px var(--epoch-color-bg), 0 2px 8px rgba(15, 23, 42, 0.08)',
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
        className={cn?.receiveCard}
        style={
          cn?.receiveCard
            ? undefined
            : {
                ...s.receiveCard,
                textAlign: 'left',
                padding: '18px 20px',
                backgroundColor: receiveTint,
                border: `1px solid ${variant === 'swap' ? 'rgba(14,165,164,0.35)' : t.border}`,
                borderTop: variant === 'swap' ? `2px solid ${accent}` : `1px solid ${t.border}`,
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
              }
        }
      >
        {/* Label row — "You receive" on the left */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '10px',
            minHeight: '20px',
          }}
        >
          <span
            className={cn?.receiveLabel}
            style={
              cn?.receiveLabel
                ? undefined
                : {
                    ...s.receiveLabel,
                    marginTop: 0,
                    textAlign: 'left',
                  }
            }
          >
            {receive.label}
          </span>
        </div>

        {/* Amount row — position label or amount on left, destination pill on right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            minHeight: '44px',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              className={cn?.receiveAmount}
              style={
                cn?.receiveAmount
                  ? undefined
                  : {
                      ...s.receiveAmount,
                      ...NUMERIC,
                      textAlign: 'left',
                      margin: 0,
                      fontSize: receive.positionLabel
                        ? '22px'
                        : s.receiveAmount.fontSize,
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: receive.positionLabel ? 'normal' : 'nowrap',
                      wordBreak: 'break-word',
                    }
              }
            >
              {receive.positionLabel ?? receive.amount}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {destinationPill}
          </div>
        </div>

        {/* Meta row — reserves the same footprint as the pay card's balance
            row so both cards visually balance around the separator. */}
        <div
          style={{
            marginTop: '12px',
            minHeight: `${META_ROW_HEIGHT}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            fontSize: '12px',
            lineHeight: `${META_ROW_HEIGHT}px`,
            color: t.textMuted,
            fontWeight: 500,
          }}
        >
          <span style={{ opacity: 0.75 }}>
            {receive.subtitle ? `Settles on ${receive.subtitle}` : 'Settled instantly'}
          </span>
        </div>
      </div>
    </div>
  );
}
