import type {
  EpochEarnMarket,
  EpochEarnPosition,
  EpochEarnPositionsSummary,
  OneDeltaConfig,
  OneDeltaMarketRow,
} from "../../types.js";
import { HARDCODED_ONEDELTA_CONFIGS } from "./configs.js";
import {
  deriveChainsAndLenders,
  oneDeltaPositionsSummary,
  oneDeltaPositionsToEpoch,
  toEpochEarnMarket,
} from "./adapters.js";
import { mockPositionsForAddress } from "./mocks.js";

const MOCK_DELAY_MS = 150;
const DEFAULT_POOL_CHAIN_IDS = [1, 8453, 42161, 10, 137];

/** Sort fields accepted by the `/pools` API (subset surfaced in the widget). */
export type PoolSortBy =
  | "depositRate"
  | "variableBorrowRate"
  | "totalDepositsUsd"
  | "totalLiquidityUsd"
  | "utilization";
export type PoolSortDir = "ASC" | "DESC";

// ---------------------------------------------------------------------------
// Pure response parsers (lifted from widget/src/earn/api.ts)
// ---------------------------------------------------------------------------

/** Defensive envelope unwrap — accepts `{data:{items:[]}}`, `{data:{pools:[]}}`, `{pools:[]}`, or bare array. */
export function unwrapPoolsArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.pools)) return r.pools as unknown[];
    const data = r.data as Record<string, unknown> | undefined;
    if (data) {
      if (Array.isArray(data.items)) return data.items as unknown[];
      if (Array.isArray(data.pools)) return data.pools as unknown[];
      if (Array.isArray(data as unknown)) return data as unknown as unknown[];
    }
  }
  return [];
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

interface RawRiskBreakdown {
  category?: string;
  score?: number | null;
  label?: string;
}

interface RawPoolRow {
  marketUid?: string;
  name?: string;
  lenderKey?: string;
  chainId?: string | number;
  depositRate?: number | string;
  variableBorrowRate?: number | string;
  stableBorrowRate?: number | string;
  utilization?: number | string;
  totalDeposits?: number | string;
  totalDebt?: number | string;
  totalLiquidity?: number | string;
  totalDepositsUsd?: number | string;
  totalDebtUsd?: number | string;
  totalLiquidityUsd?: number | string;
  borrowLiquidity?: number | string;
  borrowLiquidityUsd?: number | string;
  withdrawLiquidity?: number | string;
  depositable?: number | string;
  collateralFactor?: number | string;
  borrowCollateralFactor?: number | string;
  intrinsicYield?: number | null;
  caps?: {
    borrowCap?: number | string;
    supplyCap?: number | string;
    debtCeiling?: number | string;
  };
  flags?: {
    isActive?: boolean;
    isFrozen?: boolean;
    hasStable?: boolean;
    borrowingEnabled?: boolean;
    collateralActive?: boolean;
    depositsEnabled?: boolean;
  };
  underlyingInfo?: {
    asset?: {
      name?: string;
      symbol?: string;
      address?: string;
      chainId?: string | number;
      decimals?: number;
      logoURI?: string | null;
      assetGroup?: string;
      currencyId?: string;
      props?: unknown;
      intrinsicYield?: number | null;
    };
    prices?: {
      priceUsd?: number | string;
      priceTs?: string;
      priceUsd24h?: number | string;
      priceTs24h?: string;
      priceChange24h?: number | string;
    };
    oraclePrice?: {
      oraclePrice?: number | string;
      oraclePriceUsd?: number | string;
    };
  };
  risk?: {
    score?: number;
    label?: string;
    breakdown?: RawRiskBreakdown[];
  };
  lenderInfo?: {
    key?: string;
    name?: string;
    logoURI?: string;
  };
}

function findBreakdown(
  breakdown: RawRiskBreakdown[] | undefined,
  category: string,
): RawRiskBreakdown | undefined {
  if (!Array.isArray(breakdown)) return undefined;
  return breakdown.find((b) => b?.category === category);
}

