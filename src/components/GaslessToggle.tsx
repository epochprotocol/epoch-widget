import { cn } from '../lib/cn';

interface GaslessToggleProps {
  gasless: boolean;
  onChange: (gasless: boolean) => void;
  /** When set, only the Gasless segment is disabled (Standard stays clickable). */
  gaslessDisabled?: boolean;
  gaslessDisabledReason?: string;
}

const SEGMENT_BASE =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full border-0 px-2.5 py-1.25 transition-[background-color,color,box-shadow] duration-150';

/**
 * Segmented control for gasless vs standard (user-paid) Compact deposits.
 */
export function GaslessToggle({
  gasless,
  onChange,
  gaslessDisabled = false,
  gaslessDisabledReason,
}: GaslessToggleProps) {
  const segmentClasses = (active: boolean, segmentDisabled?: boolean) =>
    cn(
      SEGMENT_BASE,
      segmentDisabled && 'opacity-50 cursor-not-allowed',
      active
        ? 'cursor-default bg-primary text-white shadow-[0_1px_2px_rgba(15,23,42,0.12)]'
        : !segmentDisabled && 'cursor-pointer bg-transparent text-fg-muted',
      !active && segmentDisabled && 'cursor-not-allowed',
    );

  return (
    <div
      role="tablist"
      aria-label="Deposit mode"
      className="inline-flex select-none items-center rounded-full border border-line bg-surface p-0.75 text-[11px] font-semibold leading-none tracking-[0.01em]"
    >
      <button
        type="button"
        role="tab"
        aria-selected={gasless}
        tabIndex={gasless ? 0 : -1}
        disabled={gaslessDisabled}
        title={gaslessDisabled ? gaslessDisabledReason : undefined}
        onClick={() => !gasless && !gaslessDisabled && onChange(true)}
        className={segmentClasses(gasless, gaslessDisabled)}
      >
        Gasless
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={!gasless}
        tabIndex={!gasless ? 0 : -1}
        onClick={() => gasless && onChange(false)}
        className={segmentClasses(!gasless)}
      >
        Standard
      </button>
    </div>
  );
}
