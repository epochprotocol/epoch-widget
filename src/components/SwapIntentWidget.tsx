import { PaySwapIntentWidget, type PaySwapIntentWidgetProps } from './PaySwapIntentWidget';

export type SwapIntentWidgetProps = Omit<PaySwapIntentWidgetProps, 'variant'>;

/**
 * Swap flow — cross-chain swap between two tokens. Visual cues:
 * - Teal accent on the destination card with a top-edge accent stripe
 * - "From" / "To" copy
 * - Swap-flip connector glyph (↕) between source + destination cards
 * - Rendered through `SwapIntentSummary` (a separate file you can fork in
 *   isolation without affecting Pay or Earn).
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