// 1delta's `lenderKey` is granular: Morpho/Fluid/etc tag every individual
// market with a unique key (e.g. `MORPHO_BLUE_2476BB905E3D...`, `FLUID_2`,
// `COMPOUND_V3_USDC`). For UI grouping we want a stable family key shared by
// every market from the same protocol — without losing the underlying
// granular key (which is what /pools `lender=` actually expects).
const FAMILY_PREFIX_RULES: Array<{ test: RegExp; family: string }> = [
  { test: /^AAVE_V3_PRIME/i, family: "AAVE_V3_PRIME" },
  { test: /^AAVE_V3/i, family: "AAVE_V3" },
  { test: /^AAVE_V2/i, family: "AAVE_V2" },
  { test: /^AAVE/i, family: "AAVE" },
  { test: /^COMPOUND/i, family: "COMPOUND" },
  { test: /^MORPHO/i, family: "MORPHO" },
  { test: /^FLUID/i, family: "FLUID" },
  { test: /^EULER/i, family: "EULER" },
  { test: /^SPARK/i, family: "SPARK" },
  { test: /^VENUS/i, family: "VENUS" },
  { test: /^YLDR/i, family: "YLDR" },
];

function deriveLenderFamily(
  lenderKey: string,
  lenderInfoKey: string | undefined,
): string {
  const candidate = lenderInfoKey || lenderKey;
  for (const rule of FAMILY_PREFIX_RULES) {
    if (rule.test.test(candidate)) return rule.family;
  }
  // Fallback: strip per-market hex hash suffix (Morpho-style) so two configs
  // for the same protocol still collapse together.
  const trimmed = candidate.replace(/_[0-9a-fA-F]{16,}$/, "");
  return trimmed || candidate;
}

const FAMILY_LABELS: Record<string, string> = {
  AAVE: "Aave",
  AAVE_V2: "Aave V2",
  AAVE_V3: "Aave V3",
  AAVE_V3_PRIME: "Aave V3 Prime",
  COMPOUND: "Compound",
  MORPHO: "Morpho",
  FLUID: "Fluid",
  EULER: "Euler",
  SPARK: "Spark",
  VENUS: "Venus",
  YLDR: "YLDR",
};

function prettifyLenderKey(key: string): string {
  return key
    .split("_")
    .map((part) => {
      if (/^V\d+$/i.test(part)) return part.toUpperCase();
      return part.charAt(0) + part.slice(1).toLowerCase();
    })
    .join(" ");
}

