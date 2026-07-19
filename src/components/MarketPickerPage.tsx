import { useMemo, useState } from "react";
import { chainDotColor } from "../chain-colors";
import { earnChainIdsFor } from "../earn/earn-chains";
import { getEpochChainById } from "../epoch-config";
import { SECTION_LABEL } from "../lib/styles";
import type {
  EarnMarketRow,
  PoolSortBy,
  PoolSortDir,
} from "@epoch-protocol/epoch-flows-sdk";
import type {
  EpochEarnMarket,
  OneDeltaConfig,
  OneDeltaMarketRow,
} from "../types";
import { MarketRowCard } from "./earn/MarketRowCard";
import { ArrowDownUpIcon } from "./Icons";
import { FilterDropdown, type FilterOption } from "./ui/FilterDropdown";
import { SearchInput } from "./ui/SearchInput";
import { Skeleton } from "./ui/Skeleton";

export const ALL_LENDERS = "__all__";
export const ALL_CHAINS = "__all__";

interface Props {
  /**
   * Current page of markets, in the order the server returned them. The parent
   * owns sort, chain/lender filtering, and pagination — this component does NOT
   * re-sort, re-filter (except the page-local text search), or slice.
   */
  rows: EarnMarketRow[];
  selectedId?: string;
  isLoading: boolean;
  error: Error | null;
  onSelect: (
    market: EpochEarnMarket,
    row: OneDeltaMarketRow,
    config: OneDeltaConfig,
  ) => void;

  /** Chain filter — forwarded to the API as `chainId` (or all). */
  chainFilter: number | "all";
  onChainChange: (chainId: number | "all") => void;

  /** Lender family filter — forwarded to the API as `lender` (or all). */
  lenderFilter: string;
  onLenderChange: (lender: string) => void;

  /** Sort — forwarded to the API as `sortBy`/`sortDir`. */
  sortBy: PoolSortBy;
  sortDir: PoolSortDir;
  onSortChange: (sortBy: PoolSortBy, sortDir: PoolSortDir) => void;

  /** Server-side pagination (load-more / next-only — no total available). */
  page: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
  /**
   * Subset of chains the parent will actually query. Drives the chain
   * dropdown options and the "All chains" / "All selected chains" label.
   * Defaults to the full mainnet earn set when omitted.
   */
  availableChainIds?: number[];
  /**
   * Lender keys the parent will surface in the lender dropdown. Typically the
   * union of (a) consumer scope from `earnLenderFilter` and (b) lenders
   * observed in the current page rows — so the dropdown reflects what's
   * actually fetchable. Omit → falls back to the bundled `FAMILY_DISPLAY`.
   */
  availableLenders?: string[];
}

// Default mainnet earn universe — used when the parent doesn't narrow the
// chain set. Single-sourced from `earn-chains`; this used to be a hand-copied
// literal that silently drifted from the widget's own list.
const DEFAULT_CHAIN_IDS = earnChainIdsFor(false);

// Known lender families with pretty labels. Used as a fallback when the
// consumer doesn't supply `availableLenders` and as the display lookup for
// known keys. Granular keys (e.g. `MORPHO_BLUE`, `AAVE_V3_PRIME`) fall through
// to `prettifyLender` below.
const FAMILY_DISPLAY: Record<string, string> = {
  AAVE_V3: "Aave V3",
  AAVE_V2: "Aave V2",
  COMPOUND: "Compound",
  MORPHO: "Morpho",
  FLUID: "Fluid",
  EULER: "Euler",
  SPARK: "Spark",
  VENUS: "Venus",
  YLDR: "YLDR",
};

// Segments kept upper-case in pretty labels so tickers / version suffixes
// don't get title-cased into garbage (USDC → Usdc, V3 → V3).
const KEEP_UPPER_LENDER_SEG = new Set([
  "LP", "PT", "RWA", "LST", "LRTS", "DAO",
  "USDC", "USDT", "USDS", "USDE", "USDA", "USDX", "USDBC", "USDCE", "PYUSD", "GHO", "DAI",
  "ETH", "WETH", "CMETH", "METH", "WSTETH",
  "BTC", "WBTC", "LBTC", "EBTC", "UBTC", "OBTC", "STBTC", "CBBTC", "FBTC",
  "SOLVBTC", "SWELLBTC", "PUMPBTC", "UNIBTC", "LSTBTC",
  "BNB", "MNT", "WMNT", "AERO", "WRON", "BOB", "XAUM",
  "SUSDE", "SOLV", "BEETS", "LISTA", "UNIIOTX", "VENO", "SKAIA", "EDEL",
  "CROAK", "FOXY", "ATROPA", "LORENZO", "TRON", "CURVE",
]);

