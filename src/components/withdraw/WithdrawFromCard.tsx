import { cn } from '../../lib/cn';
import { SECTION_LABEL } from '../../lib/styles';
import { Avatar } from '../Avatar';
import { ChevronRightIcon, TrendingUpIcon } from '../Icons';
import { Pill } from '../ui/Pill';

interface WithdrawFromCardProps {
  tokenSymbol: string;
  tokenLogoURI?: string;
  sublabel: string;
  aprPct: number | null;
  /** When set, the card becomes a button that returns to the position list. */
  onClick?: () => void;
}

export function WithdrawFromCard({
  tokenSymbol,
  tokenLogoURI,
  sublabel,
  aprPct,
  onClick,
}: WithdrawFromCardProps) {
  const inner = (
    <>
      <div className="mb-2">
        <span className={SECTION_LABEL}>From</span>
      </div>
      <div className="flex items-center gap-3">
        <Avatar src={tokenLogoURI} label={tokenSymbol} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold text-fg">
            {tokenSymbol} position
          </div>
          {sublabel && (
            <div className="mt-0.5 truncate text-xs text-fg-muted">
              {sublabel}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {aprPct != null && (
            <Pill
              variant="success"
              size="sm"
              leading={<TrendingUpIcon width={11} height={11} />}
            >
              {aprPct.toFixed(aprPct >= 10 ? 1 : 2)}% APR
            </Pill>
          )}
          {onClick && (
            <span
              className="flex h-4 w-4 items-center justify-center text-fg-muted transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden
            >
              <ChevronRightIcon width={12} height={12} />
            </span>
          )}
        </div>
      </div>
    </>
  );

  const baseClass =
    'group block w-full rounded-md border border-line bg-surface px-4 py-3 text-left transition-[border-color,box-shadow] duration-150';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Change position (currently ${tokenSymbol})`}
        className={cn(
          baseClass,
          'cursor-pointer hover:border-primary hover:shadow-[0_0_0_3px_var(--epoch-color-accent-soft)]',
        )}
      >
        {inner}
      </button>
    );
  }
  return <div className={baseClass}>{inner}</div>;
}
