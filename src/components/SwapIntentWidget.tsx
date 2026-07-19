import { PaySwapIntentWidget, type PaySwapIntentWidgetProps } from './PaySwapIntentWidget';

export type SwapIntentWidgetProps = Omit<PaySwapIntentWidgetProps, 'variant'>;

/**
 * Swap flow — cross-chain swap between two tokens.
 *
 * Swap always lets the user pick what they receive, so it ignores
 * `lockDestinationToken`. Rendered through `SwapIntentSummary`: stacked
 * "You pay" / "You receive" cards with a down-arrow chip between them.
 *
 * Logic is shared with Pay via `PaySwapIntentWidget`. Edit
 * `SwapIntentSummary.tsx` for Swap-only visual tweaks; edit this file for
 * Swap-only behavioural defaults.
 */
export function SwapIntentWidget({ title, submitButtonText, ...rest }: SwapIntentWidgetProps) {
  return (
    <PaySwapIntentWidget
      variant="swap"
      title={title ?? 'Swap'}
      submitButtonText={submitButtonText ?? 'Swap'}
      {...rest}
    />
  );
}
