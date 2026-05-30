import { cn } from '../../lib/cn';
import { getEpochChainById } from '../../epoch-config';
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

const LENDER_DOT: Record<string, string> = {
  AAVE: '#b6509e',
  AAVE_V2: '#b6509e',
  AAVE_V3: '#b6509e',
  AAVE_V3_PRIME: '#b6509e',
  COMPOUND: '#00d395',
  MORPHO: '#2b5cff',
  FLUID: '#36b6ff',
  EULER: '#4d9aff',
  SPARK: '#ffaa00',
  VENUS: '#f6c344',
  YLDR: '#ffb547',
};

const FAMILY_LABELS: Record<string, string> = {
  AAVE: 'Aave',
  AAVE_V2: 'Aave V2',
  AAVE_V3: 'Aave V3',
  AAVE_V3_PRIME: 'Aave V3 Prime',
  COMPOUND: 'Compound',
  MORPHO: 'Morpho',
  FLUID: 'Fluid',
  EULER: 'Euler',
  SPARK: 'Spark',
  VENUS: 'Venus',
  YLDR: 'YLDR',
};

export function MarketRowCard({ row, config, kind, selected, onClick }: Props) {
  const asset = row.underlyingInfo.asset;
  const rate = kind === 'lend' ? row.depositRate : row.variableBorrowRate;
  const tvlUsd = kind === 'lend' ? row.totalDepositsUsd : row.borrowLiquidityUsd;
  const family = config.lenderFamily ?? config.lenderKey;
  const familyLabel = FAMILY_LABELS[family] ?? config.label ?? family.replace(/_/g, ' ');
  const dotColor = LENDER_DOT[family] ?? 'var(--epoch-color-primary)';
  const symbol = asset.symbol && asset.symbol !== '???' ? asset.symbol : asset.name || 'Market';
  // OneDelta types `chainId` as string on both asset and config; SDK helper
  // takes a number. Fall back to config when asset is missing the field.
  const chainIdNum = Number(asset.chainId ?? config.chainId);
  const chain = Number.isFinite(chainIdNum) ? getEpochChainById(chainIdNum) : undefined;
  // Per-market label (e.g. "Morpho wstETH-USDT 86") only shown when more
  // specific than the family — avoids "Aave · Aave V3" redundancy.
  const subLabel =
    config.label && config.label.toLowerCase() !== familyLabel.toLowerCase()
      ? `${familyLabel} · ${config.label}`
      : familyLabel;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Select ${symbol} on ${familyLabel}`}
      className={cn(
        'group relative box-border flex w-full cursor-pointer items-center gap-3.5 rounded-sm border-0 border-b border-line bg-transparent px-2 py-3 pl-3 text-left transition-[background-color,transform] duration-150 last:border-b-0 hover:bg-surface-muted active:scale-[0.995]',
        selected &&
          "bg-accent-soft hover:bg-accent-soft before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-primary before:content-['']",
      )}
    >
      <TokenAvatar
        src={asset.logoURI}
        symbol={asset.symbol}
        size={40}
        chainSrc={chain?.logoURI}
        chainAlt={chain?.name}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-semibold leading-tight text-fg">
          {symbol}
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] leading-tight text-fg-muted">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${dotColor}cc 0%, ${dotColor} 60%, ${dotColor}80 100%)`,
            }}
            aria-hidden
          />
          <span className="max-w-[200px] truncate">{subLabel}</span>
        </span>
      </div>

      <div className="flex min-w-[92px] shrink-0 flex-col items-end gap-0.5">
        <span className="inline-flex items-center gap-1 text-[15px] font-bold tabular-nums text-success">
          <TrendingUpIcon />
          {rate.toFixed(rate >= 10 ? 1 : 2)}%
        </span>
        <span className="text-[11px] tabular-nums text-fg-muted">
          <span className="uppercase tracking-[0.04em]">tvl</span> {fmtUsd(tvlUsd)}
        </span>
      </div>
    </button>
  );
}
