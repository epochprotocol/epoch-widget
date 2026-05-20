import type { CSSProperties } from 'react';
import { s } from '../styles';
import { t } from '../theme';
import { formatAmount } from '../utils';
import type { EpochEarnPosition, EpochEarnPositionsSummary } from '../types';
import { Banner } from './Banner';
import { PositionRow } from './PositionRow';
import { Shimmer } from './Shimmer';
import { Pill } from './ui/Pill';

interface Props {
  positions: EpochEarnPosition[];
  summary: EpochEarnPositionsSummary | null;
  isLoading: boolean;
  error: Error | null;
  walletConnected: boolean;
  selectedPosition: EpochEarnPosition | null;
  onSelectPosition: (p: EpochEarnPosition | null) => void;
  withdrawAmount: string;
  onAmountChange: (v: string) => void;
  onMaxClick: (position: EpochEarnPosition, maxHuman: string) => void;
  buildError: string | null;
}

const label: CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: t.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
};

const input: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: t.radiusSm,
  border: `1px solid ${t.border}`,
  fontSize: '15px',
  fontFamily: 'inherit',
  color: t.text,
  backgroundColor: t.bg,
  outline: 'none',
};

const maxBtn: CSSProperties = {
  all: 'unset',
  cursor: 'pointer',
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 600,
  color: t.primary,
  border: `1px solid ${t.primary}`,
  backgroundColor: 'transparent',
};

const list: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const summaryCard: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px',
  borderRadius: t.radiusMd,
  border: `1px solid ${t.border}`,
  backgroundColor: t.surface,
  marginBottom: '12px',
};

const summaryTopRow: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: '12px',
};

const navLabel: CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: t.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const navValue: CSSProperties = {
  fontSize: '26px',
  fontWeight: 700,
  color: t.text,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1.1,
  marginTop: '4px',
};

const statRow: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '8px',
};

const stat: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  padding: '8px 10px',
  borderRadius: t.radiusSm,
  backgroundColor: t.bg,
  border: `1px solid ${t.border}`,
};

const statLabel: CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  color: t.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const statValue: CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: t.text,
  fontVariantNumeric: 'tabular-nums',
};

function formatUsd(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (v >= 1) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (v >= 0.01) return `$${v.toFixed(4)}`;
  if (v > 0) return '<$0.01';
  return '$0.00';
}

function navDelta(summary: EpochEarnPositionsSummary): { pct: number; sign: '+' | '-' | '' } | null {
  const prev = summary.nav24hUsd;
  const now = summary.navUsd;
  if (!Number.isFinite(prev) || prev <= 0 || !Number.isFinite(now)) return null;
  const pct = ((now - prev) / prev) * 100;
  const sign = pct > 0 ? '+' : pct < 0 ? '-' : '';
  return { pct: Math.abs(pct), sign };
}

function PortfolioSummary({ summary }: { summary: EpochEarnPositionsSummary }) {
  const delta = navDelta(summary);
  const deltaVariant = delta && delta.sign === '+' ? 'success' : delta && delta.sign === '-' ? 'danger' : 'neutral';
  return (
    <div style={summaryCard}>
      <div style={summaryTopRow}>
        <div>
          <div style={navLabel}>Net Worth</div>
          <div style={navValue}>{formatUsd(summary.navUsd)}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {delta && (
            <Pill variant={deltaVariant} size="sm">
              24h {delta.sign}
              {delta.pct.toFixed(2)}%
            </Pill>
          )}
          {summary.netAprDecimal > 0 && (
            <Pill variant="success" size="sm">
              Net APR {(summary.netAprDecimal * 100).toFixed(2)}%
            </Pill>
          )}
        </div>
      </div>
      <div style={statRow}>
        <div style={stat}>
          <span style={statLabel}>Deposits</span>
          <span style={statValue}>{formatUsd(summary.depositsUsd)}</span>
        </div>
        <div style={stat}>
          <span style={statLabel}>Debt</span>
          <span style={statValue}>{formatUsd(summary.debtUsd)}</span>
        </div>
        <div style={stat}>
          <span style={statLabel}>Footprint</span>
          <span style={statValue}>
            {summary.activeChains} chain{summary.activeChains === 1 ? '' : 's'} · {summary.activeLenders} lender
            {summary.activeLenders === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function WithdrawPanel({
  positions,
  summary,
  isLoading,
  error,
  walletConnected,
  selectedPosition,
  onSelectPosition,
  withdrawAmount,
  onAmountChange,
  onMaxClick,
  buildError,
}: Props) {
  if (!walletConnected) {
    return (
      <Banner variant="info">Connect your wallet to load your positions.</Banner>
    );
  }
  if (error) {
    return <Banner variant="error">Failed to load positions: {error.message}</Banner>;
  }
  if (isLoading) {
    return (
      <div style={list}>
        <Shimmer width="100%" height="120px" radius={t.radiusMd} />
        <Shimmer width="100%" height="72px" radius={t.radiusSm} />
        <Shimmer width="100%" height="72px" radius={t.radiusSm} />
      </div>
    );
  }
  if (positions.length === 0) {
    return (
      <>
        {summary && <PortfolioSummary summary={summary} />}
        <div style={{ ...s.payCard, fontSize: '13px', lineHeight: 1.55 }}>
          <p style={{ margin: 0, color: t.text, fontWeight: 600 }}>No active positions</p>
          <p style={{ margin: '8px 0 0', color: t.textMuted }}>
            Deposit into a market first and your withdrawable positions will show up here.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {summary && <PortfolioSummary summary={summary} />}
      <div style={list}>
        {positions.map((p) => {
          const isSelected = selectedPosition?.id === p.id;
          const maxRaw = p.withdrawableRaw ?? p.underlyingBalanceRaw;
          const maxHuman = (() => {
            try {
              return formatAmount(BigInt(maxRaw), p.market.token.decimals);
            } catch {
              return '0';
            }
          })();
          return (
            <div key={p.id}>
              <PositionRow
                position={p}
                expanded={isSelected}
                onWithdrawClick={() => onSelectPosition(isSelected ? null : p)}
              />
              {isSelected && (
                <div style={{ ...s.payCard, marginTop: '8px' }}>
                  <span style={label}>Withdraw amount ({p.market.token.symbol})</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => onAmountChange(e.target.value)}
                      style={input}
                      aria-label="Withdraw amount"
                    />
                    <button
                      type="button"
                      style={maxBtn}
                      onClick={() => onMaxClick(p, maxHuman)}
                    >
                      MAX
                    </button>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: t.textMuted }}>
                    Available: {maxHuman} {p.market.token.symbol}
                    {p.underlyingUsdValue != null && (
                      <span> · ≈ {formatUsd(p.underlyingUsdValue)}</span>
                    )}
                  </p>
                  {buildError && (
                    <p style={{ marginTop: '8px', color: t.error, fontSize: '13px', marginBottom: 0 }}>
                      {buildError}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
