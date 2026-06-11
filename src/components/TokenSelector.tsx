import { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '../lib/cn';
import type { EpochChain, EpochToken } from '../types';
import { Avatar } from './Avatar';
import { CheckIcon, CloseIcon, SearchIcon } from './Icons';

export interface TokenWithChain extends EpochToken {
  chain: EpochChain;
}

interface TokenSelectorProps {
  tokens: TokenWithChain[];
  selectedTokenAddress: string;
  selectedChainId: number | null;
  onSelect: (address: string, chainId: number) => void;
  onBack: () => void;
}

const ALL_GRADIENT = 'linear-gradient(135deg, #b6509e 0%, #2ebac6 100%)';

const CHAIN_DOT: Record<number, string> = {
  1: '#627eea',     // Ethereum
  10: '#ff0420',    // Optimism
  137: '#8247e5',   // Polygon
  8453: '#0052ff',  // Base
  42161: '#28a0f0', // Arbitrum
  84532: '#0052ff', // Base Sepolia
};

function chainDot(chainId: number): string {
  return CHAIN_DOT[chainId] ?? 'var(--epoch-color-primary)';
}

export function TokenSelector({
  tokens,
  selectedTokenAddress,
  selectedChainId,
  onSelect,
}: TokenSelectorProps) {
  const [query, setQuery] = useState('');
  const [chainFilter, setChainFilter] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const chains = useMemo(() => {
    const seen = new Map<number, EpochChain>();
    tokens.forEach((tk) => {
      if (!seen.has(tk.chain.id)) seen.set(tk.chain.id, tk.chain);
    });
    return Array.from(seen.values());
  }, [tokens]);

  const filtered = useMemo(() => {
    let list = tokens;
    if (chainFilter !== null) list = list.filter((tk) => tk.chain.id === chainFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (tk) =>
          tk.symbol.toLowerCase().includes(q) ||
          tk.name.toLowerCase().includes(q) ||
          tk.address.toLowerCase().includes(q),
      );
    }
    return list;
  }, [tokens, query, chainFilter]);

  return (
    <div className="flex h-[440px] flex-col">
      <div className="mb-2.5 flex items-center gap-2.5 rounded-sm border-[1.5px] border-line bg-canvas px-3.5 py-2.5 transition-colors duration-150 focus-within:border-primary">
        <SearchIcon />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search tokens, symbol, address..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-fg outline-none border-0 p-0"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="cursor-pointer border-0 bg-transparent p-0 leading-none text-fg-muted transition-colors duration-150 hover:text-fg"
          >
            <CloseIcon width={14} height={14} />
          </button>
        )}
      </div>

      {/* Chain filter chips — wrap to additional rows when many chains are
          present so we never spawn a horizontal scrollbar. */}
      <div className="mb-2.5 flex min-h-[26px] shrink-0 flex-wrap gap-1.5">
        {chains.length > 1 && (
          <>
            <ChainChip
              label="All"
              dotBackground={ALL_GRADIENT}
              active={chainFilter === null}
              onClick={() => setChainFilter(null)}
            />
            {chains.map((c) => (
              <ChainChip
                key={c.id}
                label={c.name}
                logoURI={c.logoURI}
                dotColor={chainDot(c.id)}
                active={chainFilter === c.id}
                onClick={() => setChainFilter(chainFilter === c.id ? null : c.id)}
              />
            ))}
          </>
        )}
      </div>

      <div className="flex flex-1 animate-overlay-in flex-col overflow-x-hidden overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-fg-muted">No tokens found</div>
        ) : (
          filtered.map((tk) => {
            const isSelected = tk.address === selectedTokenAddress && tk.chain.id === selectedChainId;
            return (
              <button
                key={`${tk.chain.id}-${tk.address}`}
                type="button"
                onClick={() => onSelect(tk.address, tk.chain.id)}
                aria-label={`Select ${tk.symbol} on ${tk.chain.name}`}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3.5 border-0 border-b border-line bg-transparent px-2 py-3 text-left transition-[background-color,transform] duration-150 last:border-b-0 hover:bg-surface-muted active:scale-[0.995]',
                  isSelected && 'bg-accent-soft hover:bg-accent-soft',
                )}
              >
                <div className="relative h-9 w-9 shrink-0">
                  <Avatar src={tk.logoURI} label={tk.symbol} size={36} />
                  <div className="absolute -bottom-0.5 -right-1 rounded-full border-2 border-canvas leading-none">
                    <Avatar src={tk.chain.logoURI} label={tk.chain.name} size={14} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-snug text-fg">{tk.symbol}</div>
                  <div className="text-xs leading-snug text-fg-muted">{tk.chain.name}</div>
                </div>
                {isSelected && <CheckIcon width={16} height={16} color="var(--epoch-color-primary)" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

interface ChainChipProps {
  label: string;
  logoURI?: string;
  active: boolean;
  onClick: () => void;
  dotColor?: string;
  dotBackground?: string;
}

function ChainChip({ label, logoURI, active, onClick, dotColor, dotBackground }: ChainChipProps) {
  const dotStyle: React.CSSProperties = dotBackground
    ? { background: dotBackground }
    : dotColor
    ? {
        background: `radial-gradient(circle at 30% 30%, ${dotColor}cc 0%, ${dotColor} 60%, ${dotColor}80 100%)`,
      }
    : {};

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-[26px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] font-semibold leading-none transition-[border-color,background-color,color] duration-150',
        active
          ? 'border-primary bg-[color-mix(in_srgb,var(--epoch-color-primary)_12%,transparent)] text-primary'
          : 'border-line bg-surface text-fg-secondary hover:border-line-strong hover:text-fg',
      )}
    >
      {logoURI ? (
        <Avatar src={logoURI} label={label} size={14} />
      ) : (
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={dotStyle}
          aria-hidden
        />
      )}
      {label}
    </button>
  );
}
