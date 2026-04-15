import { s } from '../styles';
import { t } from '../theme';
import type { EpochChain, EpochToken, EpochClassNames } from '../types';
import { Dropdown, type DropdownOption } from './Dropdown';
import { Avatar } from './Avatar';

interface SourcePickerProps {
  chains: EpochChain[];
  tokens: EpochToken[];
  selectedChainId: number | null;
  selectedTokenAddress: string;
  onChainChange: (chainId: number | null) => void;
  onTokenChange: (address: string) => void;
  balance: bigint | null;
  isBalanceLoading: boolean;
  insufficientBalance: boolean;
  formatAmount: (amount: bigint, decimals: number) => string;
  classNames?: EpochClassNames;
}

/**
 * Chain + token picker with live balance display.
 * Renders inside the "Pay with" card area.
 */
export function SourcePicker({
  chains,
  tokens,
  selectedChainId,
  selectedTokenAddress,
  onChainChange,
  onTokenChange,
  balance,
  isBalanceLoading,
  insufficientBalance,
  formatAmount,
  classNames: cn,
}: SourcePickerProps) {
  const selectedToken = tokens.find((tok) => tok.address === selectedTokenAddress);

  const chainOptions: DropdownOption[] = chains.map((chain) => ({
    value: String(chain.id),
    label: chain.name,
    sublabel: `Chain ID ${chain.id}`,
    leading: <Avatar src={chain.logoURI} label={chain.name} />,
  }));

  const tokenOptions: DropdownOption[] = tokens.map((tok) => ({
    value: tok.address,
    label: tok.symbol,
    sublabel: tok.name,
    leading: <Avatar src={tok.logoURI} label={tok.symbol} />,
  }));

  return (
    <div style={s.pickerGroup}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={s.pickerLabel}>From</span>
        {selectedChainId !== null && selectedTokenAddress && selectedToken && (
          <span
            style={{
              ...s.balanceText,
              color: insufficientBalance ? t.error : t.textMuted,
            }}
          >
            {isBalanceLoading
              ? 'Loading…'
              : balance !== null
                ? `Balance: ${formatAmount(balance, selectedToken.decimals)} ${selectedToken.symbol}`
                : 'Balance unavailable'}
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px',
          borderRadius: t.radiusSm,
          border: `1px solid ${insufficientBalance ? t.error : t.border}`,
          backgroundColor: t.surface,
          transition: 'border-color 0.15s',
        }}
      >
        <Dropdown
          options={chainOptions}
          value={selectedChainId !== null ? String(selectedChainId) : ''}
          onChange={(v) => onChainChange(v ? Number(v) : null)}
          placeholder="Select chain"
          ariaLabel="Source chain"
          searchable={chainOptions.length > 6}
          emptyLabel="No chains available"
        />

        <Dropdown
          options={tokenOptions}
          value={selectedTokenAddress}
          onChange={onTokenChange}
          placeholder={selectedChainId ? 'Select token' : 'Pick a chain first'}
          disabled={selectedChainId === null || tokenOptions.length === 0}
          ariaLabel="Source token"
          searchable={tokenOptions.length > 6}
          emptyLabel="No tokens on this chain"
        />
      </div>
    </div>
  );
}
