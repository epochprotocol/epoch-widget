import { useState, type ReactNode } from 'react';

export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-demo-border bg-demo-surface">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-3 text-[0.8125rem] font-semibold text-demo-text"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span className="text-demo-text-muted">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}
