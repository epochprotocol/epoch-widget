import type { CSSProperties, ReactNode } from 'react';
import { t } from '../theme';
import type { EpochClassNames } from '../types';
import { Avatar } from './Avatar';
import { Shimmer } from './Shimmer';
import { ChevronRightIcon, WalletIcon } from './Icons';
import { truncateAddress } from '../utils';

const NUMERIC: CSSProperties = {
  fontVariantNumeric: 'tabular-nums',
  fontFeatureSettings: '"tnum"',
};

interface PayIntentSummaryProps {
  /** Big numeric value shown in the hero card (e.g. "0.15" or position label). */
  receiveAmount: string;
  /** Symbol shown next to the hero amount. */
  receiveSymbol: string;
  /** Optional human-readable position label (replaces the bare amount + symbol when set). */
  positionLabel?: string;
  /** Destination chain name shown under the hero, e.g. "Settles on Base". */
  destinationChainName?: string;
  /** Recipient address shown under the hero amount. */
  recipientAddress?: string;
  /** Amount the user pays in the source token. */
  payAmount: string;
  /** Source token symbol — used only for the balance line. */
  paySymbol: string;
  /** Source token + chain pill (interactive — opens picker). */
  tokenSelectorTrigger?: ReactNode;
  /** Connected wallet address, shown as a badge inside the Pay-with card. */
  walletAddress?: string;
  walletIcon?: string;
  walletConnected?: boolean;
  isQuoting?: boolean;
  /** Balance string ("Balance: 1.23 USDC") shown on the right of the meta row. */
  balanceStr?: string;
  balanceError?: boolean;
  isBalanceLoading?: boolean;
  classNames?: EpochClassNames;
}

/**
 * Pay-flavoured intent summary — hero "you receive" card on top with the
 * recipient inline, plus a "Pay with" source card beneath. Distinct from
 * Swap (which uses a stacked from/to layout). Fork freely without touching
 * SwapIntentSummary.
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
  classNames: cn,
}: PayIntentSummaryProps) {
  const heroCard: CSSProperties = {
    backgroundColor: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: t.radiusLg,
    padding: '28px 22px 22px',
    textAlign: 'center',
    boxShadow: t.shadowSm,
  };

  const payCard: CSSProperties = {
    backgroundColor: t.bg,
    border: `1px solid ${t.border}`,
    borderRadius: t.radiusMd,
    padding: '18px 20px 16px',
    boxShadow: t.shadowSm,
    position: 'relative',
  };

  const sectionLabel: CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: t.textMuted,
  };

  const heroAmount: CSSProperties = {
    margin: 0,
    fontSize: positionLabel ? '24px' : '46px',
    fontWeight: 700,
    letterSpacing: '-0.025em',
    color: t.text,
    lineHeight: 1.1,
    ...NUMERIC,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className={cn?.receiveCard} style={cn?.receiveCard ? undefined : heroCard}>
        {isQuoting ? (
          <Shimmer width="160px" height="44px" radius="10px" />
        ) : (
          <p style={heroAmount}>
            {positionLabel ?? (
              <>
                {receiveAmount}
                <span style={{ fontSize: '0.55em', color: t.textMuted, marginLeft: 8 }}>{receiveSymbol}</span>
              </>
            )}
          </p>
        )}

        <div
          style={{
            marginTop: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '14px',
            color: t.textSecondary,
            fontWeight: 500,
          }}
        >
          <span>{recipientAddress ? 'Recipient' : 'Destination'}</span>
          {recipientAddress ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700,
                color: t.primary,
              }}
              title={recipientAddress}
            >
              {walletIcon ? <Avatar src={walletIcon} label="Wallet" size={18} /> : null}
              <span style={NUMERIC}>{truncateAddress(recipientAddress, 4)}</span>
            </span>
          ) : (
            <span style={{ fontWeight: 600, color: t.text }}>{destinationChainName ?? '—'}</span>
          )}
        </div>
      </div>

      <div className={cn?.payCard} style={cn?.payCard ? undefined : payCard}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: 8,
          }}
        >
          <span className={cn?.payLabel} style={cn?.payLabel ? undefined : sectionLabel}>
            Pay with
          </span>
          {walletAddress ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '12.5px',
                fontWeight: 700,
                color: t.primary,
                padding: '3px 8px 3px 3px',
                borderRadius: 999,
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
            <span style={sectionLabel}>Connect wallet</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isQuoting ? (
              <Shimmer width="140px" height="36px" radius="8px" />
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: '32px',
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  color: t.text,
                  lineHeight: 1.1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  ...NUMERIC,
                }}
              >
                {payAmount}
              </p>
            )}
          </div>
          {tokenSelectorTrigger}
        </div>

        <div
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12.5px',
            color: t.textMuted,
            ...NUMERIC,
          }}
        >
          <span>≈ $—</span>
          {isBalanceLoading ? (
            <Shimmer width="120px" height="12px" radius="4px" />
          ) : balanceStr ? (
            <span style={{ color: balanceError ? t.error : t.textSecondary, fontWeight: balanceError ? 600 : 500 }}>
              {balanceStr}
            </span>
          ) : !walletConnected ? (
            <span style={{ opacity: 0.7 }}>Balance: —</span>
          ) : (
            <span style={{ opacity: 0.55 }}>Balance: 0 {paySymbol}</span>
          )}
        </div>
      </div>
    </div>
  );
}
