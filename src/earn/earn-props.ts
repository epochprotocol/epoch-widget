import type {
  ApiConfig,
  EarnDepositIntentDefaults,
  EarnMidenAdapter,
  EarnWithdrawIntentDefaults,
  EpochClassNames,
  EpochEarnMarket,
  EpochTheme,
  IntentCompletePayload,
  IntentSentPayload,
  OneDeltaConfig,
  OnErrorCtx,
  OnSignCtx,
  OnStartCtx,
  OnStatusCtx,
  OnSuccessCtx,
  RoutingAndLiquidityOptions,
} from '../types';

/**
 * Lives here rather than beside the component so the engine hook can take it
 * without importing the component it powers.
 */
export interface EarnIntentWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  api: ApiConfig;
  network?: "mainnet" | "testnet";
  allowNetworkToggle?: boolean;
  allowGasless?: boolean;
  gasless?: boolean;
  classNames?: EpochClassNames;
  theme?: "light" | "dark" | EpochTheme;
  renderInline?: boolean;
  title?: string;
  submitButtonText?: string;
  earnMarkets?: EpochEarnMarket[];
  earnMarketsSource?: OneDeltaConfig[];
  earnDefaultTab?: "deposit" | "withdraw";
  earnHideTabs?: boolean;
  earnDepositDefaults?: EarnDepositIntentDefaults;
  earnWithdrawDefaults?: EarnWithdrawIntentDefaults;
  /** Override the 1delta-solver base URL (`POST /earn/quote`). Defaults to `api.baseUrl`. */
  earnSolverUrl?: string;
  /** Optional Miden wallet adapter for testnet earn deposits funded from Miden. */
  earnMiden?: EarnMidenAdapter;
  /**
   * Chain IDs to fan /pools fetches over. Forwarded as one `chainId=` per
   * request. Default: [1, 8453, 42161, 10, 137]. Set to a single chain to
   * scope the picker.
   */
  earnChainIds?: number[];
  /**
   * Restrict /pools to specific lender keys. Passed verbatim as the `lender`
   * query param — 1delta accepts CSV (e.g. `AAVE_V3,COMPOUND_V3_USDC`) and
   * matches the granular `lenderKey` (per-market for Morpho/Fluid). Omit to
   * include every lender on each chain.
   */
  earnLenderFilter?: string;
  /** Max rows per chain on /pools (1delta `count`). Default 100. */
  earnPoolsPerChain?: number;
  /** /pools sort field. Default `totalDepositsUsd`. */
  earnPoolsSortBy?:
    | "depositRate"
    | "variableBorrowRate"
    | "totalDepositsUsd"
    | "totalLiquidityUsd"
    | "utilization";
  /** /pools sort direction. Default `DESC`. */
  earnPoolsSortDir?: "ASC" | "DESC";
  /** @deprecated no-op — markets always come from `earnMarketsSource`. */
  earnUseMockData?: boolean;
  onIntentSent?: (data: IntentSentPayload) => void;
  onIntentComplete?: (data: IntentCompletePayload) => void;
  onError?: (ctx: OnErrorCtx) => void;
  onOpen?: () => void;
  onStart?: (ctx: OnStartCtx) => void;
  onSign?: (ctx: OnSignCtx) => void;
  onSuccess?: (ctx: OnSuccessCtx) => void;
  onStatus?: (ctx: OnStatusCtx) => void;
  routingAndLiquidityOptions?: RoutingAndLiquidityOptions;
}
