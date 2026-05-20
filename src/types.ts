import type { EpochTheme } from './theme';

// ---------------------------------------------------------------------------
// Chain & token metadata
// ---------------------------------------------------------------------------

export interface EpochChain {
  id: number;
  name: string;
  network: string;
  rpcUrl?: string;
  logoURI?: string;
}

export interface EpochToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

// ---------------------------------------------------------------------------
// Intent configuration
// ---------------------------------------------------------------------------

export interface IntentConfig {
  /** Protocol identifier string, e.g. "raffles". Hashed with keccak256 internally. */
  protocol: string;
  /** Action identifier string, e.g. "buyTicket". Hashed with keccak256 internally. */
  action: string;
  /** Optional override for the protocol hash identifier sent to the solver. */
  protocolHashIdentifier?: string;
  /** ABI-encoded type string for extra fields, e.g. `"address raffleAddress,uint256 numberOfTickets"`. */
  extraDataTypestring?: string;
  /** Key-value pairs matching `extraDataTypestring`. */
  extraData?: Record<string, string | boolean | number | bigint>;
  /**
   * When true, `tokenInAmount` is submitted as 0 and the solver performs a
   * reverse quote to compute the required input.
   */
  fixedOutput?: boolean;
  /** Destination chain ID for mainnet flows (default: 8453). */
  destinationChainId?: number;
  /** Destination chain ID for testnet flows (default: 84532). */
  destinationTestnetChainId?: number;
}

// ---------------------------------------------------------------------------
// Grouped prop interfaces
// ---------------------------------------------------------------------------

/** Describes what the user is paying for across chains. */
export interface IntentProps {
  /** The token required on the destination chain. */
  requiredToken: { address: string; symbol: string; decimals: number };
  /** Amount of `requiredToken` needed, in raw units. */
  requiredAmount: bigint;
  /** Cross-chain intent configuration. */
  config: IntentConfig;
  /** Human-readable destination chain name, shown in the summary (e.g. "Base"). */
  destinationChainName?: string;
  /**
   * Human-readable label describing the position being purchased. Shown as the
   * primary text inside the "You receive" card — overrides the default
   * `<amount> <symbol>` rendering. Also used as a default for the modal header
   * and submit button when they are not explicitly set.
   *
   * @example "1 Raffle Ticket"
   * @example "500 USDC position on Aave"
   */
  positionLabel?: string;
  /** Optional final receiver address on the destination chain. Defaults to the connected wallet. */
  receiver?: `0x${string}`;
}

/** API / RPC endpoint configuration. */
export interface ApiConfig {
  /** Epoch allocator API base URL (e.g. `http://localhost:3000`). */
  baseUrl: string;
  /** Override RPC URLs by chain ID for on-chain reads. */
  rpcUrls?: Record<number, string>;
  /**
   * Base URL of the 1delta positions proxy service
   * (e.g. `http://localhost:4023`). When set, the Earn flow's Withdraw tab
   * fetches the user's open positions from `${positionsBaseUrl}/positions`
   * instead of using bundled mock data.
   */
  positionsBaseUrl?: string;
}

// ---------------------------------------------------------------------------
// Custom class names (CSS / Tailwind support)
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

// ---------------------------------------------------------------------------
// Callback payloads
// ---------------------------------------------------------------------------

export interface IntentSentPayload {
  nonce: string;
}

export interface IntentCompletePayload {
  nonce: string;
  status: unknown;
}

/** Lifecycle status emitted by the widget for `onStatus`. */
export type WidgetLifecycleStatus =
  | 'idle'
  | 'submitting'
  | 'sent'
  | 'polling'
  | 'complete'
  | 'error';

export interface SessionCtx {
  sessionId: string;
}

export interface OnStartCtx extends SessionCtx {
  /** Mirrors `mode` / `flow` on the widget (`pay`, `swap`, or `earn`). */
  mode: WidgetFlow;
}

export interface OnSignCtx extends SessionCtx {}

export interface OnSuccessCtx extends SessionCtx {
  nonce: string;
  status?: unknown;
}

export interface OnErrorCtx extends SessionCtx {
  error: Error;
}

export interface OnStatusCtx extends SessionCtx {
  status: WidgetLifecycleStatus;
  progress: number;
  activeStep: number;
}

// ---------------------------------------------------------------------------
// Earn flow (vault-style deposit)
// ---------------------------------------------------------------------------

/** High-level widget mode: `pay` / `swap` use the intent SDK path; `earn` uses allocator earn APIs. */
export type WidgetFlow = 'pay' | 'swap' | 'earn';

/** Alias matching the Trails-style public API (`mode="pay" | "swap" | "earn"`). */
export type WidgetMode = WidgetFlow;

