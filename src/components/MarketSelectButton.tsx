import { cn } from '../lib/cn';
import type { EpochEarnMarket } from '../types';
import { ChevronRightIcon, SearchIcon } from './Icons';
import { Pill } from './ui/Pill';

interface Props {
  selected: EpochEarnMarket | null;
  onClick: () => void;
  disabled?: boolean;
}

const ROW_BUTTON =
  'flex w-full cursor-pointer items-center gap-3 rounded-md border border-line bg-canvas p-3.5 text-left shadow-sm transition-[border-color,box-shadow] duration-150 hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-line';

export function MarketSelectButton({ selected, onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={ROW_BUTTON}
      aria-label={selected ? `Change market — ${selected.displayName}` : 'Select market to earn yield with'}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          selected ? 'bg-accent-soft text-primary' : 'bg-surface text-fg-muted',
        )}
      >
        <SearchIcon width={16} height={16} />
      </span>
      <div className="min-w-0 flex-1 text-left">
        {selected ? (
          <>
            <div className="text-[15px] font-semibold leading-snug text-fg">
              {selected.displayName}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Pill variant="neutral" size="xs">{selected.chainLabel}</Pill>
              <Pill variant="neutral" size="xs">{selected.token.symbol}</Pill>
              <Pill variant="success" size="xs">{(selected.aprDecimal * 100).toFixed(2)}% APR</Pill>
            </div>
          </>
        ) : (
          <div className="text-[15px] font-medium text-fg-muted">
            Select market to earn yield with
          </div>
        )}
      </div>
      <span className="ml-auto shrink-0 text-fg-muted">
        <ChevronRightIcon />
      </span>
    </button>
  );
}
