import type { ReactNode } from 'react';
import { s } from '../styles';
import { t } from '../theme';
import type { EpochClassNames } from '../types';
import { Shimmer } from './Shimmer';
import { Avatar } from './Avatar';
import { WalletIcon } from './Icons';
import { truncateAddress } from '../utils';

interface CardData {
  label: string;
  amount: string;
  symbol: string;
  subtitle?: string;
  /** Logo URI for the token shown on the floating pill. */
  logoURI?: string;
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
   * Read-only pill shown inside the receive card displaying the desired
   * destination token + chain. Not interactive — intentionally fixed.
   */
  destinationPill?: ReactNode;
  /** Balance string shown below the pay card. */
  balanceStr?: string;
  /** Show balance in error colour. */
  balanceError?: boolean;
  /** Connected wallet address — shown at the top of the pay card. */
  walletAddress?: string;
  /** Optional connector icon (e.g. MetaMask fox) shown next to the address. */
  walletIcon?: string;
  classNames?: EpochClassNames;
}

/**
 * Two-card summary: pay on top (with floating token pill), receive on bottom.
 */
export function IntentSummary({
  pay,
  receive,
  isQuoting,
  tokenSelectorTrigger,
  destinationPill,
  balanceStr,
  balanceError,
  walletAddress,
  walletIcon,
  classNames: cn,
}: IntentSummaryProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>

      {/* ── Pay card (top) ─────────────────────────────────── */}
      <div
        className={cn?.payCard}
        style={cn?.payCard ? undefined : {
          ...s.payCard,
          padding: '20px',
          position: 'relative',
          backgroundColor: t.surface,
          border: 'none',
        }}
      >
        {/* Label row — "You pay" on the left, wallet address badge on the right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '8px',
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
                fontSize: '13px',
                fontWeight: 600,
                color: t.primary,
                lineHeight: 1,
              }}
              title={walletAddress}
            >
              {walletIcon ? (
                <Avatar src={walletIcon} label="Wallet" size={16} />
              ) : (
                <span style={{ color: t.primary, display: 'flex', alignItems: 'center' }}>
                  <WalletIcon width={14} height={14} />
                </span>
              )}
              <span>{truncateAddress(walletAddress, 4)}</span>
            </div>
          )}
        </div>

        {/* Amount row — amount on left, floating pill vertically centered on right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', minHeight: '44px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isQuoting ? (
              <Shimmer width="120px" height="36px" radius="8px" />
            ) : (
              <p
                className={cn?.payAmount}
                style={cn?.payAmount ? undefined : { ...s.payAmount, margin: 0 }}
              >
                {pay.amount}
              </p>
            )}
          </div>

          {/* Floating token+chain pill (vertically centered with amount) */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {tokenSelectorTrigger}
          </div>
        </div>

        {/* Balance */}
        {balanceStr && (
          <div
            style={{
              marginTop: '10px',
              fontSize: '12px',
              color: balanceError ? t.error : t.textMuted,
            }}
          >
            {balanceStr}
          </div>
        )}
      </div>

      {/* ── Arrow separator (absolutely centered over the gap) ── */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: t.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: t.text,
            boxShadow: '0 2px 6px rgba(0,0,0,0.08), 0 0 0 4px var(--epoch-color-bg)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 3.5v9M4.5 9l3.5 3.5L11.5 9"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* ── Receive card (bottom) ───────────────────────────── */}
      <div
        className={cn?.receiveCard}
        style={cn?.receiveCard ? undefined : {
          ...s.receiveCard,
          textAlign: 'left',
          padding: '20px',
          backgroundColor: t.surface,
          border: 'none',
        }}
      >
        {/* Label row — "You receive" on the left, locked destination pill right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '8px',
          }}
        >
          <span
            className={cn?.receiveLabel}
            style={cn?.receiveLabel ? undefined : {
              ...s.receiveLabel,
              marginTop: 0,
              textAlign: 'left',
            }}
          >
            {receive.label}
          </span>
        </div>

        {/* Amount row — amount on left, locked destination pill on right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', minHeight: '44px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              className={cn?.receiveAmount}
              style={cn?.receiveAmount ? undefined : { ...s.receiveAmount, textAlign: 'left', margin: 0 }}
            >
              {receive.amount}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {destinationPill}
          </div>
        </div>
      </div>
    </div>
  );
}
