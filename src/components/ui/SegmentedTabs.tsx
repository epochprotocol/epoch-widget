import type { CSSProperties, ReactNode } from 'react';
import { t } from '../../theme';

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
}

export function SegmentedTabs<V extends string>({ tabs, value, onChange, size = 'sm', style }: Props<V>) {
  const wrap: CSSProperties = {
    display: 'flex',
    gap: '4px',
    padding: '4px',
    borderRadius: t.radiusSm,
    backgroundColor: t.surface,
    border: `1px solid ${t.border}`,
    ...style,
  };
  const btn = (active: boolean): CSSProperties => ({
    all: 'unset',
    cursor: 'pointer',
    padding: size === 'md' ? '10px 14px' : '8px 12px',
    borderRadius: '10px',
    fontSize: size === 'md' ? '13px' : '12.5px',
    fontWeight: 600,
    backgroundColor: active ? t.bg : 'transparent',
    color: active ? t.text : t.textMuted,
    textAlign: 'center',
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: active ? t.shadowSm : 'none',
    transition: 'background-color 0.15s ease, color 0.15s ease',
  });
  return (
    <div style={wrap} role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            style={btn(active)}
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
