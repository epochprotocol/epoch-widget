import type { CSSProperties } from 'react';
import { t } from '../../theme';
import type { OneDeltaConfig, OneDeltaMarketRow } from '../../types';
import { TrendingUpIcon } from '../Icons';
import { TokenAvatar } from '../ui/TokenAvatar';

interface Props {
  row: OneDeltaMarketRow;
  config: OneDeltaConfig;
  kind: 'lend' | 'borrow';
  selected?: boolean;
  onClick: () => void;
}

function fmtUsd(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

const LENDER_LABELS: Record<string, string> = {
  AAVE_V3: 'Aave',
  AAVE_V2: 'Aave',
  COMPOUND_V3: 'Compound',
  MORPHO_BLUE: 'Morpho',
  VENUS: 'Venus',
};

const LENDER_DOT: Record<string, string> = {
  AAVE_V3: '#b6509e',
  AAVE_V2: '#b6509e',
  COMPOUND_V3: '#00d395',
  MORPHO_BLUE: '#2b5cff',
  VENUS: '#f6c344',
};

function lenderShort(lenderKey: string): string {
  return LENDER_LABELS[lenderKey] ?? lenderKey.replace('_', ' ');
}

export function MarketRowCard({ row, config, kind, selected, onClick }: Props) {
  const asset = row.underlyingInfo.asset;
  const rate = kind === 'lend' ? row.depositRate : row.variableBorrowRate;
  const tvlUsd = kind === 'lend' ? row.totalDepositsUsd : row.borrowLiquidityUsd;
  const lender = lenderShort(config.lenderKey);
  const dotColor = LENDER_DOT[config.lenderKey] ?? (t.primary as string);
  const title = `${lender} v3 ${asset.symbol} ${kind === 'lend' ? 'Lending' : 'Borrowing'}`;

  const base: CSSProperties = {
    all: 'unset',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    width: '100%',
    padding: '14px 4px',
    boxSizing: 'border-box',
    borderTop: `1px solid ${t.border}`,
    transition: 'background-color 0.12s ease',
    backgroundColor: selected ? t.accentSoft : 'transparent',
    fontFamily: 'inherit',
  };

  return (
    <button
      type="button"
      style={base}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.backgroundColor = t.surfaceMuted as string;
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.backgroundColor = 'transparent';
      }}
      aria-label={`Select ${title}`}
    >
      <TokenAvatar src={asset.logoURI} symbol={asset.symbol} size={44} />

      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: t.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.25,
          }}
        >
          {title}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${dotColor}cc 0%, ${dotColor} 60%, ${dotColor}80 100%)`,
              display: 'inline-block',
              flexShrink: 0,
            }}
            aria-hidden
          />
          <span style={{ fontSize: '12.5px', color: t.textMuted, fontWeight: 500 }}>{lender}</span>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: t.success,
            fontSize: '15px',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <TrendingUpIcon />
          {rate.toFixed(rate >= 10 ? 1 : 2)}% APY
        </span>
        <span style={{ fontSize: '12px', color: t.textMuted, fontVariantNumeric: 'tabular-nums' }}>
          TVL: {fmtUsd(tvlUsd)}
        </span>
      </div>
    </button>
  );
}
