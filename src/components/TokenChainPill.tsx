import { cn } from '../lib/cn';
import { Avatar } from './Avatar';
import { ChevronRightIcon, LockIcon } from './Icons';

interface TokenChainPillProps {
  tokenSymbol: string;
  tokenLogoURI?: string;
  chainName: string;
  chainLogoURI?: string;
  /** Click handler. When omitted the pill renders in read-only mode. */
  onClick?: () => void;
  /** Optional aria-label for interactive mode. */
  ariaLabel?: string;
}

const BASE_PILL =
  'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-canvas py-0.75 pl-0.75 pr-2.25 text-[13px] font-semibold leading-none whitespace-nowrap text-fg shadow-sm border transition-[border-color,box-shadow] duration-150';

/**
 * Compact token+chain pill used inside the pay/receive cards.
 *
 * When `onClick` is provided the pill is a real button (hover + chevron).
 * Otherwise it renders as a non-interactive tag — visually highlighted as a
 * "locked" selection so the user understands it's the destination target.
 */
export function TokenChainPill({
  tokenSymbol,
  tokenLogoURI,
  chainName,
  chainLogoURI,
  onClick,
  ariaLabel,
}: TokenChainPillProps) {
  const readOnly = !onClick;

  const content = (
    <>
      {/* Token logo with chain badge overlay */}
      <div className="relative h-[22px] w-[22px] shrink-0">
        <Avatar src={tokenLogoURI} label={tokenSymbol} size={22} />
        {chainName && (
          <div className="absolute -bottom-0.5 -right-[3px] rounded-full border-[1.5px] border-canvas leading-none">
            <Avatar src={chainLogoURI} label={chainName} size={11} />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-px">
        <span className="text-[13px] font-bold leading-none text-fg">{tokenSymbol}</span>
        <span className="text-[10px] font-medium leading-none text-fg-muted">{chainName}</span>
      </div>
      <div
        className={cn(
          'flex h-3.5 w-3.5 shrink-0 items-center justify-center',
          readOnly ? 'text-primary' : 'text-fg-muted',
        )}
        aria-hidden="true"
      >
        {readOnly ? <LockIcon /> : <ChevronRightIcon width={11} height={11} />}
      </div>
    </>
  );

  if (readOnly) {
    return (
      <div
        className={cn(BASE_PILL, 'border-primary/20 cursor-default shadow-[0_0_0_2px_var(--epoch-color-accent-soft)]')}
        role="img"
        aria-label={`${tokenSymbol} on ${chainName} (destination, not changeable)`}
        title={`${tokenSymbol} on ${chainName} — destination`}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        BASE_PILL,
        'border-line cursor-pointer hover:border-primary hover:shadow-[0_0_0_3px_var(--epoch-color-accent-soft)]',
      )}
    >
      {content}
    </button>
  );
}
