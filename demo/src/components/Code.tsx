import type { ReactNode } from 'react';

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded px-[0.3125rem] py-px font-mono text-[0.8125rem] text-demo-text bg-demo-code-bg">
      {children}
    </code>
  );
}
