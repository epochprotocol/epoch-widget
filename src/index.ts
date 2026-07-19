export { EpochIntentWidget } from './EpochIntentWidget';
export { CHAIN_DOT, chainDotColor } from './chain-colors';
export {
  EPOCH_SUPPORTED_CHAINS,
  EPOCH_TESTNET_CHAINS,
  EPOCH_SUPPORTED_TOKENS,
  EPOCH_TESTNET_TOKENS,
  getEpochChains,
  getEpochTokensByChainEnv,
  getEpochTokensBySymbol,
  getEpochChainById,
  getChainName,
} from './epoch-config';
export type {
  EpochIntentWidgetProps,
  IntentConfig,
  IntentProps,
  ApiConfig,
  EpochClassNames,
  IntentSentPayload,
  IntentCompletePayload,
  EpochTheme,
  EpochChain,
  EpochToken,
  WidgetFlow,
  WidgetMode,
  EpochEarnMarket,
  EpochEarnPosition,
  EarnDepositIntentDefaults,
  EarnWithdrawIntentDefaults,
  EarnMidenAdapter,
  EarnMidenAsset,
  OneDeltaConfig,
  OneDeltaMarketRow,
  OneDeltaUnderlyingAsset,
  OnStartCtx,
  OnSignCtx,
  OnSuccessCtx,
  OnErrorCtx,
  OnStatusCtx,
  WidgetLifecycleStatus,
  RoutingAndLiquidityOptions,
} from './types';
export { DEFAULT_THEME, LIGHT_THEME, DARK_THEME, resolveTheme, themeToCssVars } from './theme';
export { cn } from './lib/cn';
export { MIDEN_VIRTUAL_CHAIN_ID, DEFAULT_MIDEN_FAUCET, midenFaucetKey, isDefaultMidenFaucet, getMidenGraphTokens } from './earn/miden';
export type { MidenGraphToken } from './earn/miden';
export { useEarnMarkets, useUserPositions, useEarnConfigs, useLendingPools, DEFAULT_EARN_CONFIGS } from './earn/api';
export { HARDCODED_ONEDELTA_CONFIGS, chainLabelFor } from './earn/onedelta-markets';
export { toEpochEarnMarket, flattenConfigsToMarkets } from './earn/onedelta-adapter';
export { buildPayIntentFromFlatProps } from './pay/build-pay-intent';
export { buildEarnDepositIntent } from './earn/build-deposit-intent';
export { buildEarnWithdrawIntent } from './earn/build-withdraw-intent';
export { formatAmount, truncateAddress } from './utils';
export {
  resolveApiForNetwork,
  DEFAULT_TESTNET_API_BASE_URL,
  DEFAULT_TESTNET_POSITIONS_BASE_URL,
} from './resolve-api-config';
// UI primitives — exported so consumers can compose against the same design
// system without re-importing from internal paths.
export {
  Card,
  Pill,
  TokenAvatar,
  Skeleton,
  Stat,
  SegmentedTabs,
  RowAccordion,
  SearchInput,
  FilterDropdown,
  TokenAmountCard,
} from './components/ui';
export type {
  PillVariant,
  PillSize,
  SegmentedTab,
  FilterOption,
} from './components/ui';
export type { PaySwapTokenWithChain } from './types';

// ---------------------------------------------------------------------------
// Headless SDK pass-through. Consumers who want the business logic without
// the React UI can install `@epoch-protocol/epoch-flows-sdk` directly, or
// import from the widget package as a convenience.
// ---------------------------------------------------------------------------
export {
  EpochFlowsSDK,
  EarnSession,
  PaySession,
  fetchLendingPools,
  fetchUserPositions,
  fetchTokenBalanceOnChain,
} from '@epoch-protocol/epoch-flows-sdk';
export type {
  EarnIntentFlowStatus,
  EarnQuote,
  EarnQuoteInput,
  EarnSubmitInput,
  PayIntentFlowStatus,
  PaySubmitInput,
} from '@epoch-protocol/epoch-flows-sdk';
