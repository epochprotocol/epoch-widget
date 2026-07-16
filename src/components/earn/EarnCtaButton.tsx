import { RetryIcon } from '../Icons';
import { ActionButton } from '../ui/ActionButton';

interface EarnCtaButtonProps {
  label: string;
  /** Tailwind classes for the tone (primary / warning / …). */
  toneClasses: string;
  enabled: boolean;
  busy: boolean;
  /** Show the retry glyph — the previous quote failed. */
  showRetryIcon?: boolean;
  onClick: () => void;
  /** Consumer override for the button element. */
  buttonClassName?: string;
  /** Rendered under the button when the flow has something to say. */
  error?: string | null;
}

/** The Earn footer: the shared CTA plus the inline error that belongs to it. */
export function EarnCtaButton({
  label,
  toneClasses,
  enabled,
  busy,
  showRetryIcon = false,
  onClick,
  buttonClassName,
  error,
}: EarnCtaButtonProps) {
  return (
    <div className="flex flex-col gap-2">
      <ActionButton
        label={label}
        toneClasses={toneClasses}
        busy={busy}
        disabled={!enabled}
        leadingIcon={showRetryIcon ? <RetryIcon /> : undefined}
        onClick={onClick}
        className={buttonClassName}
      />
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-sm border border-error/40 bg-error-soft px-2.5 py-1.5 text-[12px] leading-snug text-error"
        >
          <span
            className="mt-[3px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-error"
            aria-hidden
          />
          <span className="min-w-0 flex-1 break-words">{error}</span>
        </div>
      )}
    </div>
  );
}
