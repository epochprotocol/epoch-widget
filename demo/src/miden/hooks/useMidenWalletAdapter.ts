import { useCallback, useEffect, useMemo, useState } from "react";
import { useMidenFiWallet } from "@miden-sdk/miden-wallet-adapter-react";
import {
  AllowedPrivateData,
  PrivateDataPermission,
  WalletAdapterNetwork,
  WalletReadyState,
} from "@miden-sdk/miden-wallet-adapter-base";
import { useAssetMetadata, toBech32AccountId } from "@miden-sdk/react";
import { AccountId, Address } from "@miden-sdk/miden-sdk";
import type { Asset } from "@miden-sdk/miden-wallet-adapter-base";

export interface NormalizedMidenAccountId {
  hex: string;
}

export interface MidenWalletAsset {
  assetId: string; // faucet id
  assetIdDisplay: string;
  amount: bigint;
  symbol?: string;
  decimals?: number;
}

export interface UseMidenWalletAdapterOptions {
  enabled?: boolean;
}

export interface UseMidenWalletAdapterResult {
  connected: boolean;
  connect: () => Promise<void>;
  address: string | null;
  accountId: NormalizedMidenAccountId | null;
  assets: MidenWalletAsset[];
  isLoadingAssets: boolean;
  assetsError: string | null;
  refreshAssets: () => Promise<void>;
}

/** Strip `miden:` prefix and `_BasicWallet`-style interface suffixes before parsing. */
const stripMidenIdDecorators = (raw: string): string => {
  const trimmed = raw.replace(/\s+/g, "").trim().replace(/^miden:/i, "");
  const underscore = trimmed.indexOf("_");
  if (underscore > 0 && (trimmed.startsWith("m") || trimmed.startsWith("M"))) {
    return trimmed.slice(0, underscore);
  }
  return trimmed;
};

/**
 * Parse a Miden account id to canonical hex. Requires WASM — returns null when
 * the SDK is not ready or the format is unrecognized.
 */
const resolveAccountId = (rawAddress: string | null): NormalizedMidenAccountId | null => {
  if (!rawAddress) return null;
  const input = stripMidenIdDecorators(rawAddress);
  if (!input) return null;

  let id: AccountId | null = null;
  try {
    if (input.startsWith("0x") || input.startsWith("0X")) {
      id = AccountId.fromHex(input);
    } else if (/^[0-9a-fA-F]+$/.test(input) && input.length % 2 === 0) {
      id = AccountId.fromHex(`0x${input}`);
    }
  } catch {
    id = null;
  }

  if (!id) {
    try {
      id = Address.fromBech32(input).accountId();
    } catch {
      try {
        id = AccountId.fromBech32(input);
      } catch {
        id = null;
      }
    }
  }

  if (!id) return null;
  try {
    return { hex: id.toString() };
  } catch {
    return null;
  }
};

export function useMidenWalletAdapter(
  options: UseMidenWalletAdapterOptions = {},
): UseMidenWalletAdapterResult {
  const { enabled = true } = options;
  const {
    connected,
    connect: adapterConnect,
    address,
    requestAssets,
    select,
    wallet,
    wallets,
  } = useMidenFiWallet();

  const [accountId, setAccountId] = useState<NormalizedMidenAccountId | null>(null);
  const [rawAssets, setRawAssets] = useState<Asset[]>([]);

  // AccountId parsing touches WASM and often fails on first render. Keep the raw
  // wallet address usable immediately, then upgrade to canonical hex once ready.
  useEffect(() => {
    if (!address?.trim()) {
      setAccountId(null);
      return;
    }

    const trimmed = address.trim();
    const parsed = resolveAccountId(trimmed);
    if (parsed) {
      setAccountId(parsed);
      return;
    }

    if (connected) {
      setAccountId({ hex: trimmed });
    } else {
      setAccountId(null);
    }

    let cancelled = false;
    void import("@miden-sdk/miden-sdk/lazy")
      .then(({ MidenClient }) => MidenClient.ready())
      .then(() => {
        if (cancelled) return;
        const retry = resolveAccountId(trimmed);
        if (retry) setAccountId(retry);
      })
      .catch(() => {
        // Keep fallback raw id when WASM never becomes available.
      });

    return () => {
      cancelled = true;
    };
  }, [address, connected]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);

  const refreshAssets = useCallback(async () => {
    if (!enabled || !connected) return;
    if (!requestAssets) {
      setRawAssets([]);
      setAssetsError("Connected wallet does not support requestAssets()");
      return;
    }
    setIsLoadingAssets(true);
    setAssetsError(null);
    try {
      const raw = await requestAssets();
      setRawAssets(raw ?? []);
    } catch (err) {
      setRawAssets([]);
      setAssetsError(err instanceof Error ? err.message : "Failed to load assets");
    } finally {
      setIsLoadingAssets(false);
    }
  }, [enabled, connected, requestAssets]);

  const faucetIds = useMemo(() => rawAssets.map((a) => a.faucetId), [rawAssets]);
  const { assetMetadata } = useAssetMetadata(faucetIds);

  const assets = useMemo<MidenWalletAsset[]>(
    () =>
      rawAssets.map((a) => {
        const meta = assetMetadata.get(a.faucetId);
        let display = a.faucetId;
        try {
          display = toBech32AccountId(a.faucetId);
        } catch {
          // keep raw faucetId
        }
        return {
          assetId: a.faucetId,
          assetIdDisplay: display,
          amount: BigInt(a.amount),
          symbol: meta?.symbol,
          decimals: meta?.decimals,
        };
      }),
    [rawAssets, assetMetadata],
  );

  const connect = useCallback(async () => {
    if (connected) {
      await refreshAssets();
      return;
    }

    // MidenFiSignerProvider auto-selects a single wallet on the next render,
    // but connect() throws WalletNotSelectedError if called before that lands.
    // Connect through the adapter directly when the context wallet isn't ready.
    const target = wallet ?? wallets[0] ?? null;
    if (!target) {
      throw new Error('No Miden wallet adapter available');
    }

    if (!wallet) {
      select(target.adapter.name);
    }

    if (
      target.readyState === WalletReadyState.Installed ||
      target.readyState === WalletReadyState.Loadable
    ) {
      await target.adapter.connect(
        PrivateDataPermission.UponRequest,
        WalletAdapterNetwork.Testnet,
        AllowedPrivateData.Assets,
      );
    } else {
      await adapterConnect();
    }

    await refreshAssets();
  }, [connected, adapterConnect, refreshAssets, wallet, wallets, select]);

  useEffect(() => {
    if (!enabled || !connected) {
      setRawAssets([]);
      setAssetsError(null);
      setIsLoadingAssets(false);
      return;
    }
    void refreshAssets();
  }, [enabled, connected, refreshAssets]);

  return {
    connected,
    connect,
    address,
    accountId,
    assets,
    isLoadingAssets,
    assetsError,
    refreshAssets,
  };
}

