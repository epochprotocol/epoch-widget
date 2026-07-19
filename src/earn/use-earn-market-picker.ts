import { useCallback, useMemo, useState } from 'react';
import type {
  EarnMarketRow,
  PoolSortBy,
  PoolSortDir,
} from '../sdk';
import type { ApiConfig, OneDeltaConfig } from '../types';
import {
  DEFAULT_EARN_CONFIGS,
  useEarnConfigs,
  useLendingPoolsPage,
} from './api';
import {
  ALL_LENDERS,
  MARKETS_PAGE_SIZE,
  clientPage,
  configsToRows,
} from './market-rows';
import {
  EARN_MAINNET_CHAIN_IDS,
  EARN_TESTNET_CHAIN_IDS,
  earnChainIdsFor,
} from './earn-chains';

export interface UseEarnMarketPickerOptions {
  /** Already network-resolved API config. */
  api: ApiConfig;
  /** Fetch live pools only while the picker view is actually on screen. */
  enabled: boolean;
  /** Static configs are cheap and prefetch as soon as the widget opens. */
  configsEnabled: boolean;
  isTestnet: boolean;
  networkEnv: 'mainnet' | 'testnet';
  /** Consumer-supplied chain scope, pre-sanitisation. */
  earnChainIds?: number[];
  /** Consumer-supplied lender scope as CSV. */
  earnLenderFilter?: string;
  earnMarketsSource?: OneDeltaConfig[];
  defaultSortBy?: PoolSortBy;
  defaultSortDir?: PoolSortDir;
}

export interface EarnMarketPicker {
  rows: EarnMarketRow[];
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  /** Chain ids offered in the picker's chain dropdown. */
  availableChainIds: number[];
  /** Lender keys offered in the picker's lender dropdown. */
  availableLenders: string[];
  /** CSV of the in-scope earn chains — also what the positions API wants. */
  earnChainsCsv: string;
  chainFilter: number | 'all';
  lenderFilter: string;
  sortBy: PoolSortBy;
  sortDir: PoolSortDir;
  page: number;
  setChainFilter: (chainId: number | 'all') => void;
  setLenderFilter: (lenderKey: string) => void;
  setSort: (sortBy: PoolSortBy, sortDir: PoolSortDir) => void;
  nextPage: () => void;
  prevPage: () => void;
  /** Return the picker to its opening state (used when the widget closes). */
  reset: () => void;
}

/**
 * Everything behind the "Select Market" view: the filter/sort/page axes and the
 * rows they resolve to.
 *
 * Two very different sources sit behind one shape. Mainnet reads live pools from
 * the positions API, which sorts and pages server-side. Testnet has no 1delta
 * indexing, so it pages bundled dummy-lending configs client-side. Callers get
 * the same `rows`/`hasMore`/`isLoading`/`error` either way and never branch on
 * which one is live.
 *
 * Every filter change resets the page, because page 3 of the old filter is
 * meaningless under the new one.
 */
