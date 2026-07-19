import type {
  EpochEarnMarket,
  EpochEarnPosition,
  EpochEarnPositionsSummary,
  OneDeltaConfig,
  OneDeltaMarketRow,
} from "../../types.js";
import { chainLabelFor } from "./configs.js";

// ---------------------------------------------------------------------------
// 1delta market → EpochEarnMarket adapters
// ---------------------------------------------------------------------------

function vaultAddressFromMarketUid(marketUid: string): string {
  const parts = marketUid.split(":");
  return parts[parts.length - 1] ?? marketUid;
}

function chainIdFromMarketUid(marketUid: string): string | undefined {
  const parts = marketUid.split(":");
  return parts[1];
}

export function toEpochEarnMarket(
  row: OneDeltaMarketRow,
  config: OneDeltaConfig,
  kind: "lend" | "borrow" = "lend",
): EpochEarnMarket {
  const asset = row.underlyingInfo.asset;
  const rowChainId =
    asset.chainId ?? chainIdFromMarketUid(row.marketUid) ?? config.chainId;
  const chainLabel = chainLabelFor(rowChainId);
  const apr =
    kind === "lend" ? row.depositRate / 100 : row.variableBorrowRate / 100;

  return {
    id: `${config.lenderKey}:${config.configId}:${row.marketUid}:${kind}`,
    displayName: asset.symbol,
    chainLabel,
    aprDecimal: apr,
    vaultAddress: vaultAddressFromMarketUid(row.marketUid),
    token: {
      address: asset.address,
      symbol: asset.symbol,
      decimals: asset.decimals,
      logoURI: asset.logoURI ?? undefined,
    },
    destinationChainName: chainLabel,
    oneDeltaMarketUid: row.marketUid,
    chainId: Number(rowChainId),
    lenderKey: config.lenderKey,
  };
}

