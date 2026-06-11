import { useEffect, useRef, useState } from 'react';
import type {
  ApiConfig,
  EpochEarnMarket,
  EpochEarnPosition,
  EpochEarnPositionsSummary,
  OneDeltaConfig,
} from '../types';
import { HARDCODED_ONEDELTA_CONFIGS } from './onedelta-markets';
import { flattenConfigsToMarkets } from './onedelta-adapter';
import { mockPositionsForAddress } from './mock-data';
import {
  DUMMY_LENDING_CONFIGS,
  isTestnetChainId,
} from './dummy-lending-markets';
import {
  deriveChainsAndLenders,
  oneDeltaPositionsSummary,
  oneDeltaPositionsToEpoch,
} from './positions-adapter';

const MOCK_DELAY_MS = 150;

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
 * Resolve the 1delta market configs to show in the Earn flow. By default the
 * widget uses the bundled `HARDCODED_ONEDELTA_CONFIGS`; consumers can pass
 * their own via the `source` option (or the `earnMarketsSource` widget prop).
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
  const filtered = filterConfigsByNetwork(source, network);
  const [state, setState] = useState<ConfigsState>({
    configs: filtered,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ configs: [], isLoading: false, error: null });
      return;
    }
    setState({ configs: filterConfigsByNetwork(source, network), isLoading: false, error: null });
  }, [enabled, source, network]);

  return state;
}

/**
 * Legacy hook — returns flattened `EpochEarnMarket[]` derived from the bundled
 * 1delta configs (or `source` if provided). Retained for backwards-compat with
 * callers that consumed `useEarnMarkets()` directly.
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
  const resolvedSource = source ?? DEFAULT_EARN_CONFIGS;
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

/**
 * Fetch the user's open positions for the current network.
 *
 * - When `api.positionsBaseUrl` is set, calls the 1delta positions proxy
 *   (`GET ${positionsBaseUrl}/positions?account=...&chains=...&lenders=...`)
 *   and maps the raw response to `EpochEarnPosition[]` via
 *   `oneDeltaPositionsToEpoch`.
 * - Otherwise falls back to bundled mock data so the widget still renders
 *   end-to-end in demos.
 */
export function useUserPositions(opts: {
  address?: string;
  network: 'mainnet' | 'testnet';
  api: ApiConfig;
  enabled?: boolean;
  configs?: OneDeltaConfig[];
  /** Override the auto-derived `chains` CSV. Useful when the connected wallet's
   *  positions live on chains not covered by the bundled configs. */
  chainsOverride?: string;
  /** Override the auto-derived `lenders` CSV. Omit to let the API default to all. */
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
  const resolvedConfigs = configs ?? DEFAULT_EARN_CONFIGS;
  const derived = deriveChainsAndLenders(resolvedConfigs);
  const chains = chainsOverride ?? derived.chains;
  const lenders = lendersOverride ?? derived.lenders;

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
    const id = ++reqIdRef.current;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      try {
        let positions: EpochEarnPosition[];
        let summary: EpochEarnPositionsSummary | null = null;
        if (positionsBaseUrl && chains) {
          const url = new URL(`${positionsBaseUrl}/positions`);
          url.searchParams.set('account', address);
          url.searchParams.set('chains', chains);
          if (lenders) url.searchParams.set('lenders', lenders);

          console.info('[useUserPositions] fetch start', url.toString());
          const t0 = performance.now();
          const res = await fetch(url.toString(), {
            method: 'GET',
            headers: { accept: 'application/json' },
            signal: controller.signal,
          });
          if (!res.ok) {
            const body = await res.text().catch(() => '');
            throw new Error(
              `positions service ${res.status} ${res.statusText}${body ? `: ${body}` : ''}`,
            );
          }
          const raw = (await res.json()) as unknown;
          positions = oneDeltaPositionsToEpoch(raw, resolvedConfigs);
          summary = oneDeltaPositionsSummary(raw);
          console.info(
            `[useUserPositions] fetch done in ${Math.round(performance.now() - t0)}ms — ${positions.length} positions, summary=${summary ? 'yes' : 'no'}`,
          );
        } else {
          await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
          positions = mockPositionsForAddress(address, network);
        }
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
  }, [address, network, positionsBaseUrl, chains, lenders, enabled]);

  return state;
}
