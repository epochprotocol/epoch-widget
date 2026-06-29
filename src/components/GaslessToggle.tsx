import { cn } from '../lib/cn';

interface GaslessToggleProps {
  gasless: boolean;
  onChange: (gasless: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
}

const SEGMENT_BASE =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full border-0 px-2.5 py-1.25 transition-[background-color,color,box-shadow] duration-150';

/**
 * Segmented control for gasless vs standard (user-paid) Compact deposits.
 */
export function GaslessToggle({
  gasless,
  onChange,
  disabled = false,
  disabledReason,
}: GaslessToggleProps) {
  const segmentClasses = (active: boolean) =>
    cn(
      SEGMENT_BASE,
      disabled && 'opacity-50',
      active
        ? 'cursor-default bg-primary text-white shadow-[0_1px_2px_rgba(15,23,42,0.12)]'
        : 'cursor-pointer bg-transparent text-fg-muted',
    );

  return (
    <div
      role="tablist"
      aria-label="Deposit mode"
      title={disabled ? disabledReason : undefined}
      className="inline-flex select-none items-center rounded-full border border-line bg-surface p-0.75 text-[11px] font-semibold leading-none tracking-[0.01em]"
    >
      <button
        type="button"
        role="tab"
        aria-selected={gasless}
        tabIndex={gasless ? 0 : -1}
        disabled={disabled}
        onClick={() => !gasless && !disabled && onChange(true)}
        className={segmentClasses(gasless)}
      >
        Gasless
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={!gasless}
        tabIndex={!gasless ? 0 : -1}
        disabled={disabled}
        onClick={() => gasless && !disabled && onChange(false)}
        className={segmentClasses(!gasless)}
      >
        Standard
      </button>
    </div>
  );
}
