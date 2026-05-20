import { useState, type CSSProperties, type ReactNode } from 'react';
import { t } from '../../theme';
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

export function SearchInput({ value, onChange, placeholder, autoFocus, trailing, style, ariaLabel }: Props) {
  const [focused, setFocused] = useState(false);
  const wrap: CSSProperties = {
    position: 'relative',
    width: '100%',
    ...style,
  };
  const input: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px 12px 40px',
    paddingRight: trailing ? '70px' : '14px',
    borderRadius: t.radiusSm,
    border: `1.5px solid ${focused ? t.primary : t.border}`,
    boxShadow: focused
      ? `0 0 0 3px color-mix(in srgb, ${t.primary} 22%, transparent)`
      : t.shadowSm,
    fontSize: '14px',
    fontFamily: 'inherit',
    color: t.text,
    backgroundColor: t.bg,
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };
  const iconWrap: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '14px',
    transform: 'translateY(-50%)',
    color: t.textMuted,
    pointerEvents: 'none',
  };
  const trailingWrap: CSSProperties = {
    position: 'absolute',
    top: '50%',
    right: '10px',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };
  return (
    <div style={wrap}>
      <span style={iconWrap}>
        <SearchIcon />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={ariaLabel ?? placeholder}
        style={input}
      />
      {trailing && <span style={trailingWrap}>{trailing}</span>}
    </div>
  );
}
