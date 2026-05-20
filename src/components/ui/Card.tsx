import type { CSSProperties, ReactNode } from 'react';
import { t } from '../../theme';

type CardTone = 'default' | 'muted' | 'raised' | 'accent';

interface Props {
  children: ReactNode;
  tone?: CardTone;
  padding?: number | string;
  radius?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  interactive?: boolean;
}

function background(tone: CardTone) {
  switch (tone) {
    case 'muted': return t.surfaceMuted;
    case 'raised': return t.surfaceRaised;
    case 'accent': return t.accentSoft;
    default: return t.bg;
  }
}

export function Card({
  children,
  tone = 'default',
  padding = '16px',
  radius,
  className,
  style,
  onClick,
  interactive,
}: Props) {
  const base: CSSProperties = {
    backgroundColor: background(tone),
    border: `1px solid ${tone === 'accent' ? 'transparent' : t.border}`,
    borderRadius: radius ?? t.radiusMd,
    padding,
    boxShadow: tone === 'default' ? t.shadowSm : 'none',
    boxSizing: 'border-box',
    transition: interactive
      ? 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease'
      : undefined,
    cursor: interactive || onClick ? 'pointer' : undefined,
  };
  const merged: CSSProperties = { ...base, ...style };
  return (
    <div
      className={className}
      style={className ? undefined : merged}
      onClick={onClick}
      onMouseEnter={
        interactive && !className
          ? (e) => {
              e.currentTarget.style.borderColor = t.borderStrong as string;
              e.currentTarget.style.boxShadow = t.shadowMd as string;
            }
          : undefined
      }
      onMouseLeave={
        interactive && !className
          ? (e) => {
              e.currentTarget.style.borderColor = t.border as string;
              e.currentTarget.style.boxShadow = tone === 'default' ? (t.shadowSm as string) : 'none';
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
