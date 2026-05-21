import { cn } from '../../lib/cn';
import type { OneDeltaConfig, OneDeltaMarketRow } from '../../types';
import { TrendingUpIcon } from '../Icons';
import { TokenAvatar } from '../ui/TokenAvatar';

interface Props {
  row: OneDeltaMarketRow;
  config: OneDeltaConfig;
  kind: 'lend' | 'borrow';
  selected?: boolean;
  onClick: () => void;
}

function fmtUsd(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

const LENDER_LABELS: Record<string, string> = {
  AAVE_V3: 'Aave',
  AAVE_V2: 'Aave',
  COMPOUND_V3: 'Compound',
  MORPHO_BLUE: 'Morpho',
  VENUS: 'Venus',
};

const LENDER_DOT: Record<string, string> = {
  AAVE_V3: '#b6509e',
  AAVE_V2: '#b6509e',
  COMPOUND_V3: '#00d395',
  MORPHO_BLUE: '#2b5cff',
  VENUS: '#f6c344',
};

function lenderShort(lenderKey: string): string {
  return LENDER_LABELS[lenderKey] ?? lenderKey.replace('_', ' ');
}

export function MarketRowCard({ row, config, kind, selected, onClick }: Props) {
  const asset = row.underlyingInfo.asset;
  const rate = kind === 'lend' ? row.depositRate : row.variableBorrowRate;
  const tvlUsd = kind === 'lend' ? row.totalDepositsUsd : row.borrowLiquidityUsd;
  const lender = lenderShort(config.lenderKey);
  const dotColor = LENDER_DOT[config.lenderKey] ?? 'var(--epoch-color-primary)';
  const title = `${lender} v3 ${asset.symbol} ${kind === 'lend' ? 'Lending' : 'Borrowing'}`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Select ${title}`}
      className={cn(
        'box-border flex w-full cursor-pointer items-center gap-3.5 border-0 border-t border-line bg-transparent px-1 py-3.5 text-left transition-colors duration-100 hover:bg-surface-muted',
        selected && 'bg-accent-soft hover:bg-accent-soft',
      )}
    >
      <TokenAvatar src={asset.logoURI} symbol={asset.symbol} size={44} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-semibold leading-tight text-fg">
          {title}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-3.5 w-3.5 shrink-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${dotColor}cc 0%, ${dotColor} 60%, ${dotColor}80 100%)`,
            }}
            aria-hidden
          />
          <span className="text-[12.5px] font-medium text-fg-muted">{lender}</span>
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="inline-flex items-center gap-1.5 text-[15px] font-bold tabular-nums text-success">
          <TrendingUpIcon />
          {rate.toFixed(rate >= 10 ? 1 : 2)}% APY
        </span>
        <span className="text-xs tabular-nums text-fg-muted">TVL: {fmtUsd(tvlUsd)}</span>
      </div>
    </button>
  );
}