/** One earn destination; usually comes from your allocator or static config. */
export interface EpochEarnMarket {
  id: string;
  displayName: string;
  chainLabel: string;
  /** APR as annual decimal, e.g. 0.04 = 4% */
  aprDecimal: number;
  vaultAddress: string;
  token: { address: string; symbol: string; decimals: number; logoURI?: string };
  destinationChainName: string;
  /** @deprecated earn is mainnet-only; kept for back-compat. Always `false`. */
  testnet?: boolean;
  /** Raw 1delta `marketUid` (e.g. "AAVE_V3:1:0xC02..."). Required for the 1delta solver path. */
  oneDeltaMarketUid?: string;
  /** Numeric chain ID derived from the 1delta config — used by the executor. */
  chainId?: number;
  /** Lender key (e.g. "AAVE_V3"). */
  lenderKey?: string;
  /** Display name for the lender (e.g. "Aave V3"). */
  lenderName?: string;
  /** Lender logo URL. */
  lenderLogoURI?: string;
}

/** Optional overrides for the vault-style intent built from `EpochEarnMarket` + amount. */
export interface EarnDepositIntentDefaults {
  protocol?: string;
  action?: string;
  extraDataTypestring?: string;
}

/** Optional overrides for the vault-style intent built from an `EpochEarnPosition` + amount. */
export interface EarnWithdrawIntentDefaults {
  protocol?: string;
  action?: string;
  extraDataTypestring?: string;
}

// ---------------------------------------------------------------------------
// 1delta lending data shapes
// ---------------------------------------------------------------------------

/** Underlying asset metadata from the 1delta /earn/markets/by-config payload. */
export interface OneDeltaUnderlyingAsset {
  name: string;
  symbol: string;
  address: string;
  chainId: string;
  logoURI: string | null;
  decimals: number;
  assetGroup: string;
  props?: unknown;
  currencyId?: string;
  intrinsicYield?: number | null;
}

/** Single collateral or borrowable market row inside a 1delta config. */
export interface OneDeltaMarketRow {
  marketUid: string;
  depositRate: number;
  variableBorrowRate: number;
  utilization: number;
  totalDepositsUsd: number;
  totalLiquidityUsd: number;
  borrowLiquidityUsd: number;
  collateralFactor: number;
  intrinsicYield: number | null;
  underlyingInfo: {
    asset: OneDeltaUnderlyingAsset;
    prices: {
      priceUsd: number;
      priceTs?: string;
      priceTs24h?: string;
      priceUsd24h?: number;
    };
    tokenRisk: { riskLabel: string; riskScore: number };
    oraclePrice?: { oraclePrice: number; oraclePriceUsd: number };
  };
  borrowFactor?: number;
  totalDebtUsd?: number;
  totalLiquidity?: number;
  borrowLiquidity?: number;
  stableBorrowRate?: number;
  borrowCollateralFactor?: number;
}

/** Token risk row inside a 1delta config. */
export interface OneDeltaTokenRisk {
  marketUid: string;
  isCollateral: boolean;
  tokenRiskLabel: string;
  tokenRiskScore: number;
  oracleRiskScore: number;
  tokenRiskScores: Record<string, unknown>;
  underlyingAddress: string;
}

/** Top-level 1delta config (one lender + risk bucket on a chain). */
export interface OneDeltaConfig {
  lenderKey: string;
  chainId: string;
  configId: string;
  label: string;
  category: string;
  collaterals: OneDeltaMarketRow[];
  borrowables: OneDeltaMarketRow[];
  configRiskLabel: string;
  configRiskScore: number;
  chainRiskScore?: number;
  lenderRiskScore?: number;
  maxTokenRiskScore?: number;
  tokenRisks?: OneDeltaTokenRisk[];
}

/** A user's open position in a vault/market — returned from the positions API. */
export interface EpochEarnPosition {
  id: string;
  market: EpochEarnMarket;
  /** Vault share balance in raw base units (stringified bigint). */
  shareBalanceRaw: string;
  /** Underlying token balance in raw base units (stringified bigint). */
  underlyingBalanceRaw: string;
  /** Withdrawable amount in raw base units. Defaults to `underlyingBalanceRaw` if upstream doesn't separate them. */
  withdrawableRaw?: string;
  /** Optional USD value snapshot at fetch time. */
  underlyingUsdValue?: number;
  /** 24h price change (percent, signed). */
  priceChange24h?: number;
  /** Whether this asset is currently set as collateral for the user. */
  collateralEnabled?: boolean;
  /** @deprecated earn is mainnet-only. */
  testnet?: boolean;
}

/** Portfolio-level rollup returned alongside positions. */
export interface EpochEarnPositionsSummary {
  depositsUsd: number;
  debtUsd: number;
  navUsd: number;
  deposits24hUsd: number;
  nav24hUsd: number;
  /** Weighted net APR as decimal (e.g. 0.014 = 1.4%). */
  netAprDecimal: number;
  activeLenders: number;
  activeChains: number;
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

