import { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '../lib/cn';
import type { EpochChain, EpochToken } from '../types';
import { Avatar } from './Avatar';
import { CheckIcon, ChevronLeftIcon, CloseIcon, SearchIcon } from './Icons';

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

export function TokenSelector({
  tokens,
  selectedTokenAddress,
  selectedChainId,
  onSelect,
  onBack,
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
      <div className="mb-3.5 flex items-center gap-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-7.5 w-7.5 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-fg hover:bg-surface"
        >
          <ChevronLeftIcon width={18} height={18} />
        </button>
        <h3 className="m-0 text-base font-semibold text-fg">Select Token</h3>
      </div>

      <div className="mb-2.5 flex items-center gap-2.5 rounded-sm border-[1.5px] border-line bg-canvas px-3.5 py-2.5">
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
            className="cursor-pointer border-0 bg-transparent p-0 leading-none text-fg-muted"
          >
            <CloseIcon width={14} height={14} />
          </button>
        )}
      </div>

      {/* Chain filter chips — reserve vertical space so modal height stays stable. */}
      <div className="mb-2.5 flex min-h-[22px] shrink-0 flex-nowrap gap-1 overflow-x-auto">
        {chains.length > 1 && (
          <>
            <ChainChip
              label="All"
              active={chainFilter === null}
              onClick={() => setChainFilter(null)}
            />
            {chains.map((c) => (
              <ChainChip
                key={c.id}
                label={c.name}
                logoURI={c.logoURI}
                active={chainFilter === c.id}
                onClick={() => setChainFilter(chainFilter === c.id ? null : c.id)}
              />
            ))}
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
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
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-sm border-[1.5px] px-3 py-2.5 text-left transition-colors duration-100',
                  isSelected
                    ? 'border-primary bg-surface'
                    : 'border-transparent bg-transparent hover:bg-surface',
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

function ChainChip({
  label,
  logoURI,
  active,
  onClick,
}: {
  label: string;
  logoURI?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-[22px] cursor-pointer items-center gap-1 rounded-full border px-2 text-[11px] font-medium leading-none transition-colors duration-100',
        active
          ? 'border-primary bg-[color-mix(in_srgb,var(--epoch-color-primary)_12%,transparent)] text-primary'
          : 'border-line bg-surface text-fg-muted',
      )}
    >
      {logoURI && <Avatar src={logoURI} label={label} size={12} />}
      {label}
    </button>
  );
}