export function poolsResponseToConfigs(raw: unknown): OneDeltaConfig[] {
  const rows = (
    Array.isArray(raw) ? raw : unwrapPoolsArray(raw)
  ) as RawPoolRow[];
  const buckets = new Map<string, OneDeltaConfig>();

  for (const r of rows) {
    if (!r?.marketUid) continue;
    const lenderKey = r.lenderKey ?? r.marketUid.split(":")[0];
    const chainId = String(
      r.chainId ??
        r.underlyingInfo?.asset?.chainId ??
        r.marketUid.split(":")[1] ??
        "",
    );
    if (!lenderKey || !chainId) continue;

    // Drop inactive / frozen markets — they can't be deposited into or
    // borrowed from, so showing them in the picker would just bait misclicks.
    const flags = r.flags ?? {};
    const hasFlags = Object.keys(flags).length > 0;
    if (hasFlags && (flags.isActive === false || flags.isFrozen === true))
      continue;

    const configId = `${lenderKey}:${chainId}`;
    const asset = r.underlyingInfo?.asset;
    const prices = r.underlyingInfo?.prices;
    const oracle = r.underlyingInfo?.oraclePrice;
    const oraclePrice =
      oracle?.oraclePrice != null ? num(oracle.oraclePrice) : undefined;
    const oraclePriceUsd =
      oracle?.oraclePriceUsd != null ? num(oracle.oraclePriceUsd) : undefined;

    const row = {
      marketUid: r.marketUid,
      depositRate: num(r.depositRate),
      variableBorrowRate: num(r.variableBorrowRate),
      utilization: num(r.utilization),
      totalDepositsUsd: num(r.totalDepositsUsd),
      totalLiquidityUsd: num(r.totalLiquidityUsd),
      borrowLiquidityUsd: num(r.borrowLiquidityUsd),
      collateralFactor: num(r.collateralFactor),
      borrowCollateralFactor:
        r.borrowCollateralFactor != null
          ? num(r.borrowCollateralFactor)
          : undefined,
      intrinsicYield: r.intrinsicYield ?? asset?.intrinsicYield ?? null,
      underlyingInfo: {
        asset: {
          name: asset?.name ?? asset?.symbol ?? "Unknown",
          symbol: asset?.symbol ?? "???",
          address: asset?.address ?? "",
          chainId: String(asset?.chainId ?? chainId),
          logoURI: asset?.logoURI ?? null,
          decimals: asset?.decimals ?? 18,
          assetGroup: asset?.assetGroup ?? "",
          currencyId: asset?.currencyId,
          props: asset?.props,
          intrinsicYield: asset?.intrinsicYield ?? null,
        },
        prices: {
          priceUsd: num(prices?.priceUsd),
          priceTs: prices?.priceTs,
          priceUsd24h:
            prices?.priceUsd24h != null ? num(prices.priceUsd24h) : undefined,
          priceTs24h: prices?.priceTs24h,
        },
        tokenRisk: {
          riskLabel: r.risk?.label ?? "unknown",
          riskScore: num(r.risk?.score, 0),
        },
        ...(oraclePrice != null && oraclePriceUsd != null
          ? { oraclePrice: { oraclePrice, oraclePriceUsd } }
          : {}),
      },
      stableBorrowRate: num(r.stableBorrowRate),
      totalDebtUsd: num(r.totalDebtUsd),
      totalLiquidity:
        r.totalLiquidity != null ? num(r.totalLiquidity) : undefined,
      borrowLiquidity:
        r.borrowLiquidity != null ? num(r.borrowLiquidity) : undefined,
    } as OneDeltaConfig["collaterals"][number];

    let bucket = buckets.get(configId);
    if (!bucket) {
      const cfgBreakdown = findBreakdown(r.risk?.breakdown, "config");
      const chainBreakdown = findBreakdown(r.risk?.breakdown, "chain");
      const lenderBreakdown = findBreakdown(r.risk?.breakdown, "lender");
      const lenderFamily = deriveLenderFamily(lenderKey, r.lenderInfo?.key);
      const label =
        r.lenderInfo?.name ??
        FAMILY_LABELS[lenderFamily] ??
        prettifyLenderKey(lenderFamily);
      bucket = {
        lenderKey,
        lenderFamily,
        chainId,
        configId,
        label,
        category: "",
        collaterals: [],
        borrowables: [],
        configRiskLabel: cfgBreakdown?.label ?? "unknown",
        configRiskScore:
          cfgBreakdown?.score != null ? num(cfgBreakdown.score) : 0,
        chainRiskScore:
          chainBreakdown?.score != null ? num(chainBreakdown.score) : undefined,
        lenderRiskScore:
          lenderBreakdown?.score != null
            ? num(lenderBreakdown.score)
            : undefined,
        lenderLogoURI: r.lenderInfo?.logoURI,
      };
      buckets.set(configId, bucket);
    }
    // Per-row token risk fed into the bucket's max so the config-level "worst
    // token" score reflects what's actually inside.
    const tokenScore = num(r.risk?.score, 0);
    bucket.maxTokenRiskScore = Math.max(
      bucket.maxTokenRiskScore ?? 0,
      tokenScore,
    );

    // /pools returns one row per (lender, chain, asset). The same row can show
    // up as a collateral (deposits enabled) and/or a borrowable (borrowing
    // enabled). If no flags are present, fall back to including in both so
    // older proxy versions don't disappear from the picker.
    const allowLend = hasFlags ? flags.depositsEnabled !== false : true;
    const allowBorrow = hasFlags ? flags.borrowingEnabled === true : true;
    if (allowLend) bucket.collaterals.push(row);
    if (allowBorrow) bucket.borrowables.push(row);
  }

  return Array.from(buckets.values());
}