function prettifyLender(key: string): string {
  if (FAMILY_DISPLAY[key]) return FAMILY_DISPLAY[key];
  return key
    .split("_")
    .map((seg) => {
      if (KEEP_UPPER_LENDER_SEG.has(seg)) return seg;
      if (/^V\d+$/i.test(seg)) return seg.toUpperCase();
      return seg.charAt(0) + seg.slice(1).toLowerCase();
    })
    .join(" ");
}
const FAMILY_DOT: Record<string, string> = {
  AAVE_V3: "#b6509e",
  AAVE_V2: "#b6509e",
  COMPOUND: "#00d395",
  MORPHO: "#2b5cff",
  FLUID: "#36b6ff",
  EULER: "#4d9aff",
  SPARK: "#ffaa00",
  VENUS: "#f6c344",
  YLDR: "#ffb547",
};
const ALL_GRADIENT = "linear-gradient(135deg, #b6509e 0%, #2ebac6 100%)";

const SORT_OPTIONS: FilterOption[] = [
  { value: "apr_desc", label: "Highest APY", featured: true },
  { value: "tvl_desc", label: "Highest TVL", featured: true },
  { value: "apr_asc", label: "Lowest APY" },
  { value: "tvl_asc", label: "Lowest TVL" },
];

// Dropdown value ⇄ API (sortBy, sortDir). Only APY / TVL are surfaced.
const SORT_VALUE_TO_PARAMS: Record<
  string,
  { sortBy: PoolSortBy; sortDir: PoolSortDir }
> = {
  apr_desc: { sortBy: "depositRate", sortDir: "DESC" },
  apr_asc: { sortBy: "depositRate", sortDir: "ASC" },
  tvl_desc: { sortBy: "totalDepositsUsd", sortDir: "DESC" },
  tvl_asc: { sortBy: "totalDepositsUsd", sortDir: "ASC" },
};

function paramsToSortValue(sortBy: PoolSortBy, sortDir: PoolSortDir): string {
  const field = sortBy === "depositRate" ? "apr" : "tvl";
  return `${field}_${sortDir === "ASC" ? "asc" : "desc"}`;
}

const PAGER_BTN =
  "cursor-pointer rounded-full border border-line bg-surface px-3 py-1 text-[12px] font-semibold text-fg-secondary transition-colors duration-150 hover:border-line-strong hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-fg-secondary";

function familyOf(cfg: OneDeltaConfig): string {
  return cfg.lenderFamily ?? cfg.lenderKey;
}

// Page-local text search — filters only the rows already on screen (the API
// exposes no free-text search param, so this can't reach other pages).
function rowMatches(item: EarnMarketRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const a = item.row.underlyingInfo.asset;
  return `${a.symbol} ${a.name} ${familyOf(item.config)} ${item.config.label}`
    .toLowerCase()
    .includes(q);
}