export function flattenConfigsToMarkets(
  configs: OneDeltaConfig[],
): EpochEarnMarket[] {
  const out: EpochEarnMarket[] = [];
  for (const cfg of configs) {
    for (const row of cfg.collaterals)
      out.push(toEpochEarnMarket(row, cfg, "lend"));
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1delta positions response → EpochEarnPosition adapters
// ---------------------------------------------------------------------------

interface RawAsset {
  chainId?: string;
  address?: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  logoURI?: string | null;
}

interface RawPrices {
  priceUsd?: number;
  priceChange24h?: number;
}

interface RawUnderlyingInfo {
  asset?: RawAsset;
  prices?: RawPrices;
}

interface RawPosition {
  marketUid?: string;
  deposits?: string;
  debt?: string;
  depositsUSD?: number;
  withdrawable?: string;
  collateralEnabled?: boolean;
  underlyingInfo?: RawUnderlyingInfo;
}

interface RawAprData {
  apr?: number;
  depositApr?: number;
  borrowApr?: number;
}

interface RawBalanceData {
  deposits?: number;
  debt?: number;
  nav?: number;
  deposits24h?: number;
  nav24h?: number;
}

interface RawAccountBucket {
  positions?: RawPosition[];
}

interface RawLenderInfo {
  lenderKey?: string;
  name?: string;
  logoUri?: string;
}

interface RawItem {
  lender?: string;
  chainId?: string;
  aprData?: RawAprData;
  balanceData?: RawBalanceData;
  data?: RawAccountBucket[];
  lenderInfo?: RawLenderInfo;
}

interface RawSummary {
  balanceData?: RawBalanceData;
  aprData?: RawAprData;
  activeLenders?: number;
  activeChains?: number;
}

interface RawResponse {
  success?: boolean;
  data?: {
    items?: RawItem[];
    summary?: RawSummary;
  };
}

function asResponse(raw: unknown): RawResponse | null {
  return raw && typeof raw === "object" ? (raw as RawResponse) : null;
}

function humanToRaw(human: string | undefined, decimals: number): string {
  if (!human || human === "0") return "0";
  const negative = human.startsWith("-");
  const s = negative ? human.slice(1) : human;
  const [whole = "0", frac = ""] = s.split(".");
  const fracPadded = frac.padEnd(decimals, "0").slice(0, decimals);
  const combined = `${whole}${fracPadded}`.replace(/^0+(?=\d)/, "");
  const result = combined === "" ? "0" : combined;
  return negative ? `-${result}` : result;
}

function findConfigMarket(
  marketUid: string | undefined,
  configs: OneDeltaConfig[],
): { row: OneDeltaConfig["collaterals"][number]; cfg: OneDeltaConfig } | null {
  if (!marketUid) return null;
  const target = marketUid.toLowerCase();
  for (const cfg of configs) {
    for (const row of cfg.collaterals) {
      if (row.marketUid.toLowerCase() === target) return { row, cfg };
    }
  }
  return null;
}

function buildMarket(
  item: RawItem,
  rawPos: RawPosition,
  configs: OneDeltaConfig[],
): EpochEarnMarket | null {
  const asset = rawPos.underlyingInfo?.asset;
  if (!asset?.address || !asset.symbol || asset.decimals === undefined)
    return null;

  const chainIdStr = asset.chainId ?? item.chainId ?? "";
  const chainLabel = chainLabelFor(chainIdStr);
  const lenderKey = item.lender ?? item.lenderInfo?.lenderKey ?? "UNKNOWN";
  const lenderName = item.lenderInfo?.name ?? lenderKey.replace("_", " ");
  const aprPercent = item.aprData?.depositApr ?? item.aprData?.apr ?? 0;
  const configHit = findConfigMarket(rawPos.marketUid, configs);

  return {
    id: rawPos.marketUid ?? `${lenderKey}:${chainIdStr}:${asset.address}`,
    displayName: `${asset.symbol} · ${lenderName}`,
    chainLabel,
    aprDecimal: aprPercent / 100,
    vaultAddress: asset.address,
    token: {
      address: asset.address,
      symbol: asset.symbol,
      decimals: asset.decimals,
      logoURI: asset.logoURI ?? undefined,
    },
    destinationChainName: chainLabel,
    oneDeltaMarketUid: rawPos.marketUid,
    chainId: chainIdStr
      ? Number(chainIdStr)
      : configHit?.cfg.chainId
        ? Number(configHit.cfg.chainId)
        : undefined,
    lenderKey,
    lenderName,
    lenderLogoURI: item.lenderInfo?.logoUri,
  };
}

function isCollateralPosition(p: RawPosition): boolean {
  const deposits = parseFloat(p.deposits ?? "0");
  return Number.isFinite(deposits) && deposits > 0;
}

export function oneDeltaPositionsToEpoch(
  raw: unknown,
  configs: OneDeltaConfig[],
): EpochEarnPosition[] {
  const response = asResponse(raw);
  const items = response?.data?.items ?? [];
  const out: EpochEarnPosition[] = [];

  for (const item of items) {
    for (const bucket of item.data ?? []) {
      for (const rawPos of bucket.positions ?? []) {
        if (!isCollateralPosition(rawPos)) continue;
        const market = buildMarket(item, rawPos, configs);
        if (!market) {
          console.warn(
            "[positions-adapter] dropped row — missing asset metadata",
            rawPos,
          );
          continue;
        }
        const decimals = market.token.decimals;
        const depositsRaw = humanToRaw(rawPos.deposits, decimals);
        const withdrawableRaw = humanToRaw(
          rawPos.withdrawable ?? rawPos.deposits,
          decimals,
        );
        out.push({
          id: market.id,
          market,
          shareBalanceRaw: depositsRaw,
          underlyingBalanceRaw: depositsRaw,
          withdrawableRaw,
          underlyingUsdValue: rawPos.depositsUSD,
          priceChange24h: rawPos.underlyingInfo?.prices?.priceChange24h,
          collateralEnabled: rawPos.collateralEnabled,
        });
      }
    }
  }
  out.sort((a, b) => {
    const av = a.underlyingUsdValue ?? -Infinity;
    const bv = b.underlyingUsdValue ?? -Infinity;
    return bv - av;
  });
  return out;
}

export function oneDeltaPositionsSummary(
  raw: unknown,
): EpochEarnPositionsSummary | null {
  const response = asResponse(raw);
  const summary = response?.data?.summary;
  if (!summary) return null;
  const bal = summary.balanceData ?? {};
  const apr = summary.aprData ?? {};
  return {
    depositsUsd: bal.deposits ?? 0,
    debtUsd: bal.debt ?? 0,
    navUsd: bal.nav ?? 0,
    deposits24hUsd: bal.deposits24h ?? 0,
    nav24hUsd: bal.nav24h ?? 0,
    netAprDecimal: (apr.apr ?? apr.depositApr ?? 0) / 100,
    activeLenders: summary.activeLenders ?? 0,
    activeChains: summary.activeChains ?? 0,
  };
}

export function deriveChainsAndLenders(configs: OneDeltaConfig[]): {
  chains: string;
  lenders: string;
} {
  const chainSet = new Set<string>();
  const lenderSet = new Set<string>();
  for (const cfg of configs) {
    if (cfg.chainId) chainSet.add(String(cfg.chainId));
    if (cfg.lenderKey) lenderSet.add(cfg.lenderKey);
  }
  return {
    chains: Array.from(chainSet).join(","),
    lenders: Array.from(lenderSet).join(","),
  };
}
