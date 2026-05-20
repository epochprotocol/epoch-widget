import type { ReactNode } from 'react';

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={[
        'm-0 mb-3 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-demo-text-faint',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </h2>
  );
}
