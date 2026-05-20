import type { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[28px] border border-slate-900/12 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.10)]">
      <div className="p-[18px]">{children}</div>
    </div>
  );
}
