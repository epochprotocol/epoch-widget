import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { AlertIcon, InfoIcon } from './Icons';

type BannerVariant = 'info' | 'error' | 'warning' | 'success';

interface BannerProps {
  variant?: BannerVariant;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BannerVariant, string> = {
  info:    'bg-accent-soft  text-info    border-info/25',
  error:   'bg-error-soft   text-error   border-error/25',
  warning: 'bg-warning-soft text-warning border-warning/25',
  success: 'bg-success-soft text-success border-success/25',
};

export function Banner({ variant = 'info', children, action, className }: BannerProps) {
  const Icon = variant === 'info' || variant === 'success' ? InfoIcon : AlertIcon;
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-sm border px-3.5 py-3 text-[13px] leading-snug',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      <span className="mt-px flex">
        <Icon />
      </span>
      <div className="min-w-0 flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
