import type { CSSProperties, ReactNode } from 'react';
import { t } from '../../theme';

interface Props {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  align?: 'start' | 'end';
  style?: CSSProperties;
  valueColor?: string;
}

export function Stat({ label, value, hint, align = 'start', style, valueColor }: Props) {
  const root: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: align === 'end' ? 'flex-end' : 'flex-start',
    gap: '2px',
    minWidth: 0,
    ...style,
  };
  const labelStyle: CSSProperties = {
    fontSize: '10.5px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: t.textMuted,
  };
  const valueStyle: CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: valueColor ?? t.text,
    lineHeight: 1.15,
  };
  const hintStyle: CSSProperties = {
    fontSize: '11px',
    color: t.textMuted,
    fontVariantNumeric: 'tabular-nums',
  };
  return (
    <div style={root}>
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value}</span>
      {hint != null && <span style={hintStyle}>{hint}</span>}
    </div>
  );
}
