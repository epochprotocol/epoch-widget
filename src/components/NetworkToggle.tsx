import type { CSSProperties } from 'react';
import { t } from '../theme';

interface NetworkToggleProps {
  isTestnet: boolean;
  onChange: (isTestnet: boolean) => void;
}

const TRACK_W = 38;
const TRACK_H = 22;
const THUMB = 18;
const PAD = 2;

export function NetworkToggle({ isTestnet, onChange }: NetworkToggleProps) {
  const trackStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: `${TRACK_W}px`,
    height: `${TRACK_H}px`,
    backgroundColor: isTestnet ? t.primary : '#d1d5db',
    borderRadius: '999px',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
    flexShrink: 0,
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)',
  };

  const thumbStyle: CSSProperties = {
    position: 'absolute',
    top: `${PAD}px`,
    left: isTestnet ? `${TRACK_W - THUMB - PAD}px` : `${PAD}px`,
    width: `${THUMB}px`,
    height: `${THUMB}px`,
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
  };

  const labelBase: CSSProperties = {
    fontSize: '12px',
    fontWeight: 500,
    transition: 'color 0.15s ease',
    userSelect: 'none',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '4px' }}>
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
        }}
      >
        <span style={{ ...labelBase, color: isTestnet ? t.textMuted : t.text }}>
          Mainnet
        </span>
        <input
          type="checkbox"
          checked={isTestnet}
          onChange={(e) => onChange(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
        />
        <div style={trackStyle}>
          <div style={thumbStyle} />
        </div>
        <span style={{ ...labelBase, color: isTestnet ? t.text : t.textMuted }}>
          Testnet
        </span>
      </label>
    </div>
  );
}
