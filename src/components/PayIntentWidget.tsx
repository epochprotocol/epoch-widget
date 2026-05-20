import { PaySwapIntentWidget, type PaySwapIntentWidgetProps } from './PaySwapIntentWidget';

export type PayIntentWidgetProps = Omit<PaySwapIntentWidgetProps, 'variant'>;

/**
 * Pay flow — cross-chain payment with a fixed destination. Visual cues:
 * - Primary blue accent, "You pay" / "You receive" copy
 * - Downward arrow connector between source + destination cards
 * - Rendered through `PayIntentSummary` (a separate file you can fork in
 *   isolation without affecting Swap or Earn).
 *
 * Logic is shared with Swap via `PaySwapIntentWidget` (intent SDK, wallet
 * client, quote/submit). Edit `PayIntentSummary.tsx` for Pay-only visual
 * tweaks; edit this file for Pay-only behavioural defaults.
 */
export function PayIntentWidget({ title, submitButtonText, ...rest }: PayIntentWidgetProps) {
  return (
    <PaySwapIntentWidget
      variant="pay"
      title={title ?? 'Pay'}
      submitButtonText={submitButtonText ?? 'Pay'}
      {...rest}
    />
  );
}
