import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface SegmentedTab<V extends string> {
  value: V;
  label: ReactNode;
  icon?: ReactNode;
}

interface Props<V extends string> {
  tabs: SegmentedTab<V>[];
  value: V;
  onChange: (v: V) => void;
  /** Visual scale. `sm` (default) = 32px tall, `md` = 40px. */
  size?: 'sm' | 'md';
  style?: CSSProperties;
  className?: string;
}

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'px-3 py-2 text-[12.5px]',
  md: 'px-3.5 py-2.5 text-[13px]',
};

export function SegmentedTabs<V extends string>({
  tabs,
  value,
  onChange,
  size = 'sm',
  style,
  className,
}: Props<V>) {
  return (
    <div
      role="tablist"
      style={style}
      className={cn(
        'flex gap-1 rounded-sm border border-line bg-surface p-1',
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              'inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border-0 text-center font-semibold transition-[background-color,color] duration-150',
              SIZE_CLASSES[size],
              active ? 'bg-canvas text-fg shadow-sm' : 'bg-transparent text-fg-muted',
            )}
            onClick={() => onChange(tab.value)}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
