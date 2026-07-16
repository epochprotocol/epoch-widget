import type { ReactNode } from 'react';
import type { EpochClassNames } from '../types';
import { PayIntentSummary } from '../components/PayIntentSummary';
import { SwapIntentSummary } from '../components/SwapIntentSummary';

export type PaySwapVariant = 'pay' | 'swap';

/** Everything the summary needs, independent of which flow renders it. */
export interface SummaryContext {
  /** What the user hands over. Resolved from a quote on fixed-output flows. */
  payAmount: string;
  paySymbol: string;
  /** Source token/chain pill — doubles as the "change source" trigger. */
  payTokenPill?: ReactNode;
  /** What the user ends up with. */
  receiveAmount: string;
  receiveSymbol: string;
  receiveTokenPill?: ReactNode;
  destinationChainName?: string;
  /** Pay-only: the human label and recipient for a pinned destination. */
  positionLabel?: string;
  recipientAddress?: string;
  walletAddress?: string;
  walletIcon?: string;
  walletConnected: boolean;
  isQuoting: boolean;
  balanceStr?: string;
  balanceError: boolean;
  isBalanceLoading: boolean;
  usdEquivalent: string | null;
  classNames?: EpochClassNames;
}

/**
 * The parts of the Pay/Swap widget that differ between the two flows.
 *
 * The widget used to ask `variant === 'swap'` in six places — copy, defaults,
 * and which summary to mount. Adding a third flow meant finding every one of
 * them. Now a flow is a row in this table, and the widget never branches.
 */
export interface PaySwapVariantSpec {
  /** Titles the modal and seeds the submit label: "Pay" / "Swap Aave USDC". */
  verb: string;
  /**
   * Swap always lets the user choose what they receive, so it ignores an
   * integrator's `lockDestinationToken`. Pay honours it.
   */
  ignoresDestinationLock: boolean;
  /** Shown when the integrator hasn't supplied a resolvable intent. */
  configureLabel: string;
  successMessage: string;
  /**
   * Whether the summary may fall back to the chain we resolved from the id.
   *
   * Pay pins its destination, so the integrator's `destinationChainName` is the
   * only label worth showing — inventing one from the id would contradict a
   * deliberately-set label. Swap lets the user move the destination, so a
   * resolved name beats showing nothing.
   */
  fallsBackToResolvedChainName: boolean;
  renderSummary: (ctx: SummaryContext) => ReactNode;
}

export const PAY_SWAP_VARIANTS: Record<PaySwapVariant, PaySwapVariantSpec> = {
  pay: {
    verb: 'Pay',
    ignoresDestinationLock: false,
    configureLabel: 'Configure payment',
    successMessage: 'Intent executed successfully.',
    fallsBackToResolvedChainName: false,
    renderSummary: (ctx) => (
      <PayIntentSummary
        receiveAmount={ctx.receiveAmount}
        receiveSymbol={ctx.receiveSymbol}
        positionLabel={ctx.positionLabel}
        destinationChainName={ctx.destinationChainName}
        recipientAddress={ctx.recipientAddress}
        payAmount={ctx.payAmount}
        paySymbol={ctx.paySymbol}
        tokenSelectorTrigger={ctx.payTokenPill}
        walletAddress={ctx.walletAddress}
        walletIcon={ctx.walletIcon}
        walletConnected={ctx.walletConnected}
        isQuoting={ctx.isQuoting}
        balanceStr={ctx.balanceStr}
        balanceError={ctx.balanceError}
        isBalanceLoading={ctx.isBalanceLoading}
        usdEquivalent={ctx.usdEquivalent}
        classNames={ctx.classNames}
      />
    ),
  },
  swap: {
    verb: 'Swap',
    ignoresDestinationLock: true,
    configureLabel: 'Configure swap',
    successMessage: 'Swap completed successfully.',
    fallsBackToResolvedChainName: true,
    renderSummary: (ctx) => (
      <SwapIntentSummary
        sellAmount={ctx.payAmount}
        sellSymbol={ctx.paySymbol}
        sellTokenPill={ctx.payTokenPill}
        buyAmount={ctx.receiveAmount}
        buyTokenPill={ctx.receiveTokenPill}
        destinationChainName={ctx.destinationChainName}
        isQuoting={ctx.isQuoting}
        balanceStr={ctx.balanceStr}
        balanceError={ctx.balanceError}
        isBalanceLoading={ctx.isBalanceLoading}
        walletConnected={ctx.walletConnected}
        walletAddress={ctx.walletAddress}
        walletIcon={ctx.walletIcon}
        usdEquivalent={ctx.usdEquivalent}
        classNames={ctx.classNames}
      />
    ),
  },
};
