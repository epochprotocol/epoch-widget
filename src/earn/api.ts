import { useEffect, useRef, useState } from 'react';
import {
  fetchLendingPools,
  fetchUserPositions,
  flattenConfigsToMarkets,
  HARDCODED_ONEDELTA_CONFIGS,
} from '@epoch-protocol/epoch-flows-sdk';
import type {
  ApiConfig,
  EpochEarnMarket,
  EpochEarnPosition,
  EpochEarnPositionsSummary,
  OneDeltaConfig,
} from '../types';

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
}): ConfigsState {
  const { enabled = true, source = HARDCODED_ONEDELTA_CONFIGS } = opts;
  const [state, setState] = useState<ConfigsState>({
    configs: source,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ configs: [], isLoading: false, error: null });
      return;
    }
    setState({ configs: source, isLoading: false, error: null });
  }, [enabled, source]);

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
  const { enabled = true, source } = opts;
  const [state, setState] = useState<MarketsState>({
    markets: enabled
      ? flattenConfigsToMarkets(source ?? HARDCODED_ONEDELTA_CONFIGS)
      : [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ markets: [], isLoading: false, error: null });
      return;
    }
    setState({
      markets: flattenConfigsToMarkets(source ?? HARDCODED_ONEDELTA_CONFIGS),
      isLoading: false,
      error: null,
    });
  }, [enabled, source]);

  return state;
}

const DEFAULT_POOL_CHAIN_IDS = [1, 8453, 42161, 10, 137];

/**
 * Fetch lending pools via the SDK `fetchLendingPools` fan-out fetcher,
 * grouped into `OneDeltaConfig[]` buckets. Falls back to the bundled
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
    sortBy = 'totalDepositsUsd',
    sortDir = 'DESC',
    count = 100,
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
        const { configs, failures } = await fetchLendingPools({
          positionsBaseUrl,
          chainIds: chains,
          lender,
          sortBy,
          sortDir,
          count,
          signal: controller.signal,
        });
        if (cancelled || id !== reqIdRef.current) return;
        if (configs.length === 0 && failures.length > 0) {
          throw new Error(
            failures.map((f) => `chain ${f.chainId}: ${f.error}`).join('; '),
          );
        }
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
