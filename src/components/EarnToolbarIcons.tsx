import type { CSSProperties } from 'react';
import { t } from '../theme';
import { HistoryToolbarIcon, SettingsToolbarIcon, SwapToolbarIcon } from './Icons';

const iconSlot: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '34px',
  height: '34px',
  borderRadius: '10px',
  color: t.textMuted,
};

const swapLabel: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  height: '34px',
  padding: '0 10px',
  borderRadius: '10px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: t.textSecondary,
};

/**
 * Decorative header actions for Earn mode (visual parity with common earn UIs).
 * Inert — for interactive behavior, extend the host layout or use `classNames`.
 */
export function EarnToolbarIcons() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} aria-hidden="true">
      <span title="Swap" style={swapLabel}>
        <SwapToolbarIcon width={15} height={15} />
        Swap
      </span>
      <span title="Activity" style={iconSlot}>
        <HistoryToolbarIcon />
      </span>
      <span title="Settings" style={iconSlot}>
        <SettingsToolbarIcon />
      </span>
    </div>
  );
}
