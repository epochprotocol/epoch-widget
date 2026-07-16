import type { EpochIntentWidgetProps } from '../types';
import type { PaySwapVariant } from './pay-swap-variants';

/**
 * Lives here rather than beside the component so the engine hook can take it
 * without importing the component it powers.
 */
export type PaySwapIntentWidgetProps = Pick<
  EpochIntentWidgetProps,
  | 'isOpen'
  | 'onClose'
  | 'api'
  | 'network'
  | 'allowNetworkToggle'
  | 'allowGasless'
  | 'gasless'
  | 'classNames'
  | 'theme'
  | 'onIntentSent'
  | 'onIntentComplete'
  | 'onError'
  | 'onStart'
  | 'onSign'
  | 'onSuccess'
  | 'onStatus'
  | 'title'
  | 'submitButtonText'
  | 'renderInline'
  | 'intent'
  | 'toAddress'
  | 'toAmount'
  | 'toChainId'
  | 'toToken'
  | 'toTokenDecimals'
  | 'toTokenSymbol'
  | 'sourceChainIds'
  | 'sourceTokenFilter'
  | 'defaultSourceChainId'
  | 'defaultSourceTokenAddress'
  | 'lockDestinationToken'
  | 'ctaLabels'
  | 'usdPriceFor'
  | 'onSourceTokenChange'
  | 'onQuote'
  | 'routingAndLiquidityOptions'
> & {
  /** `pay` vs `swap` — same SDK path; selects the row in `PAY_SWAP_VARIANTS`. */
  variant: PaySwapVariant;
};