export function MarketPickerPage({
  rows,
  selectedId,
  isLoading,
  error,
  onSelect,
  chainFilter,
  onChainChange,
  lenderFilter,
  onLenderChange,
  sortBy,
  sortDir,
  onSortChange,
  page,
  hasMore,
  onPrev,
  onNext,
  availableChainIds,
  availableLenders,
}: Props) {
  const [query, setQuery] = useState("");

  const chainIdsForOptions = availableChainIds ?? DEFAULT_CHAIN_IDS;
  // When the consumer narrowed the chain set, "All chains" actually means
  // "all the chains the consumer allows" — relabel so the scope is obvious.
  const allChainsLabel =
    chainIdsForOptions.length < DEFAULT_CHAIN_IDS.length
      ? "All selected chains"
      : "All chains";

  const chainOptions = useMemo<FilterOption[]>(
    () => [
      { value: ALL_CHAINS, label: allChainsLabel, dotBackground: ALL_GRADIENT },
      ...chainIdsForOptions.map((id) => ({
        value: String(id),
        label: getEpochChainById(id)?.name ?? `Chain ${id}`,
        dotColor: chainDotColor(id),
      })),
    ],
    [allChainsLabel, chainIdsForOptions],
  );

  const lenderKeysForOptions = useMemo(() => {
    const source =
      availableLenders && availableLenders.length > 0
        ? availableLenders
        : Object.keys(FAMILY_DISPLAY);
    // Sort by pretty label so the dropdown reads alphabetically regardless of
    // the source order (consumer CSV / API response order is arbitrary).
    return [...source].sort((a, b) =>
      prettifyLender(a).localeCompare(prettifyLender(b)),
    );
  }, [availableLenders]);

  const lenderOptions = useMemo<FilterOption[]>(
    () => [
      { value: ALL_LENDERS, label: "All lenders", dotBackground: ALL_GRADIENT },
      ...lenderKeysForOptions.map((key) => ({
        value: key,
        label: prettifyLender(key),
        dotColor: FAMILY_DOT[key] ?? "var(--epoch-color-primary)",
      })),
    ],
    [lenderKeysForOptions],
  );

  const chainKey = chainFilter === "all" ? ALL_CHAINS : String(chainFilter);
  const visible = useMemo(
    () => rows.filter((item) => rowMatches(item, query)),
    [rows, query],
  );

  if (error) {
    return (
      <p className="m-0 text-[13px] text-error">
        Failed to load markets: {error.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Filter markets on this page"
        autoFocus
        ariaLabel="Filter markets on this page"
      />

      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          ariaLabel="Filter markets by chain"
          value={chainKey}
          onChange={(v) => onChainChange(v === ALL_CHAINS ? "all" : Number(v))}
          options={chainOptions}
          defaultMuted
        />
        <FilterDropdown
          ariaLabel="Filter markets by lender"
          value={lenderFilter || ALL_LENDERS}
          onChange={(v) => onLenderChange(v === ALL_LENDERS ? ALL_LENDERS : v)}
          options={lenderOptions}
          defaultMuted
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className={SECTION_LABEL}>Available markets</span>
        <FilterDropdown
          ariaLabel="Sort markets"
          align="end"
          variant="sort"
          size="sm"
          leadingIcon={<ArrowDownUpIcon />}
          value={paramsToSortValue(sortBy, sortDir)}
          onChange={(v) => {
            const p = SORT_VALUE_TO_PARAMS[v];
            if (p) onSortChange(p.sortBy, p.sortDir);
          }}
          options={SORT_OPTIONS}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton width="100%" height={72} radius="var(--epoch-radius-sm)" />
          <Skeleton width="100%" height={72} radius="var(--epoch-radius-sm)" />
          <Skeleton width="100%" height={72} radius="var(--epoch-radius-sm)" />
        </div>
      ) : visible.length === 0 ? (
        <p className="my-3 text-[13px] text-fg-muted">
          {query.trim()
            ? "No markets on this page match your search."
            : "No markets found."}
        </p>
      ) : (
        <div className="flex flex-col overflow-x-hidden">
          {visible.map((item) => (
            <MarketRowCard
              key={item.market.id}
              row={item.row}
              config={item.config}
              kind="lend"
              selected={selectedId === item.market.id}
              onClick={() => onSelect(item.market, item.row, item.config)}
            />
          ))}
        </div>
      )}

      {!isLoading && (page > 0 || hasMore || visible.length > 0) && (
        <div className="mt-1 flex items-center justify-between gap-2 border-t border-line pt-3 text-[12.5px] text-fg-muted">
          <span>
            {visible.length} market{visible.length === 1 ? "" : "s"} on this page
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={PAGER_BTN}
              disabled={page === 0}
              onClick={onPrev}
              aria-label="Previous page"
            >
              Prev
            </button>
            <span className="tabular-nums">Page {page + 1}</span>
            <button
              type="button"
              className={PAGER_BTN}
              disabled={!hasMore}
              onClick={onNext}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
