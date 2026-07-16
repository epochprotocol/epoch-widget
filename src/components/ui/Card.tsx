import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type CardTone = 'default' | 'muted' | 'raised' | 'accent';

interface Props {
  children: ReactNode;
  tone?: CardTone;
  padding?: number | string;
  radius?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  interactive?: boolean;
}

const TONE_CLASSES: Record<CardTone, string> = {
  default: 'bg-canvas         border-line shadow-sm',
  muted:   'bg-surface-muted  border-line',
  raised:  'bg-surface-raised border-line',
  accent:  'bg-accent-soft    border-transparent',
};

export function Card({
  children,
  tone = 'default',
  padding = '16px',
  radius,
  className,
  style,
  onClick,
  interactive,
}: Props) {
  const inlineStyle: CSSProperties = {
    padding,
    ...(radius ? { borderRadius: radius } : null),
    ...style,
  };
  // A clickable card is a real interaction target, so it needs the keyboard
  // affordances a native button would give for free: focusable, and activated
  // by Enter/Space. It stays a plain div when there is nothing to click, and
  // cannot become a <button> because cards nest their own buttons.
  const isClickable = Boolean(onClick);
  return (
    <div
      className={cn(
        'box-border rounded-md border',
        TONE_CLASSES[tone],
        (interactive || onClick) && 'cursor-pointer transition-[border-color,box-shadow,transform] duration-150 hover:border-line-strong hover:shadow-md',
        className,
      )}
      style={inlineStyle}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
