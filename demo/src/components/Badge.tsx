import type { ReactNode } from 'react';

const toneClass = {
  slate:  'bg-surface-muted  text-fg-secondary',
  amber:  'bg-warning-soft   text-warning',
  violet: 'bg-accent-soft    text-primary',
} as const;

export function Badge({
  children,
  tone = 'slate',
}: {
  children: ReactNode;
  tone?: 'slate' | 'amber' | 'violet';
}) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-md px-[7px] py-0.5 font-mono text-[11px] font-medium',
        toneClass[tone],
      ].join(' ')}
    >
      {children}
    </span>
  );
}
