import { cn } from '../lib/cn';
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
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.05em] text-fg-muted">
          From
        </span>
        {selectedChainId !== null && selectedTokenAddress && selectedToken && (
          <span
            className={cn(
              'text-xs font-medium',
              insufficientBalance ? 'text-error' : 'text-fg-muted',
            )}
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
        className={cn(
          'flex flex-col gap-2 rounded-sm border bg-surface p-3 transition-colors duration-150',
          insufficientBalance ? 'border-error' : 'border-line',
        )}
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
