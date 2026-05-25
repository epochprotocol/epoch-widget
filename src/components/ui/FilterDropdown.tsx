import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { ChevronDownIcon } from '../Icons';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  /** Solid color used for the radial dot adornment. */
  dotColor?: string;
  /** CSS background override (e.g. gradient for "All …" entries). */
  dotBackground?: string;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: FilterOption[];
  ariaLabel: string;
  /** Visual size of the trigger chip. */
  size?: 'sm' | 'md';
  /** Pixel width of the popup. Defaults to 220. */
  menuWidth?: number;
  /** Max height of the scrollable popup. Defaults to 280. */
  menuMaxHeight?: number;
  /** Anchor edge for the popup. */
  align?: 'start' | 'end';
}

const TRIGGER_BASE =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-canvas font-semibold text-fg shadow-sm transition-[border-color,background-color] duration-150 hover:border-line-strong hover:bg-surface-muted';
const TRIGGER_SIZE: Record<NonNullable<Props['size']>, string> = {
  sm: 'gap-1.5 px-2.5 py-1 text-[11px]',
  md: 'gap-2 px-3 py-1.5 text-[13px]',
};
const DOT_SIZE: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3.5 w-3.5',
};
const ITEM_BASE =
  'flex w-full cursor-pointer items-center justify-between gap-2 rounded-xs border-0 bg-transparent px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-100';

function dotStyle(opt: FilterOption | undefined): React.CSSProperties {
  if (!opt) return {};
  if (opt.dotBackground) return { background: opt.dotBackground };
  const c = opt.dotColor ?? 'var(--epoch-color-primary)';
  return {
    background: `radial-gradient(circle at 30% 30%, ${c}cc 0%, ${c} 60%, ${c}80 100%)`,
  };
}

export function FilterDropdown({
  value,
  onChange,
  options,
  ariaLabel,
  size = 'md',
  menuWidth = 220,
  menuMaxHeight = 280,
  align = 'start',
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const active = useMemo(
    () => options.find((o) => o.value === value) ?? options[0],
    [options, value],
  );

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const anchorClass = align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left';

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(TRIGGER_BASE, TRIGGER_SIZE[size])}
      >
        <span
          className={cn('inline-block shrink-0 rounded-full', DOT_SIZE[size])}
          style={dotStyle(active)}
          aria-hidden
        />
        <span className="truncate">{active?.label}</span>
        <ChevronDownIcon
          className={cn('transition-transform duration-150', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            'absolute top-[calc(100%+6px)] z-20 flex animate-dropdown-in flex-col overflow-hidden rounded-sm border border-line bg-canvas shadow-lg',
            anchorClass,
          )}
          style={{ width: menuWidth, maxHeight: menuMaxHeight }}
        >
          <div className="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-1.5">
            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    ITEM_BASE,
                    selected
                      ? 'bg-accent-soft text-primary'
                      : 'text-fg hover:bg-surface-muted',
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={dotStyle(opt)}
                      aria-hidden
                    />
                    <span className="truncate">{opt.label}</span>
                  </span>
                  {opt.count != null && (
                    <span className="text-[11px] tabular-nums text-fg-muted">
                      {opt.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
