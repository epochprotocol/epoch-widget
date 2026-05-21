import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** When true, render as a `<pre>` code block (multi-line). Default: inline `<code>`. */
  block?: boolean;
  className?: string;
}

/**
 * Inline or block code snippet, themed against the library tokens so it
 * matches the rest of the demo (and the widget).
 */
export function Code({ children, block = false, className = '' }: Props) {
  if (block) {
    return (
      <pre
        className={
          'm-0 overflow-x-auto rounded-md border border-line bg-surface-muted px-4 py-3 font-mono text-[12.5px] leading-relaxed text-fg ' +
          className
        }
      >
        <code>{children}</code>
      </pre>
    );
  }
  return (
    <code
      className={
        'rounded px-[0.3125rem] py-px font-mono text-[0.8125rem] text-fg bg-surface-muted ' +
        className
      }
    >
      {children}
    </code>
  );
}
