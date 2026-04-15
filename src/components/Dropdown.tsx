import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { t } from '../theme';
import { ChevronDownIcon, CheckIcon, SearchIcon } from './Icons';

// CSS custom property names the dropdown depends on. We resolve these from
// the trigger's computedStyle and re-apply them to the portalled menu so the
// menu matches whatever theme is active — default, custom, or dark-mode.
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

// ---------------------------------------------------------------------------
// Dropdown
//
// A lightweight, dependency-free select replacement. Native <select> is
// inconsistent across platforms and cannot show token logos or rich content,
// so the widget ships its own dropdown with:
//   - keyboard nav (↑/↓/Enter/Escape)
//   - click-outside to close
//   - optional search filter for long lists
//   - icon + title + subtitle rows
//   - theme-aware colours via CSS variables
// ---------------------------------------------------------------------------

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

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = query
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          (o.sublabel ?? '').toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  // Click-outside & ESC to close. The menu is portalled to <body>, so we need
  // to treat both the trigger and the menu as "inside" the dropdown.
  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
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

  // Track trigger position so the portalled menu stays anchored to it as the
  // page scrolls or resizes. We flip the menu above the trigger when there
  // isn't enough room below.
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
      const estimatedMenuHeight = 240 + 6; // maxHeight + gap
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

  // Reset highlight / focus search when the list opens.
  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setHighlight(idx >= 0 ? idx : 0);
      setQuery('');
      if (searchable) {
        // Focus on next frame so the input is mounted.
        requestAnimationFrame(() => searchRef.current?.focus());
      }
    }
  }, [open, options, value, searchable]);

  const commit = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
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

  // ---- Styles ------------------------------------------------------------

  const triggerStyle: React.CSSProperties = {
    all: 'unset',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.625rem',
    width: '100%',
    padding: '0.75rem 0.875rem',
    border: `1px solid ${open ? t.primary : t.border}`,
    borderRadius: t.radiusSm,
    backgroundColor: t.bg,
    fontSize: '0.875rem',
    color: t.text,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: open ? `0 0 0 3px ${t.primary}20` : 'none',
    opacity: disabled ? 0.55 : 1,
  };

  // Inherit CSS variables from the modal root via a data attribute, then pin
  // the menu with `position: fixed` so it escapes any `overflow: hidden` or
  // `overflow: auto` ancestors (like the modal's scroll area).
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: menuRect?.top ?? 0,
    left: menuRect?.left ?? 0,
    width: menuRect?.width ?? 0,
    transform: menuRect?.placement === 'top' ? 'translateY(-100%)' : undefined,
    zIndex: 10000,
    backgroundColor: t.bg,
    border: `1px solid ${t.border}`,
    borderRadius: t.radiusSm,
    boxShadow:
      '0 16px 40px -8px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(15, 23, 42, 0.04)',
    maxHeight: '15rem',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    animation: 'epoch-dropdown-in 0.12s ease-out',
    fontFamily: t.font,
  };

  const listStyle: React.CSSProperties = {
    overflowY: 'auto',
    padding: '0.25rem',
    flex: 1,
  };

  const searchBoxStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 0.75rem',
    borderBottom: `1px solid ${t.border}`,
    color: t.textMuted,
  };

  const searchInputStyle: React.CSSProperties = {
    all: 'unset',
    flex: 1,
    fontSize: '0.8125rem',
    color: t.text,
    fontFamily: 'inherit',
  };

  // The portal target (document.body) sits outside the modal's CSS-variable
  // scope, so copy the trigger's resolved vars onto the menu root. This keeps
  // the menu visually identical to the modal regardless of which theme the
  // consumer passed — custom, default, or any future dark mode.
  const menuCssVars: CSSProperties = (() => {
    if (!triggerRef.current) return {};
    const computed = window.getComputedStyle(triggerRef.current);
    const out: Record<string, string> = {};
    for (const name of CSS_VARS_TO_MIRROR) {
      const value = computed.getPropertyValue(name);
      if (value) out[name] = value.trim();
    }
    return out as CSSProperties;
  })();

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        ref={triggerRef}
        type="button"
        style={triggerStyle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            minWidth: 0,
            flex: 1,
          }}
        >
          {selected?.leading}
          <span
            style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              lineHeight: 1.25,
            }}
          >
            <span
              style={{
                fontWeight: selected ? 600 : 400,
                color: selected ? t.text : t.textMuted,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {selected?.label ?? placeholder}
            </span>
            {selected?.sublabel && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: t.textMuted,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {selected.sublabel}
              </span>
            )}
          </span>
        </span>
        <span
          style={{
            color: t.textMuted,
            display: 'flex',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}
        >
          <ChevronDownIcon />
        </span>
      </button>

      {open &&
        menuRect &&
        createPortal(
        <div
          ref={menuRef}
          style={{ ...menuCssVars, ...menuStyle }}
          role="listbox"
          onKeyDown={onListKey}
          tabIndex={-1}
        >
          {searchable && (
            <div style={searchBoxStyle}>
              <SearchIcon />
              <input
                ref={searchRef}
                style={searchInputStyle}
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
          <div style={listStyle}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: '1rem 0.75rem',
                  textAlign: 'center',
                  fontSize: '0.8125rem',
                  color: t.textMuted,
                }}
              >
                {emptyLabel}
              </div>
            ) : (
              filtered.map((opt, i) => {
                const isSelected = opt.value === value;
                const isHighlight = i === highlight;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => commit(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.625rem',
                      padding: '0.5rem 0.625rem',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      backgroundColor: isHighlight
                        ? t.surface
                        : 'transparent',
                      transition: 'background-color 0.1s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        minWidth: 0,
                      }}
                    >
                      {opt.leading}
                      <div style={{ minWidth: 0, lineHeight: 1.25 }}>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: t.text,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {opt.label}
                        </div>
                        {opt.sublabel && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: t.textMuted,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {opt.sublabel}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <span
                        style={{
                          color: t.primary,
                          display: 'flex',
                          flexShrink: 0,
                        }}
                      >
                        <CheckIcon />
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
