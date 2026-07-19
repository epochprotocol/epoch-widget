import { cn } from '../lib/cn';

interface NetworkToggleProps {
  isTestnet: boolean;
  onChange: (isTestnet: boolean) => void;
}

const SEGMENT_BASE =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full border-0 px-2.5 py-1.25 transition-[background-color,color,box-shadow] duration-150';

/**
 * Compact segmented control for flipping between mainnet and testnet. Designed
 * to live in the modal header — the selected segment fills with the primary
 * colour while the idle segment stays muted, following standard settings-pill
 * conventions.
 */
const segmentClasses = (active: boolean) =>
  cn(
    SEGMENT_BASE,
    active
      ? 'cursor-default bg-primary text-white shadow-[0_1px_2px_rgba(15,23,42,0.12)]'
      : 'cursor-pointer bg-transparent text-fg-muted',
  );

export function NetworkToggle({ isTestnet, onChange }: NetworkToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Network"
      className="inline-flex select-none items-center rounded-full border border-line bg-surface p-0.75 text-[11px] font-semibold leading-none tracking-[0.01em]"
    >
      <button
        type="button"
        role="tab"
        aria-selected={!isTestnet}
        tabIndex={!isTestnet ? 0 : -1}
        onClick={() => isTestnet && onChange(false)}
        className={segmentClasses(!isTestnet)}
      >
        Mainnet
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={isTestnet}
        tabIndex={isTestnet ? 0 : -1}
        onClick={() => !isTestnet && onChange(true)}
        className={segmentClasses(isTestnet)}
      >
        Testnet
      </button>
    </div>
  );
}
