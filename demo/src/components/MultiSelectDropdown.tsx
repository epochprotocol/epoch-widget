import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface Props {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  emptyLabel?: string;
}

export function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select…',
  emptyLabel = 'All',
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonId = useId();

  const [query, setQuery] = useState('');

  // Closing always clears the search so the next open is clean. Both setters
  // fire together here rather than letting an effect react to `open`, so React
  // batches them into a single render.
  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (query) setQuery('');
        else close();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, query, close]);

  const filteredOptions =
    query.trim().length === 0
      ? options
      : options.filter((o) => {
          const q = query.toLowerCase();
          return (
            o.label.toLowerCase().includes(q) ||
            o.value.toLowerCase().includes(q)
          );
        });

  // Membership is tested once per option while rendering the list, so a Set
  // keeps each check O(1) instead of rescanning `selected` every row.
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (value: string) => {
    const next = selectedSet.has(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  const summary =
    selected.length === 0
      ? emptyLabel
      : selected.length === options.length
        ? `All (${selected.length})`
        : selected.length <= 2
          ? options
              .flatMap((o) => (selectedSet.has(o.value) ? [o.label] : []))
              .join(', ')
          : `${selected.length} selected`;

  return (
    <div className="flex flex-col gap-1.5" ref={wrapRef}>
      <label
        htmlFor={buttonId}
        className="text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted"
      >
        {label}
      </label>
      <div className="relative">
        <button
          id={buttonId}
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex w-full min-w-[180px] cursor-pointer items-center justify-between gap-2 rounded-md border border-line bg-canvas px-3 py-2 text-left text-sm text-fg transition-colors hover:border-line-strong"
        >
          <span className={selected.length === 0 ? 'text-fg-muted' : ''}>
            {selected.length === 0 ? placeholder : summary}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden
          >
            <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div
            role="listbox"
            aria-multiselectable
            className="absolute left-0 top-[calc(100%+4px)] z-20 flex max-h-80 w-full min-w-[260px] flex-col rounded-md border border-line bg-surface shadow-lg"
          >
            <div className="border-b border-line p-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                autoFocus
                aria-label="Filter options"
                className="w-full rounded border border-line bg-canvas px-2 py-1.5 text-sm text-fg placeholder:text-fg-muted focus:border-line-strong focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 text-[11px] text-fg-muted">
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-semibold uppercase tracking-[0.05em] text-primary hover:underline"
                onClick={() =>
                  onChange(
                    Array.from(
                      new Set([...selected, ...filteredOptions.map((o) => o.value)]),
                    ),
                  )
                }
              >
                {query ? 'Select shown' : 'Select all'}
              </button>
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-semibold uppercase tracking-[0.05em] text-fg-muted hover:underline"
                onClick={() => onChange([])}
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-2 py-3 text-center text-[12px] text-fg-muted">
                  No matches for &ldquo;{query}&rdquo;
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const checked = selectedSet.has(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-fg hover:bg-surface-muted"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(opt.value)}
                        className="h-4 w-4 cursor-pointer accent-primary"
                      />
                      <span className="flex-1">{opt.label}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
