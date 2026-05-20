import type { CSSProperties, ReactNode } from 'react';
import { t } from '../../theme';

export type PillVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'accent' | 'info';
export type PillSize = 'xs' | 'sm';

interface Props {
  children: ReactNode;
  variant?: PillVariant;
  size?: PillSize;
  leading?: ReactNode;
  style?: CSSProperties;
  title?: string;
}

function palette(variant: PillVariant): { bg: string; fg: string } {
  switch (variant) {
    case 'success': return { bg: t.successSoft as string, fg: t.success as string };
    case 'warning': return { bg: t.warningSoft as string, fg: t.warning as string };
    case 'danger':  return { bg: t.dangerSoft as string, fg: t.danger as string };
    case 'accent':  return { bg: t.accentSoft as string, fg: t.primary as string };
    case 'info':    return { bg: t.accentSoft as string, fg: t.info as string };
    default:        return { bg: t.surface as string, fg: t.textSecondary as string };
  }
}

export function Pill({ children, variant = 'neutral', size = 'sm', leading, style, title }: Props) {
  const { bg, fg } = palette(variant);
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: bg,
    color: fg,
    fontSize: size === 'xs' ? '10px' : '11px',
    fontWeight: 600,
    letterSpacing: '0.02em',
    padding: size === 'xs' ? '2px 7px' : '3px 10px',
    borderRadius: '999px',
    whiteSpace: 'nowrap',
    lineHeight: 1.4,
    fontVariantNumeric: 'tabular-nums',
  };
  return (
    <span style={{ ...base, ...style }} title={title}>
      {leading}
      {children}
    </span>
  );
}
