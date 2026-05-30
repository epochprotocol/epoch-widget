import type { EpochTheme } from './theme';

// ---------------------------------------------------------------------------
// Re-exports — domain types live in @epoch-protocol/epoch-flows-sdk now.
// Existing widget imports of `EpochChain`, `IntentProps`, etc. keep working
// via this barrel so component code never knows the move happened.
// ---------------------------------------------------------------------------

export type {
  ApiConfig,
  EarnDepositIntentDefaults,
  EarnWithdrawIntentDefaults,
  EpochChain,
  EpochEarnMarket,
  EpochEarnPosition,
  EpochEarnPositionsSummary,
  EpochToken,
  IntentCompletePayload,
  IntentConfig,
  IntentProps,
  IntentSentPayload,
  OnErrorCtx,
  OnSignCtx,
  OnStartCtx,
  OnSuccessCtx,
  OneDeltaConfig,
  OneDeltaMarketRow,
  OneDeltaTokenRisk,
  OneDeltaUnderlyingAsset,
  SessionCtx,
  WidgetFlow,
  WidgetMode,
} from '@epoch-protocol/epoch-flows-sdk';

import type {
  ApiConfig,
  EarnDepositIntentDefaults,
  EarnWithdrawIntentDefaults,
  EpochChain,
  EpochEarnMarket,
  EpochToken,
  IntentProps,
  IntentSentPayload,
  IntentCompletePayload,
  OnErrorCtx,
  OnSignCtx,
  OnStartCtx,
  OnSuccessCtx,
  SessionCtx,
  OneDeltaConfig,
  WidgetFlow,
  WidgetMode,
} from '@epoch-protocol/epoch-flows-sdk';

/**
 * Token + originating chain combo used by the source-token picker and by
 * integrator `sourceTokenFilter` predicates.
 */
export interface PaySwapTokenWithChain extends EpochToken {
  chain: EpochChain;
}

// ---------------------------------------------------------------------------
// Widget-only types — UI presentation concerns the headless SDK doesn't know
// about. These stay in the widget.
// ---------------------------------------------------------------------------

/**
 * Class name overrides for every visual slot in the widget. When a className
 * is provided for a slot, the widget skips its default inline styles for that
 * element — giving the consumer full CSS control (vanilla, Tailwind, modules).
 *
 * @example Tailwind
 * ```tsx
 * classNames={{
 *   button: 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold',
 *   container: 'bg-white shadow-2xl rounded-2xl max-w-md',
 * }}
 * ```
 */
export interface EpochClassNames {
  // Layout
  overlay?: string;
  container?: string;
  header?: string;
  body?: string;
  footer?: string;
  // Receive section
  receiveCard?: string;
  receiveAmount?: string;
  receiveLabel?: string;
  // Pay section
  payCard?: string;
  payAmount?: string;
  payLabel?: string;
  // Controls
  button?: string;
  chainSelector?: string;
  tokenSelector?: string;
  // Feedback
  banner?: string;
  progress?: string;
}

/** Lifecycle status emitted by the widget for `onStatus`. */
export type WidgetLifecycleStatus =
  | 'idle'
  | 'submitting'
  | 'sent'
  | 'polling'
  | 'complete'
  | 'error';

export interface OnStatusCtx extends SessionCtx {
  status: WidgetLifecycleStatus;
  progress: number;
  activeStep: number;
}

// ---------------------------------------------------------------------------
// Widget props
// ---------------------------------------------------------------------------