/** Shared per-row normalizer — typed numbers + nested asset shape. */
function normalizeMarketRow(
  r: RawPoolRow,
  fallbackChainId: string,
): OneDeltaConfig["collaterals"][number] | null {
  if (!r?.marketUid) return null;
  const asset = r.underlyingInfo?.asset;
  const prices = r.underlyingInfo?.prices;
  const oracle = r.underlyingInfo?.oraclePrice;
  const oraclePrice =
    oracle?.oraclePrice != null ? num(oracle.oraclePrice) : undefined;
  const oraclePriceUsd =
    oracle?.oraclePriceUsd != null ? num(oracle.oraclePriceUsd) : undefined;
  return {
    marketUid: r.marketUid,
    depositRate: num(r.depositRate),
    variableBorrowRate: num(r.variableBorrowRate),
    utilization: num(r.utilization),
    totalDepositsUsd: num(r.totalDepositsUsd),
    totalLiquidityUsd: num(r.totalLiquidityUsd),
    borrowLiquidityUsd: num(r.borrowLiquidityUsd),
    collateralFactor: num(r.collateralFactor),
    borrowCollateralFactor:
      r.borrowCollateralFactor != null
        ? num(r.borrowCollateralFactor)
        : undefined,
    intrinsicYield: r.intrinsicYield ?? asset?.intrinsicYield ?? null,
    underlyingInfo: {
      asset: {
        name: asset?.name ?? asset?.symbol ?? "Unknown",
        symbol: asset?.symbol ?? "???",
        address: asset?.address ?? "",
        chainId: String(asset?.chainId ?? fallbackChainId),
        logoURI: asset?.logoURI ?? null,
        decimals: asset?.decimals ?? 18,
        assetGroup: asset?.assetGroup ?? "",
        currencyId: asset?.currencyId,
        props: asset?.props,
        intrinsicYield: asset?.intrinsicYield ?? null,
      },
      prices: {
        priceUsd: num(prices?.priceUsd),
        priceTs: prices?.priceTs,
        priceUsd24h:
          prices?.priceUsd24h != null ? num(prices.priceUsd24h) : undefined,
        priceTs24h: prices?.priceTs24h,
      },
      tokenRisk: {
        riskLabel: r.risk?.label ?? "unknown",
        riskScore: num(r.risk?.score, 0),
      },
      ...(oraclePrice != null && oraclePriceUsd != null
        ? { oraclePrice: { oraclePrice, oraclePriceUsd } }
        : {}),
    },
    stableBorrowRate: num(r.stableBorrowRate),
    totalDebtUsd: num(r.totalDebtUsd),
    totalLiquidity:
      r.totalLiquidity != null ? num(r.totalLiquidity) : undefined,
    borrowLiquidity:
      r.borrowLiquidity != null ? num(r.borrowLiquidity) : undefined,
  } as OneDeltaConfig["collaterals"][number];
}

interface RawByConfigItem {
  lenderKey?: string;
  chainId?: string | number;
  configId?: string;
  label?: string;
  category?: string;
  collaterals?: RawPoolRow[] | null;
  borrowables?: RawPoolRow[] | null;
  lenderInfo?: { key?: string; name?: string; logoURI?: string };
  risk?: { score?: number; label?: string; breakdown?: RawRiskBreakdown[] };
}

