import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { SearchIcon } from '../Icons';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  trailing?: ReactNode;
  style?: CSSProperties;
  ariaLabel?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  autoFocus,
  trailing,
  style,
  ariaLabel,
}: Props) {
  return (
    <div className="relative w-full" style={style}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted">
        <SearchIcon />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={ariaLabel ?? placeholder}
        className={cn(
          'box-border w-full rounded-sm border-[1.5px] border-line bg-canvas py-3 pl-10 text-sm text-fg shadow-sm outline-none transition-[border-color,box-shadow] duration-150',
          'focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--epoch-color-primary)_22%,transparent)]',
          trailing ? 'pr-[70px]' : 'pr-3.5',
        )}
      />
      {trailing && (
        <span className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {trailing}
        </span>
      )}
    </div>
  );
}
