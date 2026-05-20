import { useState, useMemo, useRef, useEffect } from 'react';
import { t } from '../theme';
import type { EpochChain, EpochToken } from '../types';
import { Avatar } from './Avatar';
import { CheckIcon, ChevronLeftIcon, CloseIcon, SearchIcon } from './Icons';

export interface TokenWithChain extends EpochToken {
  chain: EpochChain;
}

interface TokenSelectorProps {
  /** All tokens across all available chains. */
  tokens: TokenWithChain[];
  selectedTokenAddress: string;
  selectedChainId: number | null;
  /** Called with picked token address + its chain id. */
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

  // Unique chains present in the token list for filter chips
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '440px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          style={{
            all: 'unset',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            color: t.text,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = t.surface; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <ChevronLeftIcon width={18} height={18} />
        </button>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: t.text }}>
          Select Token
        </h3>
      </div>

      {/* Search bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          borderRadius: t.radiusSm,
          border: `1.5px solid ${t.border}`,
          backgroundColor: t.bg,
          marginBottom: '10px',
        }}
      >
        <SearchIcon />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search tokens, symbol, address..."
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
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            style={{ all: 'unset', cursor: 'pointer', color: t.textMuted, lineHeight: 1, fontSize: '16px' }}
          >
            <CloseIcon width={14} height={14} />
          </button>
        )}
      </div>

      {/* Chain filter chips — reserve vertical space even with a single chain
          so the modal height stays stable regardless of the token catalog. */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          marginBottom: '10px',
          minHeight: '22px',
          flexShrink: 0,
        }}
      >
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

      {/* Token list */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: t.textMuted, fontSize: '13px' }}>
            No tokens found
          </div>
        ) : (
          filtered.map((tk) => {
            const isSelected = tk.address === selectedTokenAddress && tk.chain.id === selectedChainId;
            return (
              <button
                key={`${tk.chain.id}-${tk.address}`}
                type="button"
                onClick={() => onSelect(tk.address, tk.chain.id)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: t.radiusSm,
                  backgroundColor: isSelected ? t.surface : 'transparent',
                  border: isSelected ? `1.5px solid ${t.primary}` : '1.5px solid transparent',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = t.surface;
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Token logo with chain badge */}
                <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
                  <Avatar src={tk.logoURI} label={tk.symbol} size={36} />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-4px',
                      borderRadius: '50%',
                      border: `2px solid ${t.bg}`,
                      lineHeight: 0,
                    }}
                  >
                    <Avatar src={tk.chain.logoURI} label={tk.chain.name} size={14} />
                  </div>
                </div>

                {/* Name + chain */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: t.text, lineHeight: 1.3 }}>
                    {tk.symbol}
                  </div>
                  <div style={{ fontSize: '12px', color: t.textMuted, lineHeight: 1.3 }}>
                    {tk.chain.name}
                  </div>
                </div>

                {/* Checkmark */}
                {isSelected && (
                  <CheckIcon width={16} height={16} color={t.primary} />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chain filter chip
// ---------------------------------------------------------------------------

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
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        height: '22px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 500,
        lineHeight: 1,
        border: active ? `1px solid ${t.primary}` : `1px solid ${t.border}`,
        backgroundColor: active ? `${t.primary}12` : t.surface,
        color: active ? t.primary : t.textMuted,
        transition: 'all 0.12s',
      }}
    >
      {logoURI && <Avatar src={logoURI} label={label} size={12} />}
      {label}
    </button>
  );
}
