import { cn } from '../../lib/cn';
import { SECTION_LABEL } from '../../lib/styles';
import { formatAmount, formatBalancePortionForInput } from '../../utils';
import { formatUsdPrice } from '../../lib/format-usd';
import { Avatar } from '../Avatar';

const FRACTIONS: { label: string; num: number; den: number }[] = [
  { label: '20%', num: 20, den: 100 },
  { label: '50%', num: 50, den: 100 },
  { label: 'Max', num: 1, den: 1 },
];

const FRACTION_CHIP =
  'cursor-pointer rounded-full border border-line bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-fg-secondary transition-[background-color,border-color,color,transform] duration-100 hover:border-primary hover:text-primary active:scale-[0.96]';

function TokenChainBadge({
  tokenSymbol,
  tokenLogoURI,
  chainName,
}: {
  tokenSymbol: string;
  tokenLogoURI?: string;
  chainName: string;
}) {
  return (
    <div
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-canvas py-1 pl-1 pr-2.5 text-[12px] font-semibold whitespace-nowrap text-fg shadow-sm"
      role="img"
      aria-label={`${tokenSymbol} on ${chainName}`}
    >
      <Avatar src={tokenLogoURI} label={tokenSymbol} size={20} />
      <span className="flex flex-col items-start gap-px leading-none">
        <span className="text-[12px] font-bold leading-none">{tokenSymbol}</span>
        <span className="text-[10px] font-medium leading-none text-fg-muted">
          {chainName}
        </span>
      </span>
    </div>
  );
}

interface WithdrawAmountCardProps {
  tokenSymbol: string;
  tokenLogoURI?: string;
  chainName: string;
  decimals: number;
  amount: string;
  onAmountChange: (v: string) => void;
  balanceRaw: bigint;
  onPickFraction: (humanAmount: string) => void;
  approxUsd?: number | null;
}

export function WithdrawAmountCard({
  tokenSymbol,
  tokenLogoURI,
  chainName,
  decimals,
  amount,
  onAmountChange,
  balanceRaw,
  onPickFraction,
  approxUsd,
}: WithdrawAmountCardProps) {
  const balanceHuman = formatAmount(balanceRaw, decimals);

  const applyFraction = (num: number, den: number) => {
    if (balanceRaw === 0n) return;
    onPickFraction(formatBalancePortionForInput(balanceRaw, num, den, decimals));
  };

  return (
    <div
      className={cn(
        'rounded-md border border-line bg-surface px-4 py-3.5 transition-[border-color] duration-150',
        'focus-within:border-primary',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className={SECTION_LABEL}>Amount</span>
        <TokenChainBadge
          tokenSymbol={tokenSymbol}
          tokenLogoURI={tokenLogoURI}
          chainName={chainName}
        />
      </div>

      <input
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        aria-label={`Withdraw amount in ${tokenSymbol}`}
        className="block w-full border-0 bg-transparent p-0 text-[34px] font-bold leading-none -tracking-[0.03em] tabular-nums text-fg outline-none placeholder:text-fg-muted"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-fg-muted tabular-nums">
          <span>≈ {formatUsdPrice(approxUsd) ?? '—'}</span>
          <span className="hidden sm:inline">Balance: {balanceHuman}</span>
        </div>
        <div className="flex gap-1.5">
          {FRACTIONS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => applyFraction(f.num, f.den)}
              className={FRACTION_CHIP}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-1.5 text-xs text-fg-muted tabular-nums sm:hidden">
        Balance: {balanceHuman}
      </div>
    </div>
  );
}