export interface EpochIntentWidgetProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Called when the user dismisses the dialog. */
  onClose: () => void;

  // ---- Mode -----------------------------------------------------------------

  mode?: WidgetMode;
  /** Legacy alias for `mode`. */
  flow?: WidgetFlow;

  // ---- Pay (nested OR flat) -------------------------------------------------

  intent?: IntentProps;

  toAddress?: `0x${string}`;
  toAmount?: string;
  toChainId?: number;
  toToken?: `0x${string}`;
  toTokenDecimals?: number;
  toTokenSymbol?: string;

  // ---- Pay / Swap source-side scoping --------------------------------------

  /**
   * Restrict the source chain picker to these chain IDs. Default: every chain
   * the SDK knows about for the active `network` env.
   */
  sourceChainIds?: number[];
  /**
   * Predicate applied to every (chain, token) candidate after `sourceChainIds`
   * filtering. Return `false` to hide. Receives the same `TokenWithChain`
   * shape consumed by the internal token picker.
   */
  sourceTokenFilter?: (token: PaySwapTokenWithChain) => boolean;
  /**
   * Pre-select this chain on first open. Must be present in `sourceChainIds`
   * (when set) or it falls back to the first available chain.
   */
  defaultSourceChainId?: number;
  /**
   * Pre-select this token address on first open. Requires
   * `defaultSourceChainId` to be set; otherwise ignored.
   */
  defaultSourceTokenAddress?: `0x${string}`;
  /**
   * Pay-mode only. Render the destination-token pill as a clickable picker.
   * Default `true` — destination stays pinned to whatever the integrator
   * passed in `intent.requiredToken`. When `false`, the user can pick any
   * token on any chain from the current env (mainnet or testnet) and the
   * widget overrides `requiredToken` + `intentConfig.destinationChainId` on
   * submit/quote.
   *
   * **Ignored when `mode === 'swap'`** — Swap UX always lets the user pick
   * what they receive; the prop is force-disabled internally for Swap.
   */
  lockDestinationToken?: boolean;
  /**
   * Override the CTA button copy for every state. Each field is independently
   * overridable; missing fields fall back to the built-in default.
   */
  ctaLabels?: Partial<{
    submit: string;
    switchNetwork: (chainName: string) => string;
    quoting: string;
    preparing: string;
    signing: string;
    submitting: string;
    polling: string;
    complete: string;
    insufficientBalance: (tokenSymbol: string) => string;
    configureRequired: string;
  }>;
  /**
   * Optional async resolver that returns the USD spot price for a given
   * (chainId, token). Result is cached per `(chainId, address)` for the
   * lifetime of the widget. When omitted, the widget renders no "≈ $…" line.
   */
  usdPriceFor?: (token: { chainId: number; address: string; symbol: string }) =>
    | number
    | null
    | Promise<number | null>;

  // ---- Earn -----------------------------------------------------------------

  earnDefaultTab?: 'deposit' | 'withdraw';
  earnHideTabs?: boolean;
  earnDepositDefaults?: EarnDepositIntentDefaults;
  earnWithdrawDefaults?: EarnWithdrawIntentDefaults;
  /** @deprecated Markets now come from the internal hook. */
  earnMarkets?: EpochEarnMarket[];
  earnMarketsSource?: OneDeltaConfig[];
  earnSolverUrl?: string;
  /**
   * Chain IDs to fan /pools fetches over. One request per chain ID. Default:
   * `[1, 8453, 42161, 10, 137]`. Pass a single chain to scope the picker.
   */
  earnChainIds?: number[];
  /**
   * CSV of 1delta lender keys to restrict /pools to (e.g.
   * `"AAVE_V3,COMPOUND_V3_USDC"`). Forwarded verbatim as the `lender` query
   * param. Omit to include every lender.
   */
  earnLenderFilter?: string;
  /** Max rows per chain returned by /pools (1delta `count`). Default 100. */
  earnPoolsPerChain?: number;
  /** /pools sort field. Default `totalDepositsUsd`. */
  earnPoolsSortBy?:
    | 'depositRate'
    | 'variableBorrowRate'
    | 'totalDepositsUsd'
    | 'totalLiquidityUsd'
    | 'utilization';
  /** /pools sort direction. Default `DESC`. */
  earnPoolsSortDir?: 'ASC' | 'DESC';
  /** @deprecated retained for backwards compatibility. */
  earnUseMockData?: boolean;

  // ---- API ------------------------------------------------------------------

  api: ApiConfig;

  // ---- Network --------------------------------------------------------------

  network?: 'mainnet' | 'testnet';
  allowNetworkToggle?: boolean;

  // ---- Rendering ------------------------------------------------------------

  renderInline?: boolean;

  // ---- Callbacks ------------------------------------------------------------

  onOpen?: () => void;
  onStart?: (ctx: OnStartCtx) => void;
  onSign?: (ctx: OnSignCtx) => void;
  onSuccess?: (ctx: OnSuccessCtx) => void;
  onError?: (ctx: OnErrorCtx) => void;
  onStatus?: (ctx: OnStatusCtx) => void;

  onIntentSent?: (data: IntentSentPayload) => void;
  onIntentComplete?: (data: IntentCompletePayload) => void;

  /** Fires whenever the user (or default) picks a different source chain/token. */
  onSourceTokenChange?: (sel: { chainId: number; tokenAddress: `0x${string}` }) => void;
  /**
   * Fires once per quote settle (success or failure). Only relevant when the
   * intent has `fixedOutput: true`.
   */
  onQuote?: (quote: {
    sourceChainId: number;
    sourceTokenAddress: `0x${string}`;
    paySymbol: string;
    payAmount: string | null;
    payAmountRaw: bigint | null;
    error?: string;
  }) => void;

  // ---- Customisation --------------------------------------------------------

  title?: string;
  submitButtonText?: string;
  classNames?: EpochClassNames;
  theme?: 'light' | 'dark' | EpochTheme;
}

export type { EpochTheme } from './theme';
