import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type PillVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'accent' | 'info';
export type PillSize = 'xs' | 'sm';

interface Props {
  children: ReactNode;
  variant?: PillVariant;
  size?: PillSize;
  leading?: ReactNode;
  /** Extra style overrides; merged onto the computed inline style. */
  style?: CSSProperties;
  className?: string;
  title?: string;
}

const VARIANT_CLASSES: Record<PillVariant, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger:  'bg-danger-soft  text-danger',
  accent:  'bg-accent-soft  text-primary',
  info:    'bg-accent-soft  text-info',
  neutral: 'bg-surface      text-fg-secondary',
};

const SIZE_CLASSES: Record<PillSize, string> = {
  xs: 'text-[10px] px-1.75 py-0.5',
  sm: 'text-[11px] px-2.5  py-0.75',
};

export function Pill({
  children,
  variant = 'neutral',
  size = 'sm',
  leading,
  style,
  className,
  title,
}: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold leading-snug tracking-[0.02em] whitespace-nowrap tabular-nums',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className,
      )}
      style={style}
      title={title}
    >
      {leading}
      {children}
    </span>
  );
}
