import type { Address } from "viem";
import type {
  EpochEarnPosition,
  EpochEarnPositionsSummary,
  EpochFlowsSDKConfig,
  IntentConfig,
  WidgetFlow,
} from "./types.js";

/**
 * Type-erased wallet client. Pass a viem `WalletClient` here — the alias is
 * `unknown` only to avoid wedging consumers into a specific viem version,
 * which is a common source of structural-type mismatches in monorepos with
 * multiple installed viem copies. The session code casts internally.
 */
export type EpochWalletClient = unknown;

// Pure builders & adapters
import { buildEarnDepositIntent } from "./flows/earn/build-deposit.js";
import { buildEarnWithdrawIntent } from "./flows/earn/build-withdraw.js";
import { buildPayIntentFromFlatProps } from "./flows/pay/build-intent.js";
import {
  deriveChainsAndLenders,
  flattenConfigsToMarkets,
  oneDeltaPositionsSummary,
  oneDeltaPositionsToEpoch,
  toEpochEarnMarket,
} from "./flows/earn/adapters.js";
import {
  HARDCODED_ONEDELTA_CONFIGS,
  chainLabelFor,
} from "./flows/earn/configs.js";
import { estimatedAnnualYield } from "./flows/earn/projection.js";
import {
  MOCK_MAINNET_MARKETS,
  MOCK_TESTNET_MARKETS,
  mockPositionsForAddress,
} from "./flows/earn/mocks.js";
import {
  fetchLendingPools,
  fetchUserPositions,
  poolsResponseToConfigs,
  unwrapPoolsArray,
} from "./flows/earn/markets.js";

// Chain helpers
import {
  getChainPublicClient,
  getDefaultRpcUrl,
  resolveRpcUrl,
} from "./chain/providers.js";
import { fetchTokenBalanceOnChain } from "./chain/balances.js";

// Sessions
import { EarnSession } from "./flows/earn/session.js";
import { PaySession } from "./flows/pay/session.js";

// ---------------------------------------------------------------------------
// Main SDK class
// ---------------------------------------------------------------------------

export interface CreateEarnSessionOptions {
  walletClient: EpochWalletClient;
  address: string;
  sessionId: string;
  routingAndLiquidityOptions?: import("./types.js").RoutingAndLiquidityOptions;
}

export interface CreatePaySessionOptions {
  walletClient: EpochWalletClient;
  address: Address;
  sessionId: string;
  mode: WidgetFlow;
  requiredToken: { address: string; symbol: string; decimals: number };
  requiredAmount: bigint;
  intentConfig: IntentConfig;
  isTestnet: boolean;
  receiver?: `0x${string}`;
  routingAndLiquidityOptions?: import("./types.js").RoutingAndLiquidityOptions;
}

/**
 * Entry point for the Epoch flows SDK.
 *
 * ```ts
 * const sdk = new EpochFlowsSDK({ apiBaseUrl, positionsBaseUrl });
 * const built = sdk.earn.buildDepositIntent(market, '100');
 * const session = sdk.createEarnSession({ walletClient, address, sessionId });
 * session.on('statusChange', (s) => console.log(s));
 * await session.submit(input);
 * ```
 */
export class EpochFlowsSDK {
  private readonly config: EpochFlowsSDKConfig;

  constructor(config: EpochFlowsSDKConfig) {
    this.config = config;
  }

  // ---- Earn namespace -----------------------------------------------------

  readonly earn = {
    buildDepositIntent: buildEarnDepositIntent,
    buildWithdrawIntent: buildEarnWithdrawIntent,
    estimatedAnnualYield,
    // Pure adapters
    toEpochEarnMarket,
    flattenConfigsToMarkets,
    deriveChainsAndLenders,
    oneDeltaPositionsToEpoch,
    oneDeltaPositionsSummary,
    // Pure helpers
    unwrapPoolsArray,
    poolsResponseToConfigs,
    // Async fetchers — bind defaults to this.config
    fetchLendingPools: (
      opts: {
        chainIds?: number[];
        lender?: string;
        sortBy?:
          | "depositRate"
          | "variableBorrowRate"
          | "totalDepositsUsd"
          | "totalLiquidityUsd"
          | "utilization";
        sortDir?: "ASC" | "DESC";
        count?: number;
        signal?: AbortSignal;
        /** Override the SDK's configured `positionsBaseUrl`. */
        positionsBaseUrl?: string;
      } = {},
    ) => {
      const positionsBaseUrl =
        opts.positionsBaseUrl ?? this.config.positionsBaseUrl;
      if (!positionsBaseUrl) {
        throw new Error(
          "fetchLendingPools requires `positionsBaseUrl` in SDK config or per-call.",
        );
      }
      return fetchLendingPools({ ...opts, positionsBaseUrl });
    },
    fetchUserPositions: (opts: {
      address: string;
      network: "mainnet" | "testnet";
      configs?: Parameters<typeof fetchUserPositions>[0]["configs"];
      chainsOverride?: string;
      lendersOverride?: string;
      signal?: AbortSignal;
      positionsBaseUrl?: string;
    }): Promise<{
      positions: EpochEarnPosition[];
      summary: EpochEarnPositionsSummary | null;
    }> => {
      const positionsBaseUrl =
        opts.positionsBaseUrl ?? this.config.positionsBaseUrl;
      return fetchUserPositions({ ...opts, positionsBaseUrl });
    },
    // Mock data
    MOCK_MAINNET_MARKETS,
    MOCK_TESTNET_MARKETS,
    mockPositionsForAddress,
    // Bundled configs
    HARDCODED_ONEDELTA_CONFIGS,
    chainLabelFor,
  };

