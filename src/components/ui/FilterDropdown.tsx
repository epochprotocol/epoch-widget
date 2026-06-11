import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { ChevronDownIcon, SparklesIcon } from '../Icons';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  /** Solid color used for the radial dot adornment. */
  dotColor?: string;
  /** CSS background override (e.g. gradient for "All …" entries). */
  dotBackground?: string;
  /** When true, the option is rendered in a highlighted "featured" row with
   *  a Sparkles glyph and bolder typography. Use to surface curated picks. */
  featured?: boolean;
  /** Per-option leading slot. Replaces the color dot when provided. */
  leading?: ReactNode;
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
  /**
   * `filter` (default) — pill trigger with dot adornment.
   * `sort` — pill trigger with a leading glyph slot, signals "ordering" not
   * "narrowing". Items inside the menu can opt into directional glyphs.
   */
  variant?: 'filter' | 'sort';
  /** Custom leading element for the trigger. Overrides the default dot. */
  leadingIcon?: ReactNode;
  /**
   * When true, the first option in `options` is treated as the "no selection"
   * default. The trigger renders in a muted dashed state until the user picks
   * a non-default value. Reduces visual noise from "All chains"-style chips
   * when they're not actively filtering anything.
   */
  defaultMuted?: boolean;
}

const TRIGGER_BASE =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border font-semibold shadow-sm transition-[border-color,background-color,color] duration-150';
const TRIGGER_ACTIVE =
  'border-line bg-canvas text-fg hover:border-line-strong hover:bg-surface-muted';
const TRIGGER_MUTED =
  'border-dashed border-line bg-transparent text-fg-muted hover:border-line-strong hover:bg-surface-muted hover:text-fg';
const TRIGGER_SIZE: Record<NonNullable<Props['size']>, string> = {
  sm: 'gap-1.5 px-2.5 py-1 text-[11px]',
  md: 'gap-2 px-3 py-1.5 text-[13px]',
};
const DOT_SIZE: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3.5 w-3.5',
};
const ITEM_BASE =
  'flex w-full cursor-pointer items-center justify-between gap-2 rounded-xs border-0 bg-transparent px-2.5 py-2 text-left text-[13px] transition-colors duration-100';

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
  variant = 'filter',
  leadingIcon,
  defaultMuted = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const active = useMemo(
    () => options.find((o) => o.value === value) ?? options[0],
    [options, value],
  );
  const isDefault = defaultMuted && options.length > 0 && options[0].value === value;

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

  // Group rendering: featured options first, then a divider, then the rest.
  // Stable so we don't reorder on every render.
  const { featured, secondary } = useMemo(() => {
    const f: FilterOption[] = [];
    const s: FilterOption[] = [];
    for (const o of options) (o.featured ? f : s).push(o);
    return { featured: f, secondary: s };
  }, [options]);
  const useGroups = featured.length > 0 && secondary.length > 0;

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          TRIGGER_BASE,
          isDefault ? TRIGGER_MUTED : TRIGGER_ACTIVE,
          TRIGGER_SIZE[size],
        )}
      >
        {leadingIcon !== undefined ? (
          <span className="inline-flex shrink-0 items-center" aria-hidden>
            {leadingIcon}
          </span>
        ) : variant === 'filter' && !isDefault ? (
          <span
            className={cn('inline-block shrink-0 rounded-full', DOT_SIZE[size])}
            style={dotStyle(active)}
            aria-hidden
          />
        ) : null}
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
            {(useGroups ? featured : options).map((opt) =>
              renderItem(opt, value, onChange, setOpen),
            )}
            {useGroups && (
              <>
                <div className="mx-1 my-1 h-px bg-line" />
                <div className="px-2.5 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
                  More
                </div>
                {secondary.map((opt) => renderItem(opt, value, onChange, setOpen))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function renderItem(
  opt: FilterOption,
  value: string,
  onChange: (v: string) => void,
  setOpen: (v: boolean) => void,
) {
  const selected = opt.value === value;
  return (
    <button
      key={opt.value}
      type="button"
      role="option"
      aria-selected={selected}
      className={cn(
        ITEM_BASE,
        opt.featured ? 'font-semibold' : 'font-medium',
        selected
          ? 'bg-accent-soft text-primary'
          : opt.featured
            ? 'text-fg hover:bg-surface-muted'
            : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
      )}
      onClick={() => {
        onChange(opt.value);
        setOpen(false);
      }}
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        {opt.leading !== undefined ? (
          <span className="inline-flex shrink-0 items-center" aria-hidden>
            {opt.leading}
          </span>
        ) : opt.featured ? (
          <span className="inline-flex shrink-0 items-center text-primary" aria-hidden>
            <SparklesIcon />
          </span>
        ) : (
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={dotStyle(opt)}
            aria-hidden
          />
        )}
        <span className="truncate">{opt.label}</span>
      </span>
      {opt.count != null && (
        <span className="text-[11px] tabular-nums text-fg-muted">{opt.count}</span>
      )}
    </button>
  );
}
