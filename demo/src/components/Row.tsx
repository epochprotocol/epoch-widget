import type { ReactNode } from 'react';

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={['flex items-center', className].filter(Boolean).join(' ')}>{children}</div>;
}
