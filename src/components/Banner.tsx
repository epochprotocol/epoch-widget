import type { CSSProperties, ReactNode } from 'react';
import { s } from '../styles';
import { t } from '../theme';
import { AlertIcon, InfoIcon } from './Icons';

type BannerVariant = 'info' | 'error' | 'warning' | 'success';

interface BannerProps {
  variant?: BannerVariant;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

const PALETTE: Record<BannerVariant, { bg: string; border: string; color: string }> = {
  info: {
    bg: 'rgba(59, 130, 246, 0.08)',
    border: 'rgba(59, 130, 246, 0.25)',
    color: t.info,
  },
  error: {
    bg: 'rgba(220, 38, 38, 0.06)',
    border: 'rgba(220, 38, 38, 0.2)',
    color: t.error,
  },
  warning: {
    bg: 'rgba(217, 119, 6, 0.08)',
    border: 'rgba(217, 119, 6, 0.22)',
    color: t.warning,
  },
  success: {
    bg: 'rgba(22, 163, 74, 0.08)',
    border: 'rgba(22, 163, 74, 0.22)',
    color: t.success,
  },
};

export function Banner({ variant = 'info', children, action, className }: BannerProps) {
  const palette = PALETTE[variant];
  const style: CSSProperties = className
    ? {}
    : {
        ...s.banner,
        backgroundColor: palette.bg,
        border: `1px solid ${palette.border}`,
        color: palette.color,
      };

  const Icon = variant === 'info' || variant === 'success' ? InfoIcon : AlertIcon;

  return (
    <div className={className} style={style}>
      <span style={{ display: 'flex', marginTop: '1px' }}>
        <Icon />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
