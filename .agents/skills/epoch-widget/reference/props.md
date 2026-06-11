# Props reference

## EpochIntentWidgetProps

Required: `isOpen`, `onClose`, `api`. Everything else optional.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `isOpen` | `boolean` | — | **Required.** Visibility. |
| `onClose` | `() => void` | — | **Required.** Dismiss handler. |
| `api` | `ApiConfig` | — | **Required.** `{ baseUrl, rpcUrls?, positionsBaseUrl? }`. |
| `mode` | `'pay' \| 'swap' \| 'earn'` | `'pay'` | Flow selector. |
| `flow` | same | — | Legacy alias for `mode`. |
| `intent` | `IntentProps` | — | Nested pay/swap intent. |
| `toAddress` / `toAmount` / `toChainId` / `toToken` / `toTokenDecimals` / `toTokenSymbol` | flat | — | Flat-pay shorthand (alternative to `intent`). `toAmount` is a decimal string. |
| `sourceChainIds` | `number[]` | all | Restrict source chain picker. |
| `sourceTokenFilter` | `(t: PaySwapTokenWithChain) => boolean` | — | Hide source candidates. |
| `defaultSourceChainId` | `number` | — | Pre-select source chain. |
| `defaultSourceTokenAddress` | `` `0x${string}` `` | — | Pre-select source token (needs `defaultSourceChainId`). |
| `lockDestinationToken` | `boolean` | `true` | Pay-only; `false` lets user re-pick destination. Forced off in swap. |
| `usdPriceFor` | `(t:{chainId,address,symbol}) => number\|null\|Promise<number\|null>` | — | Resolver for "≈ $…" line. |
| `ctaLabels` | `Partial<{submit, switchNetwork, quoting, preparing, signing, submitting, polling, complete, insufficientBalance, configureRequired}>` | — | Per-state CTA copy. |
| `earnDefaultTab` | `'deposit' \| 'withdraw'` | `'deposit'` | Earn starting tab. |
| `earnHideTabs` | `boolean` | `false` | Hide deposit/withdraw tabs. |
| `earnMarketsSource` | `OneDeltaConfig[]` | — | Static market configs (e.g. `HARDCODED_ONEDELTA_CONFIGS`). |
| `earnDepositDefaults` / `earnWithdrawDefaults` | `{protocol?, action?, extraDataTypestring?}` | — | Override earn intent fields. |
| `earnChainIds` | `number[]` | `[1,8453,42161,10,137]` | Chains for live `/pools`. |
| `earnLenderFilter` | `string` | — | CSV of 1delta lender keys. |
| `earnPoolsPerChain` | `number` | `100` | Max rows per chain. |
| `earnPoolsSortBy` | `'depositRate'\|'variableBorrowRate'\|'totalDepositsUsd'\|'totalLiquidityUsd'\|'utilization'` | `totalDepositsUsd` | Pool sort. |
| `earnPoolsSortDir` | `'ASC' \| 'DESC'` | `DESC` | Pool sort direction. |
| `earnSolverUrl` | `string` | — | Earn solver override. |
| `network` | `'mainnet' \| 'testnet'` | `'mainnet'` | Network env. |
| `allowNetworkToggle` | `boolean` | `false` | In-widget network toggle. |
| `renderInline` | `boolean` | `false` | Render inline vs modal overlay. |
| `theme` | `'light' \| 'dark' \| EpochTheme` | `'light'` | Preset or token overrides. |
| `classNames` | `EpochClassNames` | — | Per-slot class overrides. |
| `title` / `submitButtonText` | `string` | — | Header + CTA copy. |
| `onOpen`/`onStart`/`onSign`/`onSuccess`/`onError`/`onStatus` | callbacks | — | Lifecycle. |
| `onIntentSent`/`onIntentComplete` | callbacks | — | Submit / settle payloads. |
| `onSourceTokenChange`/`onQuote` | callbacks | — | Source selection + quote. |

Deprecated: `earnMarkets` → use `earnMarketsSource`; `earnUseMockData` → no-op.

## IntentProps

```ts
interface IntentProps {
  requiredToken: { address: string; symbol: string; decimals: number };
  requiredAmount: bigint;            // ATOMIC UNITS
  config: IntentConfig;
  destinationChainName?: string;
  positionLabel?: string;            // shown in the summary
  receiver?: `0x${string}`;
}
```

## IntentConfig

```ts
interface IntentConfig {
  protocol: string;                  // 'transfer'|'swap'|'bridge' → simple route; else protocol interaction
  action: string;                    // 'pay' | 'swap' | 'buyTicket' | 'deposit' | …
  protocolHashIdentifier?: string;   // override keccak256(protocol)
  extraDataTypestring?: string;      // ABI-style typestring for extraData
  extraData?: Record<string, string | boolean | number | bigint>;
  fixedOutput?: boolean;             // true = deliver exactly requiredAmount; user pays quoted input
  destinationChainId?: number;       // mainnet destination
  destinationTestnetChainId?: number;// testnet destination (used when network === 'testnet')
  slippageBps?: number;              // output slippage; default 100 (1%); 0 = strict
}
```

## Callback payloads

```ts
OnStartCtx   = { sessionId: string; mode: 'pay'|'swap'|'earn' }
OnSignCtx    = { sessionId: string }
OnSuccessCtx = { sessionId: string; nonce: string; status?: unknown }
OnErrorCtx   = { sessionId: string; error: Error }
OnStatusCtx  = { sessionId: string; status: WidgetLifecycleStatus; progress: number; activeStep: number }
IntentSentPayload     = { nonce: string }
IntentCompletePayload = { nonce: string; status: unknown }
onQuote payload = { sourceChainId, sourceTokenAddress, paySymbol, payAmount: string|null, payAmountRaw: bigint|null, error? }
```

Lifecycle status: `'idle' | 'submitting' | 'sent' | 'polling' | 'complete' | 'error'`.

## Notable exports

```ts
import {
  EpochIntentWidget,
  // theme
  DEFAULT_THEME, LIGHT_THEME, DARK_THEME, resolveTheme, themeToCssVars,
  // registries + helpers
  EPOCH_SUPPORTED_CHAINS, EPOCH_TESTNET_CHAINS, EPOCH_SUPPORTED_TOKENS, EPOCH_TESTNET_TOKENS,
  getEpochChains, getEpochChainById, getChainName, getEpochTokensByChainEnv, getEpochTokensBySymbol,
  // earn data
  useEarnMarkets, useUserPositions, useEarnConfigs, useLendingPools,
  HARDCODED_ONEDELTA_CONFIGS, chainLabelFor, toEpochEarnMarket, flattenConfigsToMarkets,
  // builders + utils
  buildPayIntentFromFlatProps, buildEarnDepositIntent, buildEarnWithdrawIntent,
  formatAmount, truncateAddress, cn,
  // UI primitives
  Card, Pill, TokenAvatar, Skeleton, Stat, SegmentedTabs, RowAccordion, SearchInput, FilterDropdown, TokenAmountCard,
  // headless SDK pass-through
  EpochFlowsSDK, PaySession, EarnSession,
} from '@epoch-protocol/epoch-intent-widget';
```
