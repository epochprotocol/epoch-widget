import { cn } from '../../lib/cn';
import { SparklesIcon } from '../Icons';

interface SmartWithdrawToggleProps {
  enabled: boolean;
  onChange: (next: boolean) => void;
}

export function SmartWithdrawToggle({
  enabled,
  onChange,
}: SmartWithdrawToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md border bg-accent-soft px-3 py-2 text-left transition-[border-color,background-color]',
        enabled ? 'border-primary' : 'border-line',
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canvas text-primary">
        <SparklesIcon width={14} height={14} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold leading-tight text-fg">
          Smart Withdraw
        </span>
        <span className="block text-[11px] leading-tight text-fg-muted">
          Auto-bridge &amp; swap to any chain
        </span>
      </span>
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
          enabled ? 'bg-primary' : 'bg-line-strong',
        )}
        aria-hidden
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-canvas shadow-sm transition-[left]',
            enabled ? 'left-[18px]' : 'left-0.5',
          )}
        />
      </span>
    </button>
  );
}
