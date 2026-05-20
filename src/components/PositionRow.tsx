import type { CSSProperties } from 'react';
import { t } from '../theme';
import { formatAmount } from '../utils';
import type { EpochEarnPosition } from '../types';
import { Pill } from './ui/Pill';

interface Props {
  position: EpochEarnPosition;
  expanded: boolean;
  onWithdrawClick: () => void;
}

const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px',
  borderRadius: t.radiusMd,
  border: `1px solid ${t.border}`,
  backgroundColor: t.bg,
  boxShadow: t.shadowSm,
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
};

const rowActive: CSSProperties = {
  ...row,
  borderColor: t.primary,
  backgroundColor: t.accentSoft,
};

const logo: CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '999px',
  flexShrink: 0,
  backgroundColor: t.surface,
  objectFit: 'cover',
};

const logoFallback: CSSProperties = {
  ...logo,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: 700,
  color: t.textMuted,
  border: `1px solid ${t.border}`,
};

const titleText: CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: t.text,
};

const subText: CSSProperties = {
  fontSize: '11px',
  color: t.textMuted,
  marginTop: '3px',
};

const valueText: CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: t.text,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};

const amountSubText: CSSProperties = {
  fontSize: '11px',
  color: t.textMuted,
  marginTop: '3px',
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};

const btn: CSSProperties = {
  all: 'unset',
  cursor: 'pointer',
  padding: '8px 14px',
  borderRadius: t.radiusSm,
  fontSize: '13px',
  fontWeight: 600,
  backgroundColor: t.primary,
  color: '#fff',
  textAlign: 'center',
};

const btnGhost: CSSProperties = {
  ...btn,
  backgroundColor: 'transparent',
  color: t.text,
  border: `1px solid ${t.border}`,
};

function formatUsd(v: number | undefined): string | null {
  if (v === undefined || !Number.isFinite(v)) return null;
  if (v >= 1) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (v >= 0.01) return `$${v.toFixed(4)}`;
  if (v > 0) return `<$0.01`;
  return `$0.00`;
}

function change24hVariant(delta: number | undefined): 'success' | 'danger' | 'neutral' {
  if (delta === undefined || !Number.isFinite(delta)) return 'neutral';
  if (delta > 0.01) return 'success';
  if (delta < -0.01) return 'danger';
  return 'neutral';
}

function formatChange(delta: number | undefined): string | null {
  if (delta === undefined || !Number.isFinite(delta)) return null;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(2)}%`;
}

export function PositionRow({ position, expanded, onWithdrawClick }: Props) {
  const { market } = position;
  const balanceRaw = position.withdrawableRaw ?? position.underlyingBalanceRaw;
  let underlyingHuman = '—';
  try {
    underlyingHuman = formatAmount(BigInt(balanceRaw), market.token.decimals);
  } catch {
    /* keep dash */
  }
  const usd = formatUsd(position.underlyingUsdValue);
  const change = formatChange(position.priceChange24h);
  const changeVariant = change24hVariant(position.priceChange24h);

  return (
    <div style={expanded ? rowActive : row}>
      {market.token.logoURI ? (
        <img src={market.token.logoURI} alt={market.token.symbol} style={logo} />
      ) : (
        <span style={logoFallback}>{market.token.symbol.slice(0, 3).toUpperCase()}</span>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={titleText}>
          {market.token.symbol}{' '}
          <span style={{ fontWeight: 400, color: t.textMuted, fontSize: '12px' }}>
            · {market.lenderName ?? market.lenderKey ?? 'Lender'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
          <Pill variant="neutral" size="xs">{market.chainLabel}</Pill>
          {market.aprDecimal > 0 && (
            <Pill variant="success" size="xs">
              {(market.aprDecimal * 100).toFixed(2)}% APR
            </Pill>
          )}
          {change && (
            <Pill variant={changeVariant} size="xs">
              24h {change}
            </Pill>
          )}
          {position.collateralEnabled && (
            <Pill variant="info" size="xs">Collateral</Pill>
          )}
        </div>
      </div>
      <div>
        {usd ? (
          <>
            <div style={valueText}>{usd}</div>
            <div style={amountSubText}>
              {underlyingHuman} {market.token.symbol}
            </div>
          </>
        ) : (
          <div style={valueText}>
            {underlyingHuman} {market.token.symbol}
          </div>
        )}
      </div>
      <button type="button" style={expanded ? btnGhost : btn} onClick={onWithdrawClick}>
        {expanded ? 'Cancel' : 'Withdraw'}
      </button>
    </div>
  );
}
