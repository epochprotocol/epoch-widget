import type { EpochChain, EpochToken } from '../types';

export type EarnCtaAction =
  | 'connect'
  | 'connectMiden'
  | 'switch'
  | 'submit'
  | 'disabled'
  | 'retry';

export interface EarnCtaState {
  action: EarnCtaAction;
  label: string;
  tone?: 'primary' | 'warning';
}

export interface ResolveEarnCtaParams {
  earnTab: 'deposit' | 'withdraw';
  fundingSource: 'evm' | 'miden';
  /** Flow status, narrowed to what the CTA cares about. */
  flow: {
    isQuoting: boolean;
    status: string;
    quoteError: string | null;
  };
  isConnected: boolean;
  midenConnected: boolean;
  hasSelectedMarket: boolean;
  depositAmount: string;
  hasSelectedPosition: boolean;
  withdrawAmount: string;
  availableChains: EpochChain[];
  selectedChain: EpochChain | null | undefined;
  effectiveSourceChainId: number | null;
  effectiveSourceToken: EpochToken | null;
  isWrongNetwork: boolean;
  insufficientBalance: boolean;
  selectedToken: EpochToken | null;
  insufficientMidenBalance: boolean;
  midenAssetSymbol: string | undefined;
  /** The active tab's intent built cleanly. */
  buildOk: boolean;
  /** Smart Withdraw destination still equals the position's own chain + token. */
  isSmartWithdrawDegenerate: boolean;
  /** Miden destination picked but no Miden account connected. */
  midenSmartDestNotReady: boolean;
  isCrossChain: boolean;
  submitButtonText?: string;
}

/**
 * Decides what the primary button says and does.
 *
 * Order matters: the checks run cheapest-and-most-blocking first, so an
 * in-flight quote or an unconnected wallet always wins over a downstream
 * complaint about the amount. Pure and free of React so it can be reasoned
 * about — and tested — on its own.
 */
export function resolveEarnCta({
  earnTab,
  fundingSource,
  flow,
  isConnected,
  midenConnected,
  hasSelectedMarket,
  depositAmount,
  hasSelectedPosition,
  withdrawAmount,
  availableChains,
  selectedChain,
  effectiveSourceChainId,
  effectiveSourceToken,
  isWrongNetwork,
  insufficientBalance,
  selectedToken,
  insufficientMidenBalance,
  midenAssetSymbol,
  buildOk,
  isSmartWithdrawDegenerate,
  midenSmartDestNotReady,
  isCrossChain,
  submitButtonText,
}: ResolveEarnCtaParams): EarnCtaState {
  if (flow.isQuoting) return { action: 'disabled', label: 'Fetching quote…' };
  if (flow.status === 'submitting') {
    return {
      action: 'disabled',
      label: earnTab === 'deposit' ? 'Depositing…' : 'Withdrawing…',
    };
  }
  if (flow.status === 'complete') return { action: 'disabled', label: 'Completed' };

  if (!isConnected) return { action: 'connect', label: 'Connect wallet' };
  if (earnTab === 'deposit' && fundingSource === 'miden' && !midenConnected) {
    return { action: 'connectMiden', label: 'Connect Miden wallet' };
  }

  if (earnTab === 'deposit' && !hasSelectedMarket) {
    return { action: 'disabled', label: 'Select market' };
  }
  if (earnTab === 'deposit' && !depositAmount.trim()) {
    return { action: 'disabled', label: 'Enter an amount' };
  }
  if (earnTab === 'withdraw' && !hasSelectedPosition) {
    return { action: 'disabled', label: 'Select a position' };
  }
  if (earnTab === 'withdraw' && !withdrawAmount.trim()) {
    return { action: 'disabled', label: 'Enter an amount' };
  }

  // Withdraw pins its source to the position's chain, which may not be the
  // chain the user picked — so resolve the switch target from the effective
  // source rather than the picker.
  const switchTargetChain =
    earnTab === 'withdraw'
      ? (availableChains.find((c) => c.id === effectiveSourceChainId) ??
        selectedChain)
      : selectedChain;
  if (isWrongNetwork && switchTargetChain) {
    return {
      action: 'switch',
      label: `Switch to ${switchTargetChain.name}`,
      tone: 'warning',
    };
  }

  if (insufficientBalance && selectedToken) {
    return {
      action: 'disabled',
      label: `Insufficient ${selectedToken.symbol} balance`,
    };
  }
  if (insufficientMidenBalance && midenAssetSymbol) {
    return {
      action: 'disabled',
      label: `Insufficient ${midenAssetSymbol} balance`,
    };
  }

  if (!buildOk || effectiveSourceChainId == null || !effectiveSourceToken) {
    return { action: 'disabled', label: 'Enter an amount' };
  }

  // Smart Withdraw is on but the destination still equals the position's own
  // chain + token — nothing to bridge or swap. Guide the user to configure a
  // real destination instead of surfacing the doomed quote's failure.
  if (isSmartWithdrawDegenerate) {
    return { action: 'disabled', label: 'Select a different chain or token' };
  }
  // Smart Withdraw → Miden, but no Miden account connected: the recipient is
  // missing so the quote is skipped. Prompt a connect rather than falling
  // through to an enabled button that would submit a malformed intent.
  if (midenSmartDestNotReady) {
    return { action: 'connectMiden', label: 'Connect Miden wallet' };
  }
  // Quote failed → don't expose Bridge + Deposit; the user must re-quote first.
  // Tone stays primary so retry reads as the next action — the inline error
  // already carries the failure semantics.
  if (flow.quoteError) return { action: 'retry', label: 'Retry quote' };

  const baseLabel =
    submitButtonText ?? (earnTab === 'deposit' ? 'Deposit' : 'Withdraw');
  if (earnTab === 'deposit') {
    if (fundingSource === 'miden') {
      return { action: 'submit', label: `Bridge from Miden + ${baseLabel}` };
    }
    if (isCrossChain) {
      return { action: 'submit', label: `Bridge + ${baseLabel}` };
    }
  }
  return { action: 'submit', label: baseLabel };
}

/** Actions the user can actually click. */
export function isEarnCtaEnabled(action: EarnCtaAction): boolean {
  return (
    action === 'submit' ||
    action === 'switch' ||
    action === 'retry' ||
    action === 'connectMiden'
  );
}
