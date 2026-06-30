import { cn } from '../lib/cn';
import { SparklesIcon } from './Icons';

interface GaslessEnableButtonProps {
  gasless: boolean;
  onEnable: () => void;
  onDisable: () => void;
  disabledReason?: string | null;
  needsEpochSetup?: boolean;
  onSwitchSmartAccount?: () => void;
  setupBusy?: boolean;
  setupError?: string | null;
  checking?: boolean;
  className?: string;
}

/**
 * Gasless opt-in + Epoch smart-account setup (sign only — relay pays gas).
 */
export function GaslessEnableButton({
  gasless,
  onEnable,
  onDisable,
  disabledReason,
  needsEpochSetup = false,
  onSwitchSmartAccount,
  setupBusy = false,
  setupError,
  checking = false,
  className,
}: GaslessEnableButtonProps) {
  const blocked = !!disabledReason;
  const busy = setupBusy || checking;

  if (gasless) {
    return (
      <div
        className={cn(
          'flex flex-col gap-2 rounded-sm border border-success/35 bg-success-soft px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between',
          className,
        )}
      >
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-success">Gasless enabled</p>
          <p className="mt-0.5 text-[12px] leading-snug text-fg-secondary">
            Epoch smart account active — you only sign, we sponsor Compact deposit gas.
          </p>
        </div>
        <button
          type="button"
          onClick={onDisable}
          className="shrink-0 cursor-pointer rounded-sm border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-fg-secondary transition-colors hover:bg-surface-muted hover:text-fg"
        >
          Use standard
        </button>
      </div>
    );
  }

  const showSwitch =
    needsEpochSetup && !blocked && typeof onSwitchSmartAccount === 'function';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {showSwitch ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => !busy && onSwitchSmartAccount()}
          className={cn(
            'flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-primary/35 bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-opacity hover:bg-primary-hover',
            busy && 'cursor-not-allowed opacity-60',
          )}
        >
          {busy ? (
            <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin-epoch rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <SparklesIcon width={16} height={16} className="shrink-0" />
          )}
          {busy ? 'Switching smart account…' : 'Switch to Epoch smart account'}
        </button>
      ) : (
        <button
          type="button"
          disabled={blocked || busy}
          title={blocked ? disabledReason : undefined}
          onClick={() => !blocked && !busy && onEnable()}
          className={cn(
            'flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-primary/35 bg-accent-soft px-4 py-2.5 text-[13px] font-semibold text-primary shadow-sm transition-[background-color,border-color,opacity] hover:bg-primary/10',
            (blocked || busy) && 'cursor-not-allowed opacity-50 hover:bg-accent-soft',
          )}
        >
          <SparklesIcon width={16} height={16} className="shrink-0" />
          Enable gasless deposits
        </button>
      )}

      {setupError ? (
        <p className="text-center text-[11px] leading-snug text-error">{setupError}</p>
      ) : blocked && disabledReason ? (
        <p className="text-center text-[11px] leading-snug text-fg-muted">{disabledReason}</p>
      ) : showSwitch ? (
        <p className="text-center text-[11px] leading-snug text-fg-muted">
          Sign the 7702 authorization — Epoch relays setup gas, then gasless deposits unlock.
        </p>
      ) : (
        <p className="text-center text-[11px] leading-snug text-fg-muted">
          Sign only — no gas for Compact approve + deposit.
        </p>
      )}
    </div>
  );
}
