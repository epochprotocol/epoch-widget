import type { ReactNode } from 'react';

const toneClass = {
  slate: 'bg-demo-badge-bg text-demo-badge-text',
  amber: 'bg-demo-badge-amber-bg text-demo-badge-amber-text',
  violet: 'bg-demo-badge-violet-bg text-demo-badge-violet-text',
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
        'inline-flex items-center rounded-md px-[0.4375rem] py-0.5 font-mono text-[0.6875rem] font-medium',
        toneClass[tone],
      ].join(' ')}
    >
      {children}
    </span>
  );
}
