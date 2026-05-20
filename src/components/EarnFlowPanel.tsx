import type { CSSProperties } from 'react';
import { s } from '../styles';
import { t } from '../theme';
import type { EpochEarnMarket } from '../types';
import { formatAmount, formatBalancePortionForInput, truncateAddress } from '../utils';
import { Avatar } from './Avatar';
import { MarketSelectButton } from './MarketSelectButton';
import { TokenChainPill } from './TokenChainPill';

const sectionLabel: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: t.textMuted,
  letterSpacing: '0.02em',
};

const payCard: CSSProperties = {
  ...s.payCard,
  padding: '16px 18px 14px',
  borderRadius: t.radiusMd,
  backgroundColor: t.bg,
  border: `1px solid ${t.border}`,
  boxShadow: t.shadowSm,
  position: 'relative',
};

const amountInput: CSSProperties = {
  all: 'unset',
  flex: 1,
  minWidth: 0,
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  color: t.text,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1.1,
};

const pctBtn: CSSProperties = {
  all: 'unset',
  fontSize: '11px',
  fontWeight: 600,
  padding: '5px 12px',
  borderRadius: '999px',
  cursor: 'pointer',
  color: t.textSecondary,
  backgroundColor: t.surface,
  border: `1px solid ${t.border}`,
  transition: 'background 0.12s, border-color 0.12s, color 0.12s',
};

interface Props {
  selected: EpochEarnMarket | null;
  onPickMarket: () => void;
  amount: string;
  onAmountChange: (v: string) => void;
  buildError: string | null;
  /** Source token + chain (same picker as pay flow). */
  sourceTokenSymbol: string;
  sourceChainName: string;
  sourceTokenLogoURI?: string;
  sourceChainLogoURI?: string;
  onSelectSourceToken: () => void;
  walletConnected: boolean;
  walletAddress?: string;
  walletIcon?: string;
  /** Raw balance for Max / % shortcuts; null if unknown. */
  walletBalance: bigint | null;
  sourceTokenDecimals: number;
  balanceLoading?: boolean;
}

export function EarnFlowPanel({
  selected,
  onPickMarket,
  amount,
  onAmountChange,
  buildError,
  sourceTokenSymbol,
  sourceChainName,
  sourceTokenLogoURI,
  sourceChainLogoURI,
  onSelectSourceToken,
  walletConnected,
  walletAddress,
  walletIcon,
  walletBalance,
  sourceTokenDecimals,
  balanceLoading,
}: Props) {
  const balanceHuman =
    walletBalance !== null && walletConnected
      ? formatAmount(walletBalance, sourceTokenDecimals, 8)
      : null;

  const applyPortion = (num: number, den: number) => {
    if (walletBalance === null || walletBalance === 0n) return;
    onAmountChange(formatBalancePortionForInput(walletBalance, num, den, sourceTokenDecimals));
  };

  const applyMax = () => {
    if (walletBalance === null) return;
    onAmountChange(formatBalancePortionForInput(walletBalance, 1, 1, sourceTokenDecimals));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <div style={payCard}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          <span style={sectionLabel}>You pay with</span>
          {walletConnected && walletAddress ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 10px 4px 5px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(59,130,246,0.10) 100%)',
                border: '1px solid rgba(124,58,237,0.22)',
                color: '#5b21b6',
              }}
              title={walletAddress}
            >
              {walletIcon ? <Avatar src={walletIcon} label="Wallet" size={16} /> : null}
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{truncateAddress(walletAddress, 4)}</span>
              <span style={{ opacity: 0.65, marginLeft: '2px' }}>›</span>
            </div>
          ) : (
            <span style={{ ...sectionLabel, fontWeight: 500 }}>Connect wallet</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            style={amountInput}
            aria-label="Deposit amount"
          />
          <TokenChainPill
            tokenSymbol={sourceTokenSymbol}
            tokenLogoURI={sourceTokenLogoURI}
            chainName={sourceChainName}
            chainLogoURI={sourceChainLogoURI}
            onClick={onSelectSourceToken}
            ariaLabel="Change source token"
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '14px',
          }}
        >
          <span style={{ fontSize: '12px', color: t.textMuted, fontVariantNumeric: 'tabular-nums' }}>≈ $—</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {balanceLoading ? (
              <span style={{ fontSize: '12px', color: t.textMuted }}>Balance: …</span>
            ) : balanceHuman != null ? (
              <span style={{ fontSize: '12px', fontWeight: 600, color: t.textSecondary, fontVariantNumeric: 'tabular-nums' }}>
                Balance: {balanceHuman}
              </span>
            ) : (
              <span style={{ fontSize: '12px', color: t.textMuted }}>Balance: —</span>
            )}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" style={pctBtn} onClick={() => applyPortion(20, 100)} disabled={!walletBalance}>
                20%
              </button>
              <button type="button" style={pctBtn} onClick={() => applyPortion(50, 100)} disabled={!walletBalance}>
                50%
              </button>
              <button type="button" style={pctBtn} onClick={applyMax} disabled={!walletBalance}>
                Max
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        <MarketSelectButton selected={selected} onClick={onPickMarket} />
      </div>

      {buildError && (
        <p style={{ marginTop: '12px', color: t.error, fontSize: '13px', marginBottom: 0 }}>{buildError}</p>
      )}
    </div>
  );
}
