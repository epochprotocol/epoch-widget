import { useEffect, useRef, useState } from 'react';
import {
  fetchLendingPools,
  fetchLendingPoolsPage,
  fetchLendingPoolsPageMulti,
  fetchUserPositions,
  flattenConfigsToMarkets,
  HARDCODED_ONEDELTA_CONFIGS,
} from '@epoch-protocol/epoch-flows-sdk';
import type {
  EarnMarketRow,
  PoolSortBy,
  PoolSortDir,
} from '@epoch-protocol/epoch-flows-sdk';
import type {
  ApiConfig,
  EpochEarnMarket,
  EpochEarnPosition,
  EpochEarnPositionsSummary,
  OneDeltaConfig,
} from '../types';
import {
  DUMMY_LENDING_CONFIGS,
  isTestnetChainId,
} from './dummy-lending-markets';

/** Bundled mainnet configs plus testnet-only dummy-lending. */
export const DEFAULT_EARN_CONFIGS: OneDeltaConfig[] = [
  ...HARDCODED_ONEDELTA_CONFIGS,
  ...DUMMY_LENDING_CONFIGS,
];

function filterConfigsByNetwork(
  configs: OneDeltaConfig[],
  network: 'mainnet' | 'testnet',
): OneDeltaConfig[] {
  const wantTestnet = network === 'testnet';
  return configs.filter((cfg) => {
    const onTestnet = isTestnetChainId(cfg.chainId);
    return wantTestnet ? onTestnet : !onTestnet;
  });
}

interface MarketsState {
  markets: EpochEarnMarket[];
  isLoading: boolean;
  error: Error | null;
}

interface ConfigsState {
  configs: OneDeltaConfig[];
  isLoading: boolean;
  error: Error | null;
}

interface PositionsState {
  positions: EpochEarnPosition[];
  summary: EpochEarnPositionsSummary | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Resolve the 1delta market configs to show in the Earn flow. By default uses
 * the bundled `HARDCODED_ONEDELTA_CONFIGS`; consumers can pass their own via
 * the `source` option.
 */
export function useEarnConfigs(opts: {
  enabled?: boolean;
  source?: OneDeltaConfig[];
  network?: 'mainnet' | 'testnet';
}): ConfigsState {
  const {
    enabled = true,
    source = DEFAULT_EARN_CONFIGS,
    network = 'mainnet',
  } = opts;
  const [state, setState] = useState<ConfigsState>({
    configs: filterConfigsByNetwork(source, network),
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ configs: [], isLoading: false, error: null });
      return;
    }
    setState({
      configs: filterConfigsByNetwork(source, network),
      isLoading: false,
      error: null,
    });
  }, [enabled, source, network]);

  return state;
}

/**
 * Legacy hook — returns flattened `EpochEarnMarket[]` derived from the bundled
 * 1delta configs (or `source` if provided).
 */
export function useEarnMarkets(opts: {
  network?: 'mainnet' | 'testnet';
  api?: ApiConfig;
  enabled?: boolean;
  /** @deprecated no-op — markets always come from the bundled configs. */
  earnUseMockData?: boolean;
  source?: OneDeltaConfig[];
}): MarketsState {
  const { enabled = true, source, network = 'mainnet' } = opts;
  const resolvedSource = filterConfigsByNetwork(source ?? DEFAULT_EARN_CONFIGS, network);
  const [state, setState] = useState<MarketsState>({
    markets: enabled ? flattenConfigsToMarkets(resolvedSource) : [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ markets: [], isLoading: false, error: null });
      return;
    }
    setState({
      markets: flattenConfigsToMarkets(resolvedSource),
      isLoading: false,
      error: null,
    });
  }, [enabled, resolvedSource]);

  return state;
}