/** Normalize the grouped `/pools/by-config` response → `OneDeltaConfig[]`. */
export function byConfigResponseToConfigs(raw: unknown): OneDeltaConfig[] {
  const items = unwrapPoolsArray(raw) as unknown[] as RawByConfigItem[];
  const out: OneDeltaConfig[] = [];
  for (const item of items) {
    const lenderKey = item.lenderKey;
    const chainId = item.chainId != null ? String(item.chainId) : "";
    if (!lenderKey || !chainId) continue;
    const configIdRaw = item.configId ?? "";
    const configId = `${lenderKey}:${chainId}:${configIdRaw}`;
    const lenderFamily = deriveLenderFamily(lenderKey, item.lenderInfo?.key);
    const cfgBreakdown = findBreakdown(item.risk?.breakdown, "config");
    const chainBreakdown = findBreakdown(item.risk?.breakdown, "chain");
    const lenderBreakdown = findBreakdown(item.risk?.breakdown, "lender");
    const label =
      item.lenderInfo?.name ??
      item.label ??
      FAMILY_LABELS[lenderFamily] ??
      prettifyLenderKey(lenderFamily);

    const collateralRows: OneDeltaConfig["collaterals"] = [];
    const borrowableRows: OneDeltaConfig["borrowables"] = [];
    let maxTokenRisk = 0;

    const pushRow = (
      target: OneDeltaConfig["collaterals"],
      r: RawPoolRow,
      requireBorrowFlag: boolean,
    ) => {
      const flags = r.flags ?? {};
      const hasFlags = Object.keys(flags).length > 0;
      if (hasFlags && (flags.isActive === false || flags.isFrozen === true))
        return;
      if (requireBorrowFlag && hasFlags && flags.borrowingEnabled === false)
        return;
      if (!requireBorrowFlag && hasFlags && flags.depositsEnabled === false)
        return;
      const row = normalizeMarketRow(r, chainId);
      if (!row) return;
      target.push(row);
      maxTokenRisk = Math.max(maxTokenRisk, num(r.risk?.score, 0));
    };

    for (const r of item.collaterals ?? []) pushRow(collateralRows, r, false);
    for (const r of item.borrowables ?? []) pushRow(borrowableRows, r, true);

    // Skip empty configs — picker would render a heading with nothing under it.
    if (collateralRows.length === 0 && borrowableRows.length === 0) continue;

    out.push({
      lenderKey,
      lenderFamily,
      chainId,
      configId,
      label,
      category: item.category ?? "",
      collaterals: collateralRows,
      borrowables: borrowableRows,
      configRiskLabel: cfgBreakdown?.label ?? "unknown",
      configRiskScore:
        cfgBreakdown?.score != null ? num(cfgBreakdown.score) : 0,
      chainRiskScore:
        chainBreakdown?.score != null ? num(chainBreakdown.score) : undefined,
      lenderRiskScore:
        lenderBreakdown?.score != null ? num(lenderBreakdown.score) : undefined,
      maxTokenRiskScore: maxTokenRisk,
      lenderLogoURI: item.lenderInfo?.logoURI,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Async fetchers — framework-agnostic, return promises
// ---------------------------------------------------------------------------

export interface FetchLendingPoolsOptions {
  /** Base URL of the 1delta pools proxy (e.g. `http://localhost:4023`). Required. */
  positionsBaseUrl: string;
  /** Chains to fan out over (one /pools request per chain). Default: [1, 8453, 42161, 10, 137]. */
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
}

export interface FetchLendingPoolsResult {
  configs: OneDeltaConfig[];
  failures: { chainId: number; error: string }[];
}

/**
 * Fan-out fetch of `GET {positionsBaseUrl}/pools?chainId=...` across multiple
 * chains, merging rows into `OneDeltaConfig[]` buckets. One synthetic config
 * per `(lenderKey, chainId)`.
 */
export async function fetchLendingPools(
  opts: FetchLendingPoolsOptions,
): Promise<FetchLendingPoolsResult> {
  const {
    positionsBaseUrl,
    chainIds = DEFAULT_POOL_CHAIN_IDS,
    lender,
    sortBy = "totalDepositsUsd",
    sortDir = "DESC",
    count,
    signal,
  } = opts;
  const base = positionsBaseUrl.replace(/\/$/, "");

  // Server-side sort: each /pools request returns rows already ordered by
  // `sortBy`/`sortDir`. The fan-out is per chain, so the caller still does one
  // final merge-interleave across chains by the same field to get a single
  // globally-sorted list (see MarketPickerPage).
  const fetchOne = async (cid: number): Promise<unknown[]> => {
    const url = new URL(`${base}/pools`);
    url.searchParams.set("chainId", String(cid));
    if (lender) url.searchParams.set("lender", lender);
    url.searchParams.set("sortBy", sortBy);
    url.searchParams.set("sortDir", sortDir);
    if (count != null) url.searchParams.set("count", String(count));
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { accept: "application/json" },
      signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `pools service ${res.status} ${res.statusText}${body ? `: ${body}` : ""}`,
      );
    }
    const raw = (await res.json()) as unknown;
    return unwrapPoolsArray(raw);
  };

  const settled = await Promise.allSettled(chainIds.map((c) => fetchOne(c)));
  const rows: unknown[] = [];
  const failures: { chainId: number; error: string }[] = [];
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") {
      rows.push(...r.value);
    } else {
      failures.push({ chainId: chainIds[i], error: String(r.reason) });
    }
  });
  const configs = poolsResponseToConfigs(rows);
  return { configs, failures };
}

export interface FetchLendingPoolsByConfigOptions {
  /** Base URL of the 1delta pools proxy. Required. */
  positionsBaseUrl: string;
  /** Chains to include in the single `chains=` CSV. Default: [1, 8453, 42161, 10, 137]. */
  chainIds?: number[];
  /** Optional CSV of lender keys (e.g. `AAVE_V3,MORPHO_BLUE`). */
  lenders?: string;
  /** Max items returned by upstream. Optional. */
  count?: number;
  /** Offset for pagination. Optional. */
  start?: number;
  signal?: AbortSignal;
}

/**
 * Single-request fetch of `GET {positionsBaseUrl}/pools/by-config?chains=…`.
 * Upstream returns items already grouped per `(lender, chain, configId)` so we
 * skip the per-chain fan-out entirely.
 */
export async function fetchLendingPoolsByConfig(
  opts: FetchLendingPoolsByConfigOptions,
): Promise<{ configs: OneDeltaConfig[] }> {
  const {
    positionsBaseUrl,
    chainIds = DEFAULT_POOL_CHAIN_IDS,
    lenders,
    count,
    start,
    signal,
  } = opts;
  const base = positionsBaseUrl.replace(/\/$/, "");
  const url = new URL(`${base}/pools/by-config`);
  url.searchParams.set("chains", chainIds.join(","));
  if (lenders) url.searchParams.set("lenders", lenders);
  if (count != null) url.searchParams.set("count", String(count));
  if (start != null) url.searchParams.set("start", String(start));
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { accept: "application/json" },
    signal,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `pools/by-config service ${res.status} ${res.statusText}${body ? `: ${body}` : ""}`,
    );
  }
  const raw = (await res.json()) as unknown;
  return { configs: byConfigResponseToConfigs(raw) };
}