  /**
   * High-level widget mode. Default: `"pay"`.
   * `pay` and `swap` share the same Epoch intent SDK pipeline; `swap` is for swap-oriented copy and callbacks.
   * **Requires** a parent `WagmiProvider` (and configured connectors) so the widget can list wallets and connect.
   */
  mode?: WidgetMode;
  /** Legacy alias for `mode`. Accepted for backwards compatibility. */
  flow?: WidgetFlow;

  // ---- Pay (nested OR flat) -------------------------------------------------

  /**
   * Nested intent shape — full control. When provided, takes precedence over
   * the flat `to*` props.
   */
  intent?: IntentProps;

  /** Flat: destination receiver address. */
  toAddress?: `0x${string}`;
  /** Flat: destination amount in human units (e.g. "0.15"). */
  toAmount?: string;
  /** Flat: destination chain ID (e.g. 8453). */
  toChainId?: number;
  /** Flat: destination token contract address. */
  toToken?: `0x${string}`;
  /** Flat: optional override for destination token decimals (default: looked up). */
  toTokenDecimals?: number;
  /** Flat: optional override for destination token symbol (default: looked up). */
  toTokenSymbol?: string;

  // ---- Earn -----------------------------------------------------------------

  /** Initial earn sub-tab. Default: `"deposit"`. */
  earnDefaultTab?: 'deposit' | 'withdraw';
  /** Hide earn deposit/withdraw tab row (e.g. builder preview locked to one tab). */
  earnHideTabs?: boolean;
  /** Override protocol / action / extraData type for earn deposit intents. */
  earnDepositDefaults?: EarnDepositIntentDefaults;
  /** Override protocol / action / extraData type for earn withdraw intents. */
  earnWithdrawDefaults?: EarnWithdrawIntentDefaults;
  /**
   * @deprecated Markets are now fetched via the internal `useEarnMarkets` hook.
   * When provided, the array is merged with hook output (caller-supplied first).
   */
  earnMarkets?: EpochEarnMarket[];
  /**
   * Hardcoded 1delta market configs surfaced inside the Earn flow. Defaults to
   * the widget's bundled `HARDCODED_ONEDELTA_CONFIGS`. Pass your own array to
   * customise which lender configs / chains are shown.
   */
  earnMarketsSource?: OneDeltaConfig[];
  /**
   * Override the 1delta-solver base URL (`POST /earn/quote`). When omitted the
   * widget falls back to `api.baseUrl`. Set this if the solver runs on a
   * different host than the allocator.
   */
  earnSolverUrl?: string;
  /** @deprecated retained for backwards compatibility — markets always come from `earnMarketsSource`. */
  earnUseMockData?: boolean;

  // ---- API ------------------------------------------------------------------

  /** Epoch API endpoints and RPC configuration. */
  api: ApiConfig;

  // ---- Network --------------------------------------------------------------

  /** Network mode. Default: `"mainnet"`. */
  network?: 'mainnet' | 'testnet';
  /** Allow the user to toggle mainnet/testnet inside the widget. Default: false. */
  allowNetworkToggle?: boolean;

  // ---- Rendering ------------------------------------------------------------

  /** Render the widget body inline (no modal overlay/portal). Default: false. */
  renderInline?: boolean;

  // ---- Callbacks ------------------------------------------------------------

  /** Fired when the widget opens (per `isOpen` cycle). */
  onOpen?: () => void;
  /** Fired when the user begins a submit. */
  onStart?: (ctx: OnStartCtx) => void;
  /** Fired after the user signs the typed-data payload. */
  onSign?: (ctx: OnSignCtx) => void;
  /** Fired when execution is confirmed on-chain. */
  onSuccess?: (ctx: OnSuccessCtx) => void;
  /** Fired on any error during the submit/execute flow. */
  onError?: (ctx: OnErrorCtx) => void;
  /** Fired whenever the internal status / progress changes. */
  onStatus?: (ctx: OnStatusCtx) => void;

  /** Legacy: fired when the intent is accepted by the solver. */
  onIntentSent?: (data: IntentSentPayload) => void;
  /** Legacy: fired when polling confirms execution. */
  onIntentComplete?: (data: IntentCompletePayload) => void;

  // ---- Customisation --------------------------------------------------------

  /** Title displayed in the dialog header. Default: "Pay". */
  title?: string;
  /** Label on the submit button. Default: "Pay". */
  submitButtonText?: string;

  /**
   * CSS class name overrides for every visual slot. When provided for a slot,
   * the widget skips its built-in inline styles — giving full CSS control
   * (vanilla CSS, Tailwind, CSS Modules, etc.).
   */
  classNames?: EpochClassNames;
  /**
   * Theme — pass `"light"` / `"dark"` for presets, or an `EpochTheme` token
   * object for full control. Tokens project as CSS custom properties.
   */
  theme?: 'light' | 'dark' | EpochTheme;
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export type { EpochTheme } from './theme';
