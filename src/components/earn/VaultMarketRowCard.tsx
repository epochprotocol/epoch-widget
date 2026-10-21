import type { EpochEarnVault } from '../../types';
import { getEpochChainById } from '../../epoch-config';
import { cn } from '../../lib/cn';
import { TrendingUpIcon } from '../Icons';
import { TokenAvatar } from '../ui/TokenAvatar';

export function VaultMarketRowCard({ vault, selected, onClick }: { vault: EpochEarnVault; selected?: boolean; onClick: () => void }) {
  const chain = getEpochChainById(vault.chainId);
  const provider = vault.provider === 'euler-earn' ? 'Euler Earn' : vault.provider[0].toUpperCase() + vault.provider.slice(1);
  return <button type="button" onClick={onClick} aria-label={`Select ${vault.share.symbol} vault from ${provider}`}
    className={cn('group relative box-border flex w-full cursor-pointer items-center gap-3.5 rounded-sm border-0 border-b border-line bg-transparent px-2 py-3 pl-3 text-left transition-colors hover:bg-surface-muted', selected && 'bg-accent-soft')}>
    <TokenAvatar src={vault.underlying.logoURI} symbol={vault.underlying.symbol} size={40} chainSrc={chain?.logoURI} chainAlt={chain?.name} />
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="truncate text-[15px] font-semibold text-fg">{vault.share.symbol}</span>
      <span className="truncate text-[12px] text-fg-muted">{chain?.name ?? `Chain ${vault.chainId}`} · {provider} · {vault.underlying.symbol}</span>
    </div>
    <span className="inline-flex shrink-0 items-center gap-1 text-[14px] font-bold tabular-nums text-success"><TrendingUpIcon />{vault.apyPercent.toFixed(vault.apyPercent >= 10 ? 1 : 2)}%</span>
  </button>;
}
