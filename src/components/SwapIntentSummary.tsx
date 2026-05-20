import type { CSSProperties, ReactNode } from 'react';
import { t } from '../theme';
import type { EpochClassNames } from '../types';
import { ArrowDownIcon, ChevronRightIcon, WalletIcon } from './Icons';
import { Avatar } from './Avatar';
import { Shimmer } from './Shimmer';
import { truncateAddress, formatBalancePortionForInput } from '../utils';

const NUMERIC: CSSProperties = {
  fontVariantNumeric: 'tabular-nums',
  fontFeatureSettings: '"tnum"',
};

interface SwapIntentSummaryProps {
  /** Amount the user sells. */
  sellAmount: string;
  sellSymbol: string;
  /** Token+chain pill on the Sell card (interactive). */
  sellTokenPill?: ReactNode;
  /** Amount the user buys (post-quote). */
  buyAmount: string;
  buySymbol: string;
  /** Token+chain pill on the Buy card (read-only destination). */
  buyTokenPill?: ReactNode;
  /** Connected wallet — same address on both sides. */
  walletAddress?: string;
  walletIcon?: string;
  walletConnected?: boolean;
  isQuoting?: boolean;
  /** Source balance string. */
  balanceStr?: string;
  balanceError?: boolean;
  isBalanceLoading?: boolean;
  /** Raw source balance for the 20% / 50% / Max quick fills. */
  sellBalanceRaw?: bigint | null;
  sellDecimals?: number;
  /** Called when the user picks 20% / 50% / Max. Pass null to ignore. */
  onAmountChange?: ((amount: string) => void) | null;
  classNames?: EpochClassNames;
}

/**
 * Swap-flavoured intent summary — two stacked cards (Sell / Buy) with a small
 * down-arrow chip between them. Buy card has a muted background so the two
 * sides are visually distinct. Fork freely without touching PayIntentSummary.
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
  classNames: cn,
}: SwapIntentSummaryProps) {
  const cardBase: CSSProperties = {
    borderRadius: t.radiusMd,
    border: `1px solid ${t.border}`,
    boxShadow: t.shadowSm,
    padding: '18px 20px',
    boxSizing: 'border-box',
  };

  const sellCard: CSSProperties = { ...cardBase, backgroundColor: t.bg };
  const buyCard: CSSProperties = { ...cardBase, backgroundColor: t.surface };

  const sectionLabel: CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: t.text,
  };

  const amount: CSSProperties = {
    margin: 0,
    fontSize: '34px',
    fontWeight: 700,
    letterSpacing: '-0.025em',
    color: t.text,
    lineHeight: 1.05,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    ...NUMERIC,
  };

  const pctBtn: CSSProperties = {
    all: 'unset',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 999,
    color: t.textSecondary,
    backgroundColor: t.surface,
    border: `1px solid ${t.border}`,
  };

  const applyPortion = (num: number, den: number) => {
    if (!onAmountChange || !sellBalanceRaw || sellBalanceRaw === 0n) return;
    onAmountChange(formatBalancePortionForInput(sellBalanceRaw, num, den, sellDecimals));
  };

  const walletBadge = walletAddress ? (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '12.5px',
        fontWeight: 700,
        color: t.primary,
        padding: '3px 0',
        ...NUMERIC,
      }}
      title={walletAddress}
    >
      {walletIcon ? <Avatar src={walletIcon} label="Wallet" size={18} /> : <WalletIcon width={14} height={14} />}
      <span>{truncateAddress(walletAddress, 4)}</span>
      <span style={{ color: t.primary, opacity: 0.85, display: 'inline-flex' }}>
        <ChevronRightIcon width={12} height={12} />
      </span>
    </div>
  ) : (
    <span style={{ fontSize: '12.5px', color: t.textMuted }}>Connect wallet</span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className={cn?.payCard} style={cn?.payCard ? undefined : sellCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
          <span style={sectionLabel}>Sell</span>
          {walletBadge}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isQuoting ? <Shimmer width="120px" height="34px" radius="8px" /> : <p style={amount}>{sellAmount || '0'}</p>}
          </div>
          {sellTokenPill}
        </div>

        <div
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            fontSize: '12.5px',
            color: t.textMuted,
            ...NUMERIC,
          }}
        >
          <span>≈ $—</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {isBalanceLoading ? (
              <Shimmer width="100px" height="12px" radius="4px" />
            ) : (
              <span style={{ color: balanceError ? t.error : t.textSecondary, fontWeight: balanceError ? 600 : 500 }}>
                {balanceStr ?? (walletConnected ? `Balance: 0 ${sellSymbol}` : 'Balance: —')}
              </span>
            )}
            {onAmountChange && sellBalanceRaw ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" style={pctBtn} onClick={() => applyPortion(20, 100)}>
                  20%
                </button>
                <button type="button" style={pctBtn} onClick={() => applyPortion(50, 100)}>
                  50%
                </button>
                <button type="button" style={pctBtn} onClick={() => applyPortion(1, 1)}>
                  Max
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

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
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: t.bg,
            border: `1px solid ${t.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: t.textSecondary,
            boxShadow: '0 0 0 4px var(--epoch-color-bg)',
          }}
        >
          <ArrowDownIcon width={14} height={14} />
        </div>
      </div>

      <div className={cn?.receiveCard} style={cn?.receiveCard ? undefined : { ...buyCard, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
          <span style={sectionLabel}>Buy</span>
          {walletBadge}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isQuoting ? <Shimmer width="120px" height="34px" radius="8px" /> : <p style={amount}>{buyAmount || '0'}</p>}
          </div>
          {buyTokenPill}
        </div>

        <div
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            fontSize: '12.5px',
            color: t.textMuted,
            ...NUMERIC,
          }}
        >
          <span>Balance: 0 {buySymbol}</span>
        </div>
      </div>
    </div>
  );
}
