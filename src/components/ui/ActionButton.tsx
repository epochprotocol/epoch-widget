import type { ReactNode } from 'react';
import { cn as twcn } from '../../lib/cn';

interface ActionButtonProps {
  label: string;
  /** Tone utilities for the filled background (primary / warning / success). */
  toneClasses: string;
  /** Blocks the click on its own — a busy button is never clickable. */
  busy: boolean;
  /** Blocks the click for non-busy reasons (nothing selected, wrong network…). */
  disabled?: boolean;
  /** Shown before the label when not busy; the spinner takes over when busy. */
  leadingIcon?: ReactNode;
  onClick: () => void;
  /** Consumer override (`classNames.button`). */
  className?: string;
}

/**
 * The full-width filled CTA shared by every flow's footer.
 *
 * Exists because Pay, Swap, and Earn each had a byte-identical copy of this
 * markup; a tweak to the padding or the spinner had to be made in three places
 * and inevitably wasn't.
 */
export function ActionButton({
  label,
  toneClasses,
  busy,
  disabled = false,
  leadingIcon,
  onClick,
  className,
}: ActionButtonProps) {
  const blocked = busy || disabled;
  return (
    <button
      type="button"
      className={twcn(
        'flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border-0 px-4 py-3.5 text-[15px] font-[650] -tracking-[0.005em] text-white shadow-md transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.99]',
        toneClasses,
        blocked && 'cursor-not-allowed opacity-45 active:scale-100',
        className,
      )}
      disabled={blocked}
      onClick={onClick}
    >
      {busy ? (
        <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin-epoch rounded-full border-2 border-white border-t-transparent" />
      ) : (
        leadingIcon
      )}
      {label}
    </button>
  );
}
