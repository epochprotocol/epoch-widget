import { cn } from '../lib/cn';
import type { EpochEarnPosition } from '../types';
import { SmartWithdrawDestination } from './withdraw/SmartWithdrawDestination';
import { SmartWithdrawToggle } from './withdraw/SmartWithdrawToggle';
import { WithdrawAmountCard } from './withdraw/WithdrawAmountCard';
import { WithdrawFromCard } from './withdraw/WithdrawFromCard';

interface Props {
  position: EpochEarnPosition;
  amount: string;
  onAmountChange: (v: string) => void;
  onPickFraction: (humanAmount: string) => void;
  smartWithdraw: boolean;
  onSmartWithdrawChange: (next: boolean) => void;
  smartDestChainId: number | null;
  smartDestTokenAddress: string;
  onPickDestChain: (chainId: number) => void;
  onPickDestToken: (address: string) => void;
  /** Must match the active network or SIO rejects the destination with
   *  CHAIN_NOT_SUPPORTED — mainnet chains aren't in the testnet graph. */
  isTestnet: boolean;
  buildError: string | null;
  quoteError: string | null;
  isQuoting: boolean;
  approxUsd?: number | null;
  onPickAnotherPosition?: () => void;
  /** Offer Miden as a Smart Withdraw destination (needs a connected account). */
  midenDestEnabled?: boolean;
  midenRecipientAccount?: string | null;
  /** `value` is the faucet id. */
  midenFaucets?: { faucetId: string; symbol: string; logoURI?: string }[];
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
  isTestnet,
  buildError,
  quoteError,
  isQuoting,
  approxUsd,
  onPickAnotherPosition,
  midenDestEnabled = false,
  midenRecipientAccount,
  midenFaucets,
}: Props) {
  const { market } = position;
  const balanceRaw = (() => {
    try {
      return BigInt(position.withdrawableRaw ?? position.underlyingBalanceRaw);
    } catch {
      return 0n;
    }
  })();

  const inlineError = buildError ?? quoteError;
  const aprPct = Number.isFinite(market.aprDecimal)
    ? market.aprDecimal * 100
    : null;
  const sublabel = [market.lenderName ?? market.lenderKey, market.chainLabel]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex flex-col gap-3.5">
      <WithdrawFromCard
        tokenSymbol={market.token.symbol}
        tokenLogoURI={market.token.logoURI}
        sublabel={sublabel}
        aprPct={aprPct}
        onClick={onPickAnotherPosition}
      />

      <WithdrawAmountCard
        tokenSymbol={market.token.symbol}
        tokenLogoURI={market.token.logoURI}
        chainName={market.chainLabel}
        decimals={market.token.decimals}
        amount={amount}
        onAmountChange={onAmountChange}
        balanceRaw={balanceRaw}
        onPickFraction={onPickFraction}
        approxUsd={approxUsd}
      />

      <SmartWithdrawToggle
        enabled={smartWithdraw}
        onChange={onSmartWithdrawChange}
      />

      {smartWithdraw && (
        <SmartWithdrawDestination
          smartDestChainId={smartDestChainId}
          smartDestTokenAddress={smartDestTokenAddress}
          onPickDestChain={onPickDestChain}
          onPickDestToken={onPickDestToken}
          isTestnet={isTestnet}
          midenDestEnabled={midenDestEnabled}
          midenRecipientAccount={midenRecipientAccount}
          midenFaucets={midenFaucets}
        />
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
