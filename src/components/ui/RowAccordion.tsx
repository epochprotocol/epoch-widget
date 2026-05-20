import { useState, type CSSProperties, type ReactNode } from 'react';
import { t } from '../../theme';
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

export function RowAccordion({ header, children, defaultOpen = false, open, onOpenChange, style }: Props) {
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = open ?? internal;
  const toggle = () => {
    const next = !isOpen;
    if (onOpenChange) onOpenChange(next);
    if (open === undefined) setInternal(next);
  };

  const root: CSSProperties = {
    borderRadius: t.radiusMd,
    border: `1px solid ${isOpen ? t.borderStrong : t.border}`,
    backgroundColor: t.bg,
    overflow: 'hidden',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    boxShadow: isOpen ? t.shadowMd : 'none',
    ...style,
  };

  const headerStyle: CSSProperties = {
    all: 'unset',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px 14px',
    boxSizing: 'border-box',
    gap: '12px',
  };

  const chevronStyle: CSSProperties = {
    transition: 'transform 0.18s ease',
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    color: t.textMuted,
    flexShrink: 0,
    marginLeft: 'auto',
    display: 'inline-flex',
  };

  return (
    <div style={root}>
      <button type="button" style={headerStyle} onClick={toggle} aria-expanded={isOpen}>
        <div style={{ flex: 1, minWidth: 0 }}>{header}</div>
        <span style={chevronStyle}>
          <ChevronDownIcon />
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            padding: '4px 14px 14px',
            borderTop: `1px solid ${t.border}`,
            backgroundColor: t.surfaceMuted,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
