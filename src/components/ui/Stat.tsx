import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface Props {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  align?: 'start' | 'end';
  style?: CSSProperties;
  valueColor?: string;
}

export function Stat({ label, value, hint, align = 'start', style, valueColor }: Props) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-0.5',
        align === 'end' ? 'items-end' : 'items-start',
      )}
      style={style}
    >
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
        {label}
      </span>
      <span
        className="text-sm font-semibold leading-[1.15] tabular-nums"
        style={{ color: valueColor ?? 'var(--epoch-color-text)' }}
      >
        {value}
      </span>
      {hint != null && (
        <span className="text-[11px] tabular-nums text-fg-muted">{hint}</span>
      )}
    </div>
  );
}
