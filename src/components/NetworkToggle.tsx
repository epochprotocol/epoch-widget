import type { CSSProperties } from 'react';
import { t } from '../theme';

interface NetworkToggleProps {
  isTestnet: boolean;
  onChange: (isTestnet: boolean) => void;
}

/**
 * Compact segmented control for flipping between mainnet and testnet. Designed
 * to live in the modal header — the selected segment fills with the primary
 * colour while the idle segment stays muted, following standard settings-pill
 * conventions.
 */
export function NetworkToggle({ isTestnet, onChange }: NetworkToggleProps) {
  const trackStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px',
    borderRadius: '999px',
    backgroundColor: t.surface,
    border: `1px solid ${t.border}`,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.01em',
    lineHeight: 1,
    userSelect: 'none',
  };

  const segment = (active: boolean): CSSProperties => ({
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px 10px',
    borderRadius: '999px',
    cursor: active ? 'default' : 'pointer',
    color: active ? '#ffffff' : t.textMuted,
    backgroundColor: active ? t.primary : 'transparent',
    boxShadow: active ? '0 1px 2px rgba(15, 23, 42, 0.12)' : 'none',
    transition: 'background-color 0.15s, color 0.15s, box-shadow 0.15s',
    whiteSpace: 'nowrap',
  });

  return (
    <div
      role="tablist"
      aria-label="Network"
      style={trackStyle}
    >
      <button
        type="button"
        role="tab"
        aria-selected={!isTestnet}
        tabIndex={!isTestnet ? 0 : -1}
        onClick={() => isTestnet && onChange(false)}
        style={segment(!isTestnet)}
      >
        Mainnet
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={isTestnet}
        tabIndex={isTestnet ? 0 : -1}
        onClick={() => !isTestnet && onChange(true)}
        style={segment(isTestnet)}
      >
        Testnet
      </button>
    </div>
  );
}