// ---------------------------------------------------------------------------
// Server-side sorted + paginated single page (no per-chain fan-out)
// ---------------------------------------------------------------------------

/** One market row with the metadata the picker needs, in server order. */
export interface EarnMarketRow {
  market: EpochEarnMarket;
  row: OneDeltaMarketRow;
  config: OneDeltaConfig;
}

export interface FetchLendingPoolsPageOptions {
  /** Base URL of the 1delta pools proxy. Required. */
  positionsBaseUrl: string;
  /** Single chain filter. Required — upstream rejects requests without it. */
  chainId: number;
  /** Single lender/family key (e.g. `AAVE_V3`, `MORPHO`). Omit → all lenders. */
  lender?: string;
  sortBy?: PoolSortBy;
  sortDir?: PoolSortDir;
  /** Pagination offset (rows). */
  start?: number;
  /** Page size. */
  count?: number;
  /** Min total liquidity in USD. Upstream defaults differ per chain — pin explicitly for consistency. */
  minTvlUsd?: number;
  /** Max risk score (1–5). Upstream default 4. */
  maxRiskScore?: number;
  /** Min utilization (0–1). Upstream default 0.1; pass 0 to surface collateral-only markets. */
  minUtil?: number;
  /** Max utilization (0–1). Upstream default 0.9. */
  maxUtil?: number;
  signal?: AbortSignal;
}

export interface FetchLendingPoolsPageResult {
  /** Lend markets in the exact order the server returned them — no client sort. */
  rows: EarnMarketRow[];
  /** True when the upstream returned a full page (another page likely exists). */
  hasMore: boolean;
}

/** Per-row synthetic config carrying lender metadata for `toEpochEarnMarket`. */
function rowToConfig(r: RawPoolRow, chainId: string): OneDeltaConfig {
  const lenderKey = r.lenderKey ?? r.marketUid!.split(":")[0];
  const lenderFamily = deriveLenderFamily(lenderKey, r.lenderInfo?.key);
  const label =
    r.lenderInfo?.name ??
    FAMILY_LABELS[lenderFamily] ??
    prettifyLenderKey(lenderFamily);
  return {
    lenderKey,
    lenderFamily,
    chainId,
    configId: `${lenderKey}:${chainId}`,
    label,
    category: "",
    collaterals: [],
    borrowables: [],
    configRiskLabel: r.risk?.label ?? "unknown",
    configRiskScore: r.risk?.score != null ? num(r.risk.score) : 0,
    maxTokenRiskScore: num(r.risk?.score, 0),
    lenderLogoURI: r.lenderInfo?.logoURI,
  };
}

/**
 * Single `GET {positionsBaseUrl}/pools` request — the server sorts (`sortBy`/
 * `sortDir`) and paginates (`start`/`count`). Rows are returned in server order
 * with NO client-side re-sorting or per-chain merge: omitting `chainId` lets
 * the upstream return every chain in one globally-ordered response.
 */
