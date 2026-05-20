import { useState, useMemo, useRef, useEffect } from 'react';
import { s } from '../styles';
import { t } from '../theme';
import type { EpochChain } from '../types';
import { Avatar } from './Avatar';
import { CheckIcon, ChevronLeftIcon, SearchIcon } from './Icons';

interface ChainSelectorProps {
  chains: EpochChain[];
  selectedChainId: number | null;
  onSelect: (chainId: number) => void;
  onBack: () => void;
}

/**
 * Full-panel chain selector with search. Renders as a replacement view
 * inside the modal body (not a floating dropdown).
 */
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '320px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            all: 'unset',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            transition: 'background 0.15s',
            color: t.text,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = t.surface; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <ChevronLeftIcon width={18} height={18} />
        </button>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: t.text }}>
          Select Chain
        </h3>
      </div>

      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          borderRadius: t.radiusSm,
          border: `1.5px solid ${t.border}`,
          backgroundColor: t.bg,
          marginBottom: '12px',
          transition: 'border-color 0.15s',
        }}
      >
        <SearchIcon />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search chains..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            all: 'unset',
            flex: 1,
            fontSize: '14px',
            color: t.text,
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: t.textMuted, fontSize: '13px' }}>
            No chains found
          </div>
        ) : (
          filtered.map((chain) => {
            const isSelected = chain.id === selectedChainId;
            return (
              <button
                key={chain.id}
                type="button"
                onClick={() => onSelect(chain.id)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: t.radiusSm,
                  backgroundColor: isSelected ? t.surface : 'transparent',
                  border: isSelected ? `1.5px solid ${t.primary}` : '1.5px solid transparent',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = t.surface;
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Avatar src={chain.logoURI} label={chain.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: t.text }}>
                    {chain.name}
                  </div>
                </div>
                {isSelected && (
                  <CheckIcon width={18} height={18} color={t.primary} />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