interface PoolsPageState {
  rows: EarnMarketRow[];
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Server-side sorted + paginated market page. Single chain → one `/pools`
 * request (multi-lender collapses to `lender=CSV`, which upstream accepts).
 * Multi-chain → `fetchLendingPoolsPageMulti` fans out one request per chain,
 * each carrying the same `lender=CSV`, then merges + client-side re-sorts.
 * Optional filter params (`minTvlUsd`, `maxRiskScore`, `minUtil`, `maxUtil`)
 * are forwarded so cross-chain comparison is consistent.
 */
export function useLendingPoolsPage(opts: {
  api: ApiConfig;
  enabled?: boolean;
  /** Chains to query. 1 → single request. N → fan-out + client merge. */
  chainIds: number[];
  /**
   * Lenders to query. Empty → no `lender` filter (upstream returns all).
   * Multi-element → joined as `lender=CSV` (one upstream call per chain).
   */
  lenders?: string[];
  sortBy: PoolSortBy;
  sortDir: PoolSortDir;
  start: number;
  count: number;
  minTvlUsd?: number;
  maxRiskScore?: number;
  minUtil?: number;
  maxUtil?: number;
}): PoolsPageState {
  const {
    api,
    enabled = true,
    chainIds,
    lenders,
    sortBy,
    sortDir,
    start,
    count,
    minTvlUsd,
    maxRiskScore,
    minUtil,
    maxUtil,
  } = opts;
  const positionsBaseUrl = api.positionsBaseUrl?.replace(/\/$/, '');
  // Stable keys so the effect doesn't refetch on array-identity churn alone.
  const chainIdsKey = chainIds.join(',');
  const lendersKey = (lenders ?? []).join(',');

  const [state, setState] = useState<PoolsPageState>({
    rows: [],
    hasMore: false,
    isLoading: !!positionsBaseUrl && enabled && chainIds.length > 0,
    error: null,
  });
  const reqIdRef = useRef(0);

  useEffect(() => {
    // Derived from `chainIdsKey` rather than the raw `chainIds` array: the key
    // is what the deps track, so reading the array here could guard on a stale
    // length. Note `[].join(',')` is '' and `Number('')` is 0, hence the
    // truthiness check before parsing — otherwise "no chains" becomes [0].
    const parsedChainIds = chainIdsKey.split(',').flatMap((s) => {
      const n = Number(s);
      return s && Number.isFinite(n) ? [n] : [];
    });
    if (!enabled || !positionsBaseUrl || parsedChainIds.length === 0) {
      setState({ rows: [], hasMore: false, isLoading: false, error: null });
      return;
    }
    const id = ++reqIdRef.current;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const controller = new AbortController();
    let cancelled = false;
    const parsedLenders = lendersKey ? lendersKey.split(',').filter(Boolean) : [];
    // Upstream accepts `lender=CSV` so multi-lender stays a single request per
    // chain. Multi-chain still requires fan-out (chainId is required + single).
    const lenderCsv = parsedLenders.length ? parsedLenders.join(',') : undefined;

    const promise =
      parsedChainIds.length > 1
        ? fetchLendingPoolsPageMulti({
            positionsBaseUrl,
            chainIds: parsedChainIds,
            lenders: parsedLenders.length ? parsedLenders : undefined,
            sortBy,
            sortDir,
            start,
            count,
            minTvlUsd,
            maxRiskScore,
            minUtil,
            maxUtil,
            signal: controller.signal,
          })
        : fetchLendingPoolsPage({
            positionsBaseUrl,
            chainId: parsedChainIds[0],
            lender: lenderCsv,
            sortBy,
            sortDir,
            start,
            count,
            minTvlUsd,
            maxRiskScore,
            minUtil,
            maxUtil,
            signal: controller.signal,
          });

    promise
      .then(({ rows, hasMore }) => {
        if (cancelled || id !== reqIdRef.current) return;
        setState({ rows, hasMore, isLoading: false, error: null });
      })
      .catch((err) => {
        if (cancelled || id !== reqIdRef.current) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({
          rows: [],
          hasMore: false,
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    positionsBaseUrl,
    enabled,
    chainIdsKey,
    lendersKey,
    sortBy,
    sortDir,
    start,
    count,
    minTvlUsd,
    maxRiskScore,
    minUtil,
    maxUtil,
  ]);

  return state;
}

const DEFAULT_POOL_CHAIN_IDS = [1, 8453, 42161, 10, 137];

/**
 * Fetch lending pools via the SDK `fetchLendingPools` fetcher — fans out one
 * `/pools?chainId=…` request per chain in parallel (Promise.allSettled), so a
 * single chain failure doesn't blank the picker. Falls back to the bundled
 * `HARDCODED_ONEDELTA_CONFIGS` when no proxy base URL is configured.
 */
export function useLendingPools(opts: {
  api: ApiConfig;
  enabled?: boolean;
  chainIds?: number[];
  lender?: string;
  sortBy?:
    | 'depositRate'
    | 'variableBorrowRate'
    | 'totalDepositsUsd'
    | 'totalLiquidityUsd'
    | 'utilization';
  sortDir?: 'ASC' | 'DESC';
  count?: number;
}): ConfigsState {
  const {
    api,
    enabled = true,
    chainIds = DEFAULT_POOL_CHAIN_IDS,
    lender,
    sortBy,
    sortDir,
    count,
  } = opts;
  const positionsBaseUrl = api.positionsBaseUrl?.replace(/\/$/, '');
  const chainsKey = chainIds.join(',');

  const [state, setState] = useState<ConfigsState>({
    configs: positionsBaseUrl ? [] : HARDCODED_ONEDELTA_CONFIGS,
    isLoading: !!positionsBaseUrl && enabled,
    error: null,
  });
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setState({ configs: [], isLoading: false, error: null });
      return;
    }
    if (!positionsBaseUrl) {
      setState({ configs: HARDCODED_ONEDELTA_CONFIGS, isLoading: false, error: null });
      return;
    }
    const id = ++reqIdRef.current;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const controller = new AbortController();
    let cancelled = false;
    const chains = chainsKey
      ? chainsKey.split(',').map((s) => Number(s)).filter(Number.isFinite)
      : [];

    const run = async () => {
      try {
        const { configs } = await fetchLendingPools({
          positionsBaseUrl,
          chainIds: chains,
          lender,
          sortBy,
          sortDir,
          count,
          signal: controller.signal,
        });
        if (cancelled || id !== reqIdRef.current) return;
        setState({ configs, isLoading: false, error: null });
      } catch (err) {
        if (cancelled || id !== reqIdRef.current) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({
          configs: [],
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    };
    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [positionsBaseUrl, enabled, chainsKey, lender, sortBy, sortDir, count]);

  return state;
}

/**
 * Fetch the user's open positions via the SDK `fetchUserPositions` fetcher.
 * Falls back to bundled mock data when no proxy base URL is configured.
 */
export function useUserPositions(opts: {
  address?: string;
  network: 'mainnet' | 'testnet';
  api: ApiConfig;
  enabled?: boolean;
  configs?: OneDeltaConfig[];
  chainsOverride?: string;
  lendersOverride?: string;
}): PositionsState {
  const {
    address,
    network,
    api,
    enabled = true,
    configs,
    chainsOverride,
    lendersOverride,
  } = opts;
  const positionsBaseUrl = api.positionsBaseUrl?.replace(/\/$/, '');

  const [state, setState] = useState<PositionsState>({
    positions: [],
    summary: null,
    isLoading: enabled && !!address,
    error: null,
  });
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!enabled || !address) {
      setState({ positions: [], summary: null, isLoading: false, error: null });
      return;
    }
    // When a proxy URL is wired but configs failed to load (e.g. /pools 5xx),
    // the SDK's derived chains string would be empty and it would silently
    // fall back to bundled mock positions. Surface the proxy outage instead
    // of rendering static positions.
    if (positionsBaseUrl && (!configs || configs.length === 0) && !chainsOverride) {
      setState({
        positions: [],
        summary: null,
        isLoading: false,
        error: new Error('positions unavailable: pool configs not loaded'),
      });
      return;
    }
    const id = ++reqIdRef.current;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      try {
        const { positions, summary } = await fetchUserPositions({
          address,
          network,
          positionsBaseUrl,
          configs,
          chainsOverride,
          lendersOverride,
          signal: controller.signal,
        });
        if (cancelled || id !== reqIdRef.current) return;
        setState({ positions, summary, isLoading: false, error: null });
      } catch (err) {
        if (cancelled || id !== reqIdRef.current) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({
          positions: [],
          summary: null,
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    };
    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    address,
    network,
    positionsBaseUrl,
    configs,
    chainsOverride,
    lendersOverride,
    enabled,
  ]);

  return state;
}
