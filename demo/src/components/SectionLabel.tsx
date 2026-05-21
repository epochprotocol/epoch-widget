import type { ReactNode } from 'react';

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={[
        'm-0 mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-fg-muted',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </h2>
  );
}