export async function fetchLendingPoolsPage(
  opts: FetchLendingPoolsPageOptions,
): Promise<FetchLendingPoolsPageResult> {
  const {
    positionsBaseUrl,
    chainId,
    lender,
    sortBy = "totalDepositsUsd",
    sortDir = "DESC",
    start,
    count,
    minTvlUsd,
    maxRiskScore,
    minUtil,
    maxUtil,
    signal,
  } = opts;
  const base = positionsBaseUrl.replace(/\/$/, "");
  const url = new URL(`${base}/pools`);
  url.searchParams.set("chainId", String(chainId));
  if (lender) url.searchParams.set("lender", lender);
  url.searchParams.set("sortBy", sortBy);
  url.searchParams.set("sortDir", sortDir);
  if (start != null) url.searchParams.set("start", String(start));
  if (count != null) url.searchParams.set("count", String(count));
  if (minTvlUsd != null) url.searchParams.set("minTvlUsd", String(minTvlUsd));
  if (maxRiskScore != null) url.searchParams.set("maxRiskScore", String(maxRiskScore));
  if (minUtil != null) url.searchParams.set("minUtil", String(minUtil));
  if (maxUtil != null) url.searchParams.set("maxUtil", String(maxUtil));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { accept: "application/json" },
    signal,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `pools service ${res.status} ${res.statusText}${body ? `: ${body}` : ""}`,
    );
  }
  const raw = (await res.json()) as unknown;
  const rawRows = unwrapPoolsArray(raw) as RawPoolRow[];

  const rows: EarnMarketRow[] = [];
  const seen = new Set<string>();
  for (const r of rawRows) {
    if (!r?.marketUid) continue;
    const flags = r.flags ?? {};
    const hasFlags = Object.keys(flags).length > 0;
    // Drop inactive/frozen + non-depositable rows — picker is lend-only.
    if (hasFlags && (flags.isActive === false || flags.isFrozen === true))
      continue;
    if (hasFlags && flags.depositsEnabled === false) continue;
    const cid = String(
      r.chainId ??
        r.underlyingInfo?.asset?.chainId ??
        r.marketUid.split(":")[1] ??
        "",
    );
    const normalized = normalizeMarketRow(r, cid);
    if (!normalized) continue;
    const config = rowToConfig(r, cid);
    const market = toEpochEarnMarket(normalized, config, "lend");
    if (seen.has(market.id)) continue;
    seen.add(market.id);
    rows.push({ market, row: normalized, config });
  }

  // hasMore is measured against the RAW page size (pre-filter) so dropping a
  // few inactive rows never prematurely ends pagination.
  const hasMore = count != null && rawRows.length >= count;
  return { rows, hasMore };
}

// ---------------------------------------------------------------------------
// Multi-chain fan-out across a user-selected subset
// ---------------------------------------------------------------------------

export interface FetchLendingPoolsPageMultiOptions {
  positionsBaseUrl: string;
  /** Chains to fan out over. Must be non-empty. */
  chainIds: number[];
  /**
   * Single lender key for back-compat with the single-lender call site.
   * Mutually exclusive with `lenders`.
   */
  lender?: string;
  /**
   * Lenders to fan out over. Each (chainId × lender) pair becomes one upstream
   * request. Omit / empty array → no `lender` filter (upstream returns all).
   */
  lenders?: string[];
  sortBy?: PoolSortBy;
  sortDir?: PoolSortDir;
  /** Pagination offset, applied per (chain, lender) pair (not global). */
  start?: number;
  /** Per-pair page size. Total rows ≤ `chainIds.length * max(1, lenders.length) * count`. */
  count?: number;
  minTvlUsd?: number;
  maxRiskScore?: number;
  minUtil?: number;
  maxUtil?: number;
  signal?: AbortSignal;
}

export interface FetchLendingPoolsPageMultiResult {
  rows: EarnMarketRow[];
  hasMore: boolean;
  failures: { chainId: number; lender?: string; error: string }[];
}

// Client-side sort accessor for the merged multi-chain set. Covers the
// PoolSortBy union the widget surfaces today.
const POOL_SORT_FIELD: Record<PoolSortBy, (r: OneDeltaMarketRow) => number> = {
  depositRate: (r) => r.depositRate,
  variableBorrowRate: (r) => r.variableBorrowRate,
  utilization: (r) => r.utilization,
  totalDepositsUsd: (r) => r.totalDepositsUsd,
  totalLiquidityUsd: (r) => r.totalLiquidityUsd,
};

/**
 * Fan out `fetchLendingPoolsPage` across the user-selected chain subset.
 * Upstream `/pools` accepts a CSV for `lender` (e.g. `AAVE_V3,MORPHO`) but
 * only a single `chainId`, so multi-select on lenders collapses to one
 * `lender=CSV` param while multi-select on chains becomes N parallel calls.
 *
 * Each chain receives the same `lender`/`start`/`count`, so the result holds
 * up to `chainIds.length * count` rows. After concat the merged set is
 * re-sorted client-side by `(sortBy, sortDir)` so the picker reads as one
 * ranked list. `hasMore` is true when any chain reports another page.
 *
 * Per-chain failures are isolated — a busted chain doesn't blank the picker;
 * the consumer can surface partial-data warnings via `failures`.
 */