export function useEarnMarketPicker({
  api,
  enabled,
  configsEnabled,
  isTestnet,
  networkEnv,
  earnChainIds,
  earnLenderFilter,
  earnMarketsSource,
  defaultSortBy,
  defaultSortDir,
}: UseEarnMarketPickerOptions): EarnMarketPicker {
  const [chainFilter, setChainFilterState] = useState<number | 'all'>('all');
  const [lenderFilter, setLenderFilterState] = useState<string>(ALL_LENDERS);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<PoolSortBy>(
    defaultSortBy ?? 'totalDepositsUsd',
  );
  const [sortDir, setSortDir] = useState<PoolSortDir>(defaultSortDir ?? 'DESC');

  // Drop any consumer-supplied ids outside the active network's whitelist —
  // earn depends on 1delta indexing, which is mainnet-only. Returning
  // `undefined` (rather than []) lets the SDK default kick in, so a fully
  // out-of-scope list doesn't silently render zero markets.
  const sanitizedChainIds = useMemo(() => {
    const allowed = isTestnet ? EARN_TESTNET_CHAIN_IDS : EARN_MAINNET_CHAIN_IDS;
    if (!earnChainIds) return undefined;
    const ok: number[] = [];
    const dropped: number[] = [];
    for (const id of earnChainIds) (allowed.has(id) ? ok : dropped).push(id);
    if (dropped.length) {
      console.warn(
        `[EpochIntentWidget] earnChainIds clamped to ${networkEnv}; dropped:`,
        dropped,
      );
    }
    return ok.length ? ok : undefined;
  }, [earnChainIds, isTestnet, networkEnv]);

  const availableChainIds = useMemo<number[]>(
    () => sanitizedChainIds ?? earnChainIdsFor(isTestnet),
    [sanitizedChainIds, isTestnet],
  );

  const earnChainsCsv = useMemo(
    () => availableChainIds.join(','),
    [availableChainIds],
  );

  // Live /pools only on mainnet; testnet falls back to bundled configs.
  const useLivePools = networkEnv === 'mainnet' && !!api.positionsBaseUrl;

  // "All chains" → the whole in-scope list; a specific chain → just that one.
  // Either way the hook below gets a list and picks single vs multi-call.
  const requestedChainIds = useMemo<number[]>(
    () => (chainFilter === 'all' ? availableChainIds : [chainFilter]),
    [chainFilter, availableChainIds],
  );

  // The picker's single-select dropdown overrides the consumer's CSV scope;
  // ALL_LENDERS falls back to it. Empty → no `lender` filter at all.
  const requestedLenders = useMemo<string[]>(() => {
    if (lenderFilter !== ALL_LENDERS) return [lenderFilter];
    if (!earnLenderFilter) return [];
    return earnLenderFilter.split(',').flatMap((s) => {
      const trimmed = s.trim();
      return trimmed ? [trimmed] : [];
    });
  }, [lenderFilter, earnLenderFilter]);

  const poolsPage = useLendingPoolsPage({
    api,
    enabled: enabled && useLivePools,
    chainIds: requestedChainIds,
    lenders: requestedLenders,
    sortBy,
    sortDir,
    start: page * MARKETS_PAGE_SIZE,
    count: MARKETS_PAGE_SIZE,
    // NOTE: `minTvlUsd`, `maxRiskScore`, `minUtil`, `maxUtil` are intentionally
    // omitted — pinning them upstream caused issues on the 1delta side. Re-add
    // once the upstream behavior is stable.
  });

  const staticConfigsState = useEarnConfigs({
    enabled: configsEnabled && !useLivePools,
    source: earnMarketsSource ?? DEFAULT_EARN_CONFIGS,
    network: networkEnv,
  });

  const staticRowsAll = useMemo(
    () => (useLivePools ? [] : configsToRows(staticConfigsState.configs)),
    [useLivePools, staticConfigsState.configs],
  );

  const staticPage = useMemo(
    () =>
      clientPage(staticRowsAll, {
        chainId: chainFilter === 'all' ? undefined : chainFilter,
        lender: lenderFilter === ALL_LENDERS ? undefined : lenderFilter,
        sortBy,
        sortDir,
        page,
      }),
    [staticRowsAll, chainFilter, lenderFilter, sortBy, sortDir, page],
  );

  const source = useLivePools
    ? {
        rows: poolsPage.rows,
        hasMore: poolsPage.hasMore,
        isLoading: poolsPage.isLoading,
        error: poolsPage.error,
      }
    : {
        rows: staticPage.rows,
        hasMore: staticPage.hasMore,
        isLoading: staticConfigsState.isLoading,
        error: staticConfigsState.error,
      };

  // Combines (a) the consumer's declared scope — deterministic, doesn't shift as
  // pages change — with (b) families actually seen in the loaded rows, which
  // covers anything the consumer didn't pre-declare. Empty → the picker falls
  // back to its own bundled display list.
  const availableLenders = useMemo<string[]>(() => {
    const set = new Set<string>();
    if (earnLenderFilter) {
      for (const key of earnLenderFilter.split(',')) {
        const trimmed = key.trim();
        if (trimmed) set.add(trimmed);
      }
    }
    for (const row of source.rows) {
      const family = row.config.lenderFamily ?? row.config.lenderKey;
      if (family) set.add(family);
    }
    return [...set];
  }, [earnLenderFilter, source.rows]);

  // Each axis resets the page: page 3 of the previous filter means nothing here.
  const setChainFilter = useCallback((next: number | 'all') => {
    setChainFilterState(next);
    setPage(0);
  }, []);

  const setLenderFilter = useCallback((next: string) => {
    setLenderFilterState(next);
    setPage(0);
  }, []);

  const setSort = useCallback((nextBy: PoolSortBy, nextDir: PoolSortDir) => {
    setSortBy(nextBy);
    setSortDir(nextDir);
    setPage(0);
  }, []);

  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);

  const reset = useCallback(() => {
    setChainFilterState('all');
    setLenderFilterState(ALL_LENDERS);
    setPage(0);
  }, []);

  return {
    rows: source.rows,
    hasMore: source.hasMore,
    isLoading: source.isLoading,
    error: source.error,
    availableChainIds,
    availableLenders,
    earnChainsCsv,
    chainFilter,
    lenderFilter,
    sortBy,
    sortDir,
    page,
    setChainFilter,
    setLenderFilter,
    setSort,
    nextPage,
    prevPage,
    reset,
  };
}
