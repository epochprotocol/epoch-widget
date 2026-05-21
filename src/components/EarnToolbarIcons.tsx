import { HistoryToolbarIcon, SettingsToolbarIcon, SwapToolbarIcon } from './Icons';

const ICON_SLOT =
  'flex h-8.5 w-8.5 items-center justify-center rounded-[10px] text-fg-muted';

const SWAP_LABEL =
  'inline-flex h-8.5 items-center gap-1.25 rounded-[10px] px-2.5 text-[11px] font-bold tracking-[0.02em] text-fg-secondary';

/**
 * Decorative header actions for Earn mode (visual parity with common earn UIs).
 * Inert — for interactive behavior, extend the host layout or use `classNames`.
 */
export function EarnToolbarIcons() {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      <span title="Swap" className={SWAP_LABEL}>
        <SwapToolbarIcon width={15} height={15} />
        Swap
      </span>
      <span title="Activity" className={ICON_SLOT}>
        <HistoryToolbarIcon />
      </span>
      <span title="Settings" className={ICON_SLOT}>
        <SettingsToolbarIcon />
      </span>
    </div>
  );
}