export async function fetchLendingPoolsPageMulti(
  opts: FetchLendingPoolsPageMultiOptions,
): Promise<FetchLendingPoolsPageMultiResult> {
  const {
    positionsBaseUrl,
    chainIds,
    lender,
    lenders,
    sortBy = "totalDepositsUsd",
    sortDir = "DESC",
    start = 0,
    count = 100,
    minTvlUsd,
    maxRiskScore,
    minUtil,
    maxUtil,
    signal,
  } = opts;

  if (chainIds.length === 0) {
    return { rows: [], hasMore: false, failures: [] };
  }

  // Collapse the lender selection to a single CSV — upstream accepts
  // `lender=AAVE_V3,MORPHO`. Empty / undefined → omit the param entirely.
  const lenderCsv =
    lenders && lenders.length > 0 ? lenders.join(",") : lender || undefined;

  const settled = await Promise.allSettled(
    chainIds.map((cid) =>
      fetchLendingPoolsPage({
        positionsBaseUrl,
        chainId: cid,
        lender: lenderCsv,
        sortBy,
        sortDir,
        start,
        count,
        minTvlUsd,
        maxRiskScore,
        minUtil,
        maxUtil,
        signal,
      }),
    ),
  );

  const merged: EarnMarketRow[] = [];
  const failures: { chainId: number; lender?: string; error: string }[] = [];
  // Dedupe by market id — rare but possible across overlapping upstream pages.
  const seen = new Set<string>();
  let anyHasMore = false;
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") {
      for (const row of r.value.rows) {
        if (seen.has(row.market.id)) continue;
        seen.add(row.market.id);
        merged.push(row);
      }
      if (r.value.hasMore) anyHasMore = true;
    } else {
      failures.push({
        chainId: chainIds[i],
        lender: lenderCsv,
        error: String(r.reason),
      });
    }
  });

  const getField = POOL_SORT_FIELD[sortBy];
  const dirMul = sortDir === "ASC" ? 1 : -1;
  merged.sort((a, b) => (getField(a.row) - getField(b.row)) * dirMul);

  return { rows: merged, hasMore: anyHasMore, failures };
}

// ---------------------------------------------------------------------------

export interface FetchUserPositionsOptions {
  /** User wallet address. Required for live fetch. */
  address: string;
  network: "mainnet" | "testnet";
  /** Base URL of the 1delta positions proxy. Omit to fall back to mock data. */
  positionsBaseUrl?: string;
  /** Source configs used to derive chains/lenders filters. Defaults to bundled. */
  configs?: OneDeltaConfig[];
  chainsOverride?: string;
  lendersOverride?: string;
  signal?: AbortSignal;
}

export interface FetchUserPositionsResult {
  positions: EpochEarnPosition[];
  summary: EpochEarnPositionsSummary | null;
}

/**
 * Fetch user's open lending positions for the current network.
 *
 * - When `positionsBaseUrl` is set, calls the 1delta positions proxy
 *   (`GET ${positionsBaseUrl}/positions?account=...&chains=...&lenders=...`)
 *   and maps the response to `EpochEarnPosition[]` via `oneDeltaPositionsToEpoch`.
 * - Otherwise returns bundled mock data so flows render end-to-end without a backend.
 */
export async function fetchUserPositions(
  opts: FetchUserPositionsOptions,
): Promise<FetchUserPositionsResult> {
  const { address, network, positionsBaseUrl, signal } = opts;
  const resolvedConfigs = opts.configs ?? HARDCODED_ONEDELTA_CONFIGS;
  const derived = deriveChainsAndLenders(resolvedConfigs);
  const chains = opts.chainsOverride ?? derived.chains;
  const lenders = opts.lendersOverride ?? derived.lenders;
  const base = positionsBaseUrl?.replace(/\/$/, "");

  if (base) {
    if (!chains) {
      // Proxy is wired but caller couldn't derive chains (e.g. failed pool
      // fetch). Returning mock positions here would lie about live state, so
      // surface an empty list instead.
      return { positions: [], summary: null };
    }
    const url = new URL(`${base}/positions`);
    url.searchParams.set("account", address);
    url.searchParams.set("chains", chains);
    if (lenders) url.searchParams.set("lenders", lenders);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { accept: "application/json" },
      signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `positions service ${res.status} ${res.statusText}${body ? `: ${body}` : ""}`,
      );
    }
    const raw = (await res.json()) as unknown;
    return {
      positions: oneDeltaPositionsToEpoch(raw, resolvedConfigs),
      summary: oneDeltaPositionsSummary(raw),
    };
  }

  // No proxy wired — render bundled mock positions so headless/demo flows
  // still have something to show.
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  return {
    positions: mockPositionsForAddress(address, network),
    summary: null,
  };
}
