import { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '../lib/cn';
import type { EpochChain } from '../types';
import { Avatar } from './Avatar';
import { CheckIcon, ChevronLeftIcon, SearchIcon } from './Icons';

interface ChainSelectorProps {
  chains: EpochChain[];
  selectedChainId: number | null;
  onSelect: (chainId: number) => void;
  onBack: () => void;
}

export function ChainSelector({ chains, selectedChainId, onSelect, onBack }: ChainSelectorProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return chains;
    const q = query.toLowerCase();
    return chains.filter(
      (c) => c.name.toLowerCase().includes(q) || String(c.id).includes(q),
    );
  }, [chains, query]);

  return (
    <div className="flex h-full min-h-[320px] flex-col">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-fg transition-colors duration-150 hover:bg-surface"
        >
          <ChevronLeftIcon width={18} height={18} />
        </button>
        <h3 className="m-0 text-base font-semibold text-fg">Select Chain</h3>
      </div>

      <div className="mb-3 flex items-center gap-2.5 rounded-sm border-[1.5px] border-line bg-canvas px-3.5 py-2.5">
        <SearchIcon />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search chains..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-0 bg-transparent p-0 text-sm text-fg outline-none"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-fg-muted">No chains found</div>
        ) : (
          filtered.map((chain) => {
            const isSelected = chain.id === selectedChainId;
            return (
              <button
                key={chain.id}
                type="button"
                onClick={() => onSelect(chain.id)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-sm border-[1.5px] px-3.5 py-3 text-left transition-colors duration-150',
                  isSelected
                    ? 'border-primary bg-surface'
                    : 'border-transparent bg-transparent hover:bg-surface',
                )}
              >
                <Avatar src={chain.logoURI} label={chain.name} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-fg">{chain.name}</div>
                </div>
                {isSelected && <CheckIcon width={18} height={18} color="var(--epoch-color-primary)" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
