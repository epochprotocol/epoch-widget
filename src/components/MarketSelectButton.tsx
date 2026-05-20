import type { CSSProperties } from 'react';
import { t } from '../theme';
import type { EpochEarnMarket } from '../types';
import { ChevronRightIcon, SearchIcon } from './Icons';
import { Pill } from './ui/Pill';

interface Props {
  selected: EpochEarnMarket | null;
  onClick: () => void;
  disabled?: boolean;
}

const rowBtn: CSSProperties = {
  all: 'unset',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  boxSizing: 'border-box',
  padding: '14px 16px',
  borderRadius: t.radiusMd,
  cursor: 'pointer',
  border: `1px solid ${t.border}`,
  backgroundColor: t.bg,
  boxShadow: t.shadowSm,
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  fontFamily: 'inherit',
};

const chevron: CSSProperties = {
  marginLeft: 'auto',
  color: t.textMuted,
  flexShrink: 0,
};

export function MarketSelectButton({ selected, onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ ...rowBtn, opacity: disabled ? 0.55 : 1 }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.borderColor = t.borderStrong as string;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.borderColor = t.border as string;
      }}
      aria-label={selected ? `Change market — ${selected.displayName}` : 'Select market to earn yield with'}
    >
      <span
        style={{
          color: selected ? t.primary : t.textMuted,
          display: 'flex',
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: selected ? t.accentSoft : t.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SearchIcon width={16} height={16} />
      </span>
      <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
        {selected ? (
          <>
            <div style={{ fontSize: '15px', fontWeight: 600, color: t.text, lineHeight: 1.2 }}>
              {selected.displayName}
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              <Pill variant="neutral" size="xs">{selected.chainLabel}</Pill>
              <Pill variant="neutral" size="xs">{selected.token.symbol}</Pill>
              <Pill variant="success" size="xs">{(selected.aprDecimal * 100).toFixed(2)}% APR</Pill>
            </div>
          </>
        ) : (
          <div style={{ fontSize: '15px', fontWeight: 500, color: t.textMuted }}>Select market to earn yield with</div>
        )}
      </div>
      <span style={chevron}>
        <ChevronRightIcon />
      </span>
    </button>
  );
}
