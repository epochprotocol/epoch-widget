import { useMemo, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { formatAmount, formatBalancePortionForInput } from '../utils';
import { getEpochChains, getEpochTokensByChainEnv } from '../epoch-config';
import type { EpochEarnPosition } from '../types';
import { Avatar } from './Avatar';
import { Dropdown, type DropdownOption } from './Dropdown';
import { ChevronRightIcon, SparklesIcon, TrendingUpIcon } from './Icons';
import { Pill } from './ui/Pill';

interface Props {
  position: EpochEarnPosition;
  amount: string;
  onAmountChange: (v: string) => void;
  /** 20% / 50% / Max. `isMax=true` only when the user picked the full balance. */
  onPickFraction: (humanAmount: string, isMax: boolean) => void;
  /** Smart Withdraw = route the withdrawn underlying through Epoch's intent
   *  network to a different chain or token. */
  smartWithdraw: boolean;
  onSmartWithdrawChange: (next: boolean) => void;
  smartDestChainId: number | null;
  smartDestTokenAddress: string;
  onPickDestChain: (chainId: number) => void;
  onPickDestToken: (address: string) => void;
  buildError: string | null;
  quoteError: string | null;
  isQuoting: boolean;
  approxUsd?: number | null;
  /** Tap on the From card → return to the position list. */
  onPickAnotherPosition?: () => void;
}

const FRACTIONS: { label: string; num: number; den: number; isMax: boolean }[] = [
  { label: '20%', num: 20, den: 100, isMax: false },
  { label: '50%', num: 50, den: 100, isMax: false },
  { label: 'Max', num: 1,  den: 1,   isMax: true  },
];

const SECTION_LABEL_CLASSES =
  'text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted';
const FRACTION_CHIP_CLASSES =
  'cursor-pointer rounded-full border border-line bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-fg-secondary transition-[background-color,border-color,color,transform] duration-100 hover:border-primary hover:text-primary active:scale-[0.96]';

function formatUsd(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  if (v >= 1) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (v >= 0.01) return `$${v.toFixed(4)}`;
  if (v > 0) return '<$0.01';
  return '$0.00';
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
  onPickAnotherPosition,
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
  const aprPct = Number.isFinite(market.aprDecimal) ? market.aprDecimal * 100 : null;
  const sublabel = [market.lenderName ?? market.lenderKey, market.chainLabel]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex flex-col gap-3.5">
      {/* ---- From card --------------------------------------------------- */}
      <FromCard
        tokenSymbol={market.token.symbol}
        tokenLogoURI={market.token.logoURI}
        sublabel={sublabel}
        aprPct={aprPct}
        onClick={onPickAnotherPosition}
      />

      {/* ---- Amount card ------------------------------------------------- */}
      <div
        className={cn(
          'rounded-md border border-line bg-surface px-4 py-3.5 transition-[border-color] duration-150',
          'focus-within:border-primary',
        )}
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <span className={SECTION_LABEL_CLASSES}>Amount</span>
          <TokenChainBadge
            tokenSymbol={market.token.symbol}
            tokenLogoURI={market.token.logoURI}
            chainName={market.chainLabel}
          />
        </div>

        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          aria-label={`Withdraw amount in ${market.token.symbol}`}
          className="block w-full border-0 bg-transparent p-0 text-[34px] font-bold leading-none -tracking-[0.03em] tabular-nums text-fg outline-none placeholder:text-fg-muted"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-fg-muted tabular-nums">
            <span>≈ {formatUsd(approxUsd)}</span>
            <span className="hidden sm:inline">Balance: {balanceHuman}</span>
          </div>
          <div className="flex gap-1.5">
            {FRACTIONS.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => applyFraction(f.num, f.den, f.isMax)}
                className={FRACTION_CHIP_CLASSES}
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

      {/* ---- Smart Withdraw --------------------------------------------- */}
      <SmartWithdrawToggle enabled={smartWithdraw} onChange={onSmartWithdrawChange} />

      {smartWithdraw && (
        <div className="grid animate-overlay-in grid-cols-2 gap-3">
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
        <div className="animate-overlay-in text-center text-[12.5px] text-fg-muted">
          Fetching quote…
        </div>
      )}
      {inlineError && (
        <div
          role="alert"
          className="animate-overlay-in rounded-sm border border-error bg-error-soft px-3 py-2 text-[12.5px] leading-snug text-error"
        >
          {inlineError}
        </div>
      )}
    </div>
  );
}

function FromCard({
  tokenSymbol,
  tokenLogoURI,
  sublabel,
  aprPct,
  onClick,
}: {
  tokenSymbol: string;
  tokenLogoURI?: string;
  sublabel: string;
  aprPct: number | null;
  onClick?: () => void;
}) {
  const isInteractive = !!onClick;
  const inner = (
    <>
      <div className="mb-2">
        <span className={SECTION_LABEL_CLASSES}>From</span>
      </div>
      <div className="flex items-center gap-3">
        <Avatar src={tokenLogoURI} label={tokenSymbol} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold text-fg">
            {tokenSymbol} position
          </div>
          {sublabel && (
            <div className="mt-0.5 truncate text-xs text-fg-muted">{sublabel}</div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {aprPct != null && (
            <Pill
              variant="success"
              size="sm"
              leading={<TrendingUpIcon width={11} height={11} />}
            >
              {aprPct.toFixed(aprPct >= 10 ? 1 : 2)}% APR
            </Pill>
          )}
          {isInteractive && (
            <span
              className="flex h-4 w-4 items-center justify-center text-fg-muted transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden
            >
              <ChevronRightIcon width={12} height={12} />
            </span>
          )}
        </div>
      </div>
    </>
  );

  const baseClass =
    'group block w-full rounded-md border border-line bg-surface px-4 py-3 text-left transition-[border-color,box-shadow] duration-150';

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Change position (currently ${tokenSymbol})`}
        className={cn(
          baseClass,
          'cursor-pointer hover:border-primary hover:shadow-[0_0_0_3px_var(--epoch-color-accent-soft)]',
        )}
      >
        {inner}
      </button>
    );
  }
  return <div className={baseClass}>{inner}</div>;
}

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
        <span className="block text-[13px] font-semibold leading-tight text-fg">
          Smart Withdraw
        </span>
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
      <span className={SECTION_LABEL_CLASSES}>{label}</span>
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
