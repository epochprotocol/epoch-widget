import { useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { ChevronDownIcon } from '../Icons';

interface Props {
  header: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Externally controlled open state. Pass undefined for uncontrolled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  style?: CSSProperties;
}

export function RowAccordion({
  header,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  style,
}: Props) {
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = open ?? internal;
  const toggle = () => {
    const next = !isOpen;
    if (onOpenChange) onOpenChange(next);
    if (open === undefined) setInternal(next);
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border bg-canvas transition-[border-color,box-shadow] duration-150',
        isOpen ? 'border-line-strong shadow-md' : 'border-line shadow-none',
      )}
      style={style}
    >
      <button
        type="button"
        className="box-border flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent p-0 px-3.5 py-3"
        onClick={toggle}
        aria-expanded={isOpen}
      >
        <div className="min-w-0 flex-1">{header}</div>
        <span
          className={cn(
            'ml-auto inline-flex shrink-0 text-fg-muted transition-transform duration-200',
            isOpen ? 'rotate-180' : 'rotate-0',
          )}
        >
          <ChevronDownIcon />
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-line bg-surface-muted px-3.5 pb-3.5 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}
