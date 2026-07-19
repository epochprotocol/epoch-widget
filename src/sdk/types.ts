// ---------------------------------------------------------------------------
// Routing & liquidity (maps to SIO constraint.preferredSolvers via allocator)
// ---------------------------------------------------------------------------

export type RoutingAndLiquidityOptions =
  | { preset: "any" }
  | { preset: "filler-single-transaction" }
  | { preset: "external-multi-transactions" }
  | { preset: "custom"; solvers: `0x${string}`[] };

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
  protocol: string;
  action: string;
  protocolHashIdentifier?: string;
  extraDataTypestring?: string;
  extraData?: Record<string, string | boolean | number | bigint>;
  fixedOutput?: boolean;
  destinationChainId?: number;
  destinationTestnetChainId?: number;
  /**
   * Output-side slippage tolerance in basis points (1 bp = 0.01%). Applied
   * to `minTokenOut` so the solver quote can land below `requiredAmount` by
   * up to this fraction without the SIO server rejecting it. Default `100`
   * (1%). Set to `0` for strict "exact-output" pinning.
   */
  slippageBps?: number;
}

export interface IntentProps {
  requiredToken: { address: string; symbol: string; decimals: number };
  requiredAmount: bigint;
  config: IntentConfig;
  destinationChainName?: string;
  positionLabel?: string;
  receiver?: `0x${string}`;
}

export interface ApiConfig {
  baseUrl: string;
  rpcUrls?: Record<number, string>;
  positionsBaseUrl?: string;
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

export type WidgetFlow = "pay" | "swap" | "earn";
export type WidgetMode = WidgetFlow;

export interface SessionCtx {
  sessionId: string;
}

export interface OnStartCtx extends SessionCtx {
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

// ---------------------------------------------------------------------------
// Earn flow (vault-style deposit/withdraw)
// ---------------------------------------------------------------------------

export interface EpochEarnMarket {
  id: string;
  displayName: string;
  chainLabel: string;
  aprDecimal: number;
  vaultAddress: string;
  token: {
    address: string;
    symbol: string;
    decimals: number;
    logoURI?: string;
  };
  destinationChainName: string;
  /** @deprecated earn is mainnet-only. */
  testnet?: boolean;
  oneDeltaMarketUid?: string;
  chainId?: number;
  lenderKey?: string;
  lenderName?: string;
  lenderLogoURI?: string;
}

export interface EarnDepositIntentDefaults {
  protocol?: string;
  action?: string;
  extraDataTypestring?: string;
}

export interface EarnWithdrawIntentDefaults {
  protocol?: string;
  action?: string;
  extraDataTypestring?: string;
}

// ---------------------------------------------------------------------------
// 1delta lending data shapes
// ---------------------------------------------------------------------------

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

export interface OneDeltaTokenRisk {
  marketUid: string;
  isCollateral: boolean;
  tokenRiskLabel: string;
  tokenRiskScore: number;
  oracleRiskScore: number;
  tokenRiskScores: Record<string, unknown>;
  underlyingAddress: string;
}

export interface OneDeltaConfig {
  lenderKey: string;
  /**
   * Canonical lender family — stable across markets within a lender (e.g.
   * `MORPHO_BLUE` for every Morpho Blue market regardless of per-market hash
   * suffix in `lenderKey`). Use this for UI grouping and display label
   * lookups; `lenderKey` is unique per bucket and not suitable for either.
   */
  lenderFamily?: string;
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
  /** Optional logo URL from `lenderInfo.logoURI`. */
  lenderLogoURI?: string;
}

export interface EpochEarnPosition {
  id: string;
  market: EpochEarnMarket;
  shareBalanceRaw: string;
  underlyingBalanceRaw: string;
  withdrawableRaw?: string;
  underlyingUsdValue?: number;
  priceChange24h?: number;
  collateralEnabled?: boolean;
  /** @deprecated earn is mainnet-only. */
  testnet?: boolean;
}

export interface EpochEarnPositionsSummary {
  depositsUsd: number;
  debtUsd: number;
  navUsd: number;
  deposits24hUsd: number;
  nav24hUsd: number;
  netAprDecimal: number;
  activeLenders: number;
  activeChains: number;
}

// ---------------------------------------------------------------------------
// SDK config + session types
// ---------------------------------------------------------------------------

export interface EpochFlowsSDKConfig {
  /** Epoch allocator (smallocator) base URL, e.g. `http://localhost:3000`. */
  apiBaseUrl: string;
  /** 1delta positions/pools proxy base URL. Optional — fetchers degrade to mocks. */
  positionsBaseUrl?: string;
  /** Per-chain RPC URL overrides for on-chain reads. */
  rpcUrls?: Record<number, string>;
}
