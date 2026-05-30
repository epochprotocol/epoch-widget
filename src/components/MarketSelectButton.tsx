import { cn } from '../lib/cn';
import { getEpochChainById } from '../epoch-config';
import type { EpochEarnMarket } from '../types';
import { ChevronRightIcon, SearchIcon, TrendingUpIcon } from './Icons';
import { Pill } from './ui/Pill';
import { TokenAvatar } from './ui/TokenAvatar';

interface Props {
  selected: EpochEarnMarket | null;
  onClick: () => void;
  disabled?: boolean;
}

const CHAIN_DOT: Record<number, string> = {
  1: '#627eea',
  8453: '#0052ff',
  42161: '#28a0f0',
  10: '#ff0420',
  137: '#8247e5',
};

const BASE_BUTTON =
  'group flex w-full cursor-pointer items-center gap-3.5 rounded-md border border-line p-3.5 text-left shadow-sm ring-1 ring-transparent transition-[border-color,box-shadow,background-color] duration-150 hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-line';
const SELECTED_SURFACE =
  'bg-gradient-to-r from-canvas to-surface-muted/60 hover:ring-primary/30';
const EMPTY_SURFACE = 'bg-canvas';

export function MarketSelectButton({ selected, onClick, disabled }: Props) {
  const chain = selected?.chainId != null ? getEpochChainById(selected.chainId) : undefined;
  const chainDot =
    selected?.chainId != null ? CHAIN_DOT[selected.chainId] : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(BASE_BUTTON, selected ? SELECTED_SURFACE : EMPTY_SURFACE)}
      aria-label={selected ? `Change market — ${selected.displayName}` : 'Select market to earn yield with'}
    >
      {selected ? (
        <TokenAvatar
          src={selected.token.logoURI}
          symbol={selected.token.symbol}
          size={44}
          chainSrc={chain?.logoURI}
          chainAlt={chain?.name}
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-fg-muted">
          <SearchIcon width={16} height={16} />
        </span>
      )}
      <div className="min-w-0 flex-1 text-left">
        {selected ? (
          <>
            <div className="text-[16px] font-semibold leading-tight text-fg">
              {selected.displayName}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Pill
                variant="neutral"
                size="xs"
                leading={
                  chainDot ? (
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${chainDot}cc 0%, ${chainDot} 60%, ${chainDot}80 100%)`,
                      }}
                      aria-hidden
                    />
                  ) : undefined
                }
              >
                {selected.chainLabel}
              </Pill>
            </div>
          </>
        ) : (
          <div className="text-[15px] font-medium text-fg-muted">
            Select market to earn yield with
          </div>
        )}
      </div>
      {selected && (
        <Pill variant="success" size="sm" leading={<TrendingUpIcon />}>
          {(selected.aprDecimal * 100).toFixed(2)}% APR
        </Pill>
      )}
      <span className="ml-1 shrink-0 text-fg-muted">
        <ChevronRightIcon />
      </span>
    </button>
  );
}
