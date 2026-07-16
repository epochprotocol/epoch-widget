import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/cn';
import { ChevronDownIcon, CheckIcon, SearchIcon } from './Icons';

// CSS custom property names the dropdown depends on. We resolve these from the
// trigger's computedStyle and re-apply them to the portalled menu so the menu
// matches whatever theme is active — default, custom, or dark mode. The menu
// renders into `document.body`, outside the modal's `--epoch-*` scope, so the
// Tailwind utilities on it would otherwise fall back to root-level defaults.
const CSS_VARS_TO_MIRROR = [
  '--epoch-color-primary',
  '--epoch-color-primary-hover',
  '--epoch-color-bg',
  '--epoch-color-surface',
  '--epoch-color-border',
  '--epoch-color-text',
  '--epoch-color-text-secondary',
  '--epoch-color-text-muted',
  '--epoch-color-overlay',
  '--epoch-radius-sm',
  '--epoch-radius-lg',
  '--epoch-font',
] as const;

/**
 * Lightweight, dependency-free select replacement.
 *
 * Native `<select>` is inconsistent across platforms and cannot show token
 * logos or rich content, so the widget ships its own dropdown with:
 *   - keyboard nav (↑/↓/Enter/Escape)
 *   - click-outside to close
 *   - optional search filter for long lists
 *   - icon + title + subtitle rows
 *   - theme-aware colours via mirrored CSS variables
 */
export interface DropdownOption {
  value: string;
  label: string;
  sublabel?: string;
  /** Optional leading visual — a token/chain logo, letter avatar, etc. */
  leading?: ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Show a search input above the list (useful for long token lists). */
  searchable?: boolean;
  /** Custom "empty state" text when there are no options. */
  emptyLabel?: string;
  /** ARIA label applied to the trigger. */
  ariaLabel?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  searchable = false,
  emptyLabel = 'No options',
  ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [menuRect, setMenuRect] = useState<{
    top: number;
    left: number;
    width: number;
    placement: 'bottom' | 'top';
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  // Options are navigated with ↑/↓ on the listbox itself (roving tabindex), so
  // each option needs a stable id for aria-activedescendant to point at.
  const optionIdPrefix = useId();
  const optionId = (index: number) => `${optionIdPrefix}-opt-${index}`;

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = query
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          (o.sublabel ?? '').toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setMenuRect(null);
      return;
    }
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const estimatedMenuHeight = 240 + 6;
      const placement: 'bottom' | 'top' =
        spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';
      setMenuRect({
        top: placement === 'bottom' ? rect.bottom + 6 : rect.top - 6,
        left: rect.left,
        width: rect.width,
        placement,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  // Opening seeds the highlight to the current selection and clears any stale
  // search. Done here, at the point the menu is opened, so the three setters
  // batch into one render — and so a mid-interaction `options`/`value` change
  // no longer resets the user's highlight and query underneath them.
  const openMenu = () => {
    const idx = options.findIndex((o) => o.value === value);
    setHighlight(idx >= 0 ? idx : 0);
    setQuery('');
    setOpen(true);
    if (searchable) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  };

  const commit = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenu();
    }
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) commit(opt.value);
    }
  };

  // Mirror the trigger's resolved CSS variables onto the portalled menu so the
  // Tailwind utilities on it resolve the same colours.
  const menuCssVars: CSSProperties = (() => {
    if (typeof window === 'undefined' || !triggerRef.current) return {};
    const computed = window.getComputedStyle(triggerRef.current);
    const out: Record<string, string> = {};
    for (const name of CSS_VARS_TO_MIRROR) {
      const value = computed.getPropertyValue(name);
      if (value) out[name] = value.trim();
    }
    return out as CSSProperties;
  })();

  // Portal into the containing <dialog> when there is one: a modal opened with
  // showModal() sits in the browser top layer, above any body-level portal
  // regardless of z-index, so a menu portalled to document.body would render
  // behind it. The dialog fills the viewport (inset-0), so the menu's fixed
  // positioning still resolves to the same coordinates. Falls back to body for
  // inline (non-modal) rendering.
  const portalTarget =
    (typeof document !== 'undefined' &&
      containerRef.current?.closest('dialog')) ||
    (typeof document !== 'undefined' ? document.body : null);

  const menuPositionStyle: CSSProperties = {
    top: menuRect?.top ?? 0,
    left: menuRect?.left ?? 0,
    width: menuRect?.width ?? 0,
    transform: menuRect?.placement === 'top' ? 'translateY(-100%)' : undefined,
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => !disabled && (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKey}
        className={cn(
          'box-border flex w-full items-center justify-between gap-2.5 rounded-sm border bg-canvas px-3.5 py-3 text-sm text-fg transition-[border-color,box-shadow] duration-150',
          open ? 'border-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--epoch-color-primary)_20%,transparent)]' : 'border-line shadow-none',
          disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer',
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          {selected?.leading}
          <span className="flex min-w-0 flex-col leading-tight">
            <span
              className={cn(
                'overflow-hidden text-ellipsis whitespace-nowrap',
                selected ? 'font-semibold text-fg' : 'font-normal text-fg-muted',
              )}
            >
              {selected?.label ?? placeholder}
            </span>
            {selected?.sublabel && (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-fg-muted">
                {selected.sublabel}
              </span>
            )}
          </span>
        </span>
        <span
          className={cn(
            'flex text-fg-muted transition-transform duration-150',
            open ? 'rotate-180' : 'rotate-0',
          )}
        >
          <ChevronDownIcon />
        </span>
      </button>

      {open &&
        menuRect &&
        portalTarget &&
        createPortal(
          <div
            ref={menuRef}
            style={{ ...menuCssVars, ...menuPositionStyle }}
            role="listbox"
            onKeyDown={onListKey}
            tabIndex={-1}
            aria-activedescendant={
              filtered[highlight] ? optionId(highlight) : undefined
            }
            className="fixed z-[10000] flex max-h-60 flex-col overflow-hidden rounded-sm border border-line bg-canvas font-sans shadow-[0_16px_40px_-8px_rgba(15,23,42,0.22),0_0_0_1px_rgba(15,23,42,0.04)] animate-dropdown-in"
          >
            {searchable && (
              <div className="flex items-center gap-2 border-b border-line px-3 py-2.5 text-fg-muted">
                <SearchIcon />
                <input
                  ref={searchRef}
                  className="flex-1 border-0 bg-transparent p-0 text-[13px] text-fg outline-none"
                  placeholder="Search…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlight(0);
                  }}
                  onKeyDown={onListKey}
                />
              </div>
            )}
            <div className="flex-1 overflow-x-hidden overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <div className="p-3 text-center text-[13px] text-fg-muted">{emptyLabel}</div>
              ) : (
                filtered.map((opt, i) => {
                  const isSelected = opt.value === value;
                  const isHighlight = i === highlight;
                  return (
                    <div
                      key={opt.value}
                      id={optionId(i)}
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={-1}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => commit(opt.value)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between gap-2.5 rounded-md px-2.5 py-2 transition-colors duration-100',
                        isHighlight ? 'bg-surface' : 'bg-transparent',
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        {opt.leading}
                        <div className="min-w-0 leading-tight">
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-fg">
                            {opt.label}
                          </div>
                          {opt.sublabel && (
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-fg-muted">
                              {opt.sublabel}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="flex shrink-0 text-primary">
                          <CheckIcon />
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          portalTarget,
        )}
    </div>
  );
}
