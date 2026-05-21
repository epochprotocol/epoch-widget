import { useMemo, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { formatAmount, formatBalancePortionForInput } from '../utils';
import { getEpochChains, getEpochTokensByChainEnv } from '../epoch-config';
import type { EpochEarnPosition } from '../types';
import { Avatar } from './Avatar';
import { Dropdown, type DropdownOption } from './Dropdown';
import { SparklesIcon } from './Icons';

interface Props {
  position: EpochEarnPosition;
  amount: string;
  onAmountChange: (v: string) => void;
  /** 25% / 50% / Max. `isMax=true` only when the user picked the full balance. */
  onPickFraction: (humanAmount: string, isMax: boolean) => void;
  /** Smart Withdraw = route the withdrawn underlying through Epoch's intent
   *  network to a different chain or token. */
  smartWithdraw: boolean;
  onSmartWithdrawChange: (next: boolean) => void;
  /** Destination state — populated only when smartWithdraw is ON. */
  smartDestChainId: number | null;
  smartDestTokenAddress: string;
  onPickDestChain: (chainId: number) => void;
  onPickDestToken: (address: string) => void;
  /** Inline error (build / quote failure) shown above the CTA. */
  buildError: string | null;
  quoteError: string | null;
  isQuoting: boolean;
  /** Approximate USD value of the typed amount. Caller computes from price feed. */
  approxUsd?: number | null;
}

const FRACTIONS: { label: string; num: number; den: number; isMax: boolean }[] = [
  { label: '25%', num: 25, den: 100, isMax: false },
  { label: '50%', num: 50, den: 100, isMax: false },
  { label: 'Max', num: 1,  den: 1,   isMax: true  },
];

function formatUsd(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  if (v >= 1) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD`;
  if (v >= 0.01) return `$${v.toFixed(4)} USD`;
  if (v > 0) return '<$0.01 USD';
  return '$0.00 USD';
}

export function WithdrawDetailPanel({
  position,
  amount,
  onAmountChange,
  onPickFraction,
  smartWithdraw,
  onSmartWithdrawChange,
  smartDestChainId,
  smartDestTokenAddress,
  onPickDestChain,
  onPickDestToken,
  buildError,
  quoteError,
  isQuoting,
  approxUsd,
}: Props) {
  const { market } = position;
  const decimals = market.token.decimals;
  const balanceRaw = (() => {
    try {
      return BigInt(position.withdrawableRaw ?? position.underlyingBalanceRaw);
    } catch {
      return 0n;
    }
  })();
  const balanceHuman = formatAmount(balanceRaw, decimals);

  const applyFraction = (num: number, den: number, isMax: boolean) => {
    if (balanceRaw === 0n) return;
    onPickFraction(formatBalancePortionForInput(balanceRaw, num, den, decimals), isMax);
  };

  // Chain + receive-token dropdown options. All supported epoch-config chains
  // are listed — symmetric UX with the receive-token picker, no full-screen
  // selector view needed.
  const chainOptions: DropdownOption[] = useMemo(
    () =>
      getEpochChains(false).map((c) => ({
        value: String(c.id),
        label: c.name,
        leading: <Avatar src={c.logoURI} label={c.name} size={20} />,
      })),
    [],
  );
  const tokenOptions: DropdownOption[] = useMemo(() => {
    if (smartDestChainId == null) return [];
    return getEpochTokensByChainEnv(smartDestChainId, false).map((tok) => ({
      value: tok.address,
      label: tok.symbol,
      sublabel: tok.name,
      leading: <Avatar src={tok.logoURI} label={tok.symbol} size={20} />,
    }));
  }, [smartDestChainId]);

  const inlineError = buildError ?? quoteError;

  return (
    <div className="flex flex-col gap-4">
      {/* Position card — modal title already names the token ("Withdraw USDC"),
          so this row just identifies the source market (lender + chain) and the
          available balance. No second symbol mention. */}
      <div className="flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3">
        <Avatar src={market.token.logoURI} label={market.token.symbol} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold text-fg">
              {market.lenderName ?? market.lenderKey ?? 'Lender'}
            </span>
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden />
          </div>
          <div className="mt-0.5 text-xs text-fg-muted">{market.chainLabel}</div>
        </div>
        <div className="text-right">
          <div className="text-[15px] font-bold tabular-nums text-fg">{balanceHuman}</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
            Balance
          </div>
        </div>
      </div>

      {/* Amount input + fraction pills */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
            Amount
          </span>
          <div className="flex gap-1.5">
            {FRACTIONS.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => applyFraction(f.num, f.den, f.isMax)}
                className="cursor-pointer rounded-full border border-line bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-fg-secondary transition-colors hover:border-primary hover:text-primary"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            aria-label={`Withdraw amount in ${market.token.symbol}`}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[34px] font-bold leading-none -tracking-[0.03em] tabular-nums text-fg outline-none placeholder:text-fg-muted"
          />
          <span className="shrink-0 text-base font-semibold text-fg-secondary">
            {market.token.symbol}
          </span>
        </div>
        <div className="mt-2 text-xs text-fg-muted">≈ {formatUsd(approxUsd)}</div>
      </div>

      {/* Smart Withdraw — toggle reveals destination + receive controls below */}
      <SmartWithdrawToggle enabled={smartWithdraw} onChange={onSmartWithdrawChange} />

      {smartWithdraw && (
        <div className="grid grid-cols-2 gap-3">
          <LabeledPicker label="Destination Chain">
            <Dropdown
              options={chainOptions}
              value={smartDestChainId != null ? String(smartDestChainId) : ''}
              onChange={(v) => onPickDestChain(Number(v))}
              ariaLabel="Destination chain"
              placeholder="Select chain"
              searchable={chainOptions.length > 6}
            />
          </LabeledPicker>
          <LabeledPicker label="Receive Token">
            <Dropdown
              options={tokenOptions}
              value={smartDestTokenAddress}
              onChange={onPickDestToken}
              ariaLabel="Receive token"
              placeholder={tokenOptions.length === 0 ? 'No tokens on this chain' : 'Select token'}
              disabled={tokenOptions.length === 0}
              searchable={tokenOptions.length > 6}
            />
          </LabeledPicker>
        </div>
      )}

      {isQuoting && (
        <div className="text-center text-[12.5px] text-fg-muted">Fetching quote…</div>
      )}
      {inlineError && (
        <div
          role="alert"
          className="rounded-sm border border-error bg-error-soft px-3 py-2 text-[12.5px] leading-snug text-error"
        >
          {inlineError}
        </div>
      )}
    </div>
  );
}

function SmartWithdrawToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md border bg-accent-soft px-3 py-2 text-left transition-[border-color,background-color]',
        enabled ? 'border-primary' : 'border-line',
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canvas text-primary">
        <SparklesIcon width={14} height={14} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold leading-tight text-fg">Smart Withdraw</span>
        <span className="block text-[11px] leading-tight text-fg-muted">
          Auto-bridge &amp; swap to any chain
        </span>
      </span>
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
          enabled ? 'bg-primary' : 'bg-line-strong',
        )}
        aria-hidden
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-canvas shadow-sm transition-[left]',
            enabled ? 'left-[18px]' : 'left-0.5',
          )}
        />
      </span>
    </button>
  );
}

function LabeledPicker({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
        {label}
      </span>
      {children}
    </div>
  );
}

/**
 * Solid primary CTA — matches the deposit flow's submit button so the app's
 * color identity stays consistent across modes.
 */
export function WithdrawFundsButton({
  disabled,
  isBusy,
  onClick,
  label = 'Withdraw Funds',
}: {
  disabled?: boolean;
  isBusy?: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isBusy}
      className={cn(
        'flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border-0 bg-primary px-5 py-3.5 text-[15px] font-semibold text-white shadow-md transition-[background-color,opacity] duration-150 hover:bg-primary-hover',
        (disabled || isBusy) && 'cursor-not-allowed opacity-55 hover:bg-primary',
      )}
    >
      {isBusy && (
        <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin-epoch rounded-full border-2 border-white border-t-transparent" />
      )}
      {label}
      {!isBusy && <span aria-hidden>→</span>}
    </button>
  );
}