  // ---- Pay namespace ------------------------------------------------------

  readonly pay = {
    buildIntent: buildPayIntentFromFlatProps,
  };

  // ---- Chain namespace ----------------------------------------------------

  readonly chain = {
    getPublicClient: (chainId: number) =>
      getChainPublicClient(chainId, this.config.rpcUrls),
    fetchTokenBalance: (
      chainId: number,
      tokenAddress: string,
      userAddress: string,
    ) =>
      fetchTokenBalanceOnChain(
        chainId,
        tokenAddress,
        userAddress,
        this.config.rpcUrls,
      ),
    resolveRpcUrl: (chainId: number) =>
      resolveRpcUrl(chainId, this.config.rpcUrls),
    getDefaultRpcUrl,
  };

  // ---- Session factories --------------------------------------------------

  createEarnSession(opts: CreateEarnSessionOptions): EarnSession {
    return new EarnSession({
      apiBaseUrl: this.config.apiBaseUrl,
      address: opts.address,
      walletClient: opts.walletClient,
      sessionId: opts.sessionId,
      routingAndLiquidityOptions: opts.routingAndLiquidityOptions,
    });
  }

  createPaySession(opts: CreatePaySessionOptions): PaySession {
    return new PaySession({
      apiBaseUrl: this.config.apiBaseUrl,
      address: opts.address,
      walletClient: opts.walletClient,
      sessionId: opts.sessionId,
      mode: opts.mode,
      requiredToken: opts.requiredToken,
      requiredAmount: opts.requiredAmount,
      intentConfig: opts.intentConfig,
      isTestnet: opts.isTestnet,
      receiver: opts.receiver,
      routingAndLiquidityOptions: opts.routingAndLiquidityOptions,
    });
  }
}

// ---------------------------------------------------------------------------
// Re-exports — flat namespace for consumers who don't want the class
// ---------------------------------------------------------------------------

export type * from "./types.js";

// Config registries
export {
  EPOCH_SUPPORTED_CHAINS,
  EPOCH_TESTNET_CHAINS,
  getEpochChainById,
  getEpochChains,
  getChainName,
} from "./config/chains.js";
export {
  EPOCH_SUPPORTED_TOKENS,
  EPOCH_TESTNET_TOKENS,
  getEpochTokensByChainEnv,
  getEpochTokensBySymbol,
} from "./config/tokens.js";

// Pure builders
export { buildEarnDepositIntent } from "./flows/earn/build-deposit.js";
export type { EarnDepositBuild } from "./flows/earn/build-deposit.js";
export { buildEarnWithdrawIntent } from "./flows/earn/build-withdraw.js";
export type { EarnWithdrawBuild } from "./flows/earn/build-withdraw.js";
export { buildPayIntentFromFlatProps } from "./flows/pay/build-intent.js";
export type { FlatPayInputs, FlatPayBuild } from "./flows/pay/build-intent.js";

// Earn adapters / configs / fetchers
export {
  toEpochEarnMarket,
  flattenConfigsToMarkets,
  oneDeltaPositionsToEpoch,
  oneDeltaPositionsSummary,
  deriveChainsAndLenders,
} from "./flows/earn/adapters.js";
export {
  HARDCODED_ONEDELTA_CONFIGS,
  chainLabelFor,
} from "./flows/earn/configs.js";
export { estimatedAnnualYield } from "./flows/earn/projection.js";
export {
  MOCK_MAINNET_MARKETS,
  MOCK_TESTNET_MARKETS,
  mockPositionsForAddress,
} from "./flows/earn/mocks.js";
export {
  byConfigResponseToConfigs,
  fetchLendingPools,
  fetchLendingPoolsByConfig,
  fetchLendingPoolsPage,
  fetchLendingPoolsPageMulti,
  fetchUserPositions,
  poolsResponseToConfigs,
  unwrapPoolsArray,
} from "./flows/earn/markets.js";
export type {
  EarnMarketRow,
  FetchLendingPoolsByConfigOptions,
  FetchLendingPoolsOptions,
  FetchLendingPoolsPageMultiOptions,
  FetchLendingPoolsPageMultiResult,
  FetchLendingPoolsPageOptions,
  FetchLendingPoolsPageResult,
  FetchLendingPoolsResult,
  FetchUserPositionsOptions,
  FetchUserPositionsResult,
  PoolSortBy,
  PoolSortDir,
} from "./flows/earn/markets.js";

// Chain helpers
export {
  getChainPublicClient,
  getDefaultRpcUrl,
  resolveRpcUrl,
} from "./chain/providers.js";
export { fetchTokenBalanceOnChain } from "./chain/balances.js";

// Formatting + session ID
export {
  formatAmount,
  formatBalancePortionForInput,
  formatRawAmount,
  formatTokenIn,
  trimAmountInput,
  truncateAddress,
} from "./utils/format.js";
export { makeId } from "./utils/session-id.js";

// Sessions
export { EarnSession } from "./flows/earn/session.js";
export type {
  EarnIntentFlowStatus,
  EarnQuote,
  EarnQuoteInput,
  EarnSessionConfig,
  EarnSessionEvents,
  EarnSubmitInput,
  ExecutionTx,
} from "./flows/earn/session.js";
export { PaySession } from "./flows/pay/session.js";
export type {
  PayIntentFlowStatus,
  PayQuote,
  PaySessionConfig,
  PaySessionEvents,
  PaySubmitInput,
} from "./flows/pay/session.js";

// Event emitter (exported so consumers can use it in tests/mocks)
export { TypedEventEmitter } from "./intent/event-emitter.js";
