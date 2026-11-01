/**
 * Miden → EVM bridge demo (ported from miden-integration-example CrosschainTab).
 * Styled with Tailwind (demo shell tokens).
 */
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import type { CrossChainIntentParams } from "./types/miden";
import type { IntentResult } from "./types/miden";
import { explorerTxUrl, truncateHash, MIDEN_CHAIN_ID } from "./lib/explorers";
import {
  getMidenFaucetDecimals,
  isMidenMainnetUsdcx,
} from "./constants/miden-tokens";
import { BASE_MAINNET_USDC, MIDEN_MAINNET } from "../config/miden-mainnet";
import { useMidenWalletAdapter } from "./hooks/useMidenWalletAdapter";
import { useEpochIntent } from "./hooks/useEpochIntent";
import { useIntentFlowStatus } from "./hooks/useIntentFlowStatus";
import { MidenExecutionStatus } from "./components/MidenExecutionStatus";
import { MidenQuoteCard } from "./components/MidenQuoteCard";
import { MidenWalletsSection } from "./components/MidenWalletsSection";
import { useMidenBridgeIntent } from "./hooks/useMidenBridgeIntent";
import { MidenBridgeFields } from "./components/MidenBridgeFields";

const BASE_TOKENS = [BASE_MAINNET_USDC] as const;
const TERMINAL_OK = new Set(["success", "completed"]);

function fallbackMidenNoteId(result: IntentResult | null): string | undefined {
  if (!result) return undefined;
  const r = result as unknown as Record<string, unknown>;
  const candidates = [
    r?.midenNoteId,
    (r?.solveResult as Record<string, unknown> | undefined)?.midenNoteId,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.length > 0) return c;
  }
  return undefined;
}

export function MidenBridgePanel() {
  const midenWallet = useMidenWalletAdapter({ enabled: true });
  const epoch = useEpochIntent();
  const { address } = useAccount();

  const [minTokenOut, setMinTokenOut] = useState("1000000");
  const outputToken = BASE_MAINNET_USDC.address;
  const chainId = String(BASE_MAINNET_USDC.chainId);
  const [evmAddress, setEvmAddress] = useState("");

  useEffect(() => {
    if (address) {
      setEvmAddress((prev) => (prev.trim() === "" ? address : prev));
    }
  }, [address]);

  const sr = epoch.intentResult?.solveResult as
    | { nonce?: string | number | bigint }
    | undefined;
  const intentNonceFromEpoch =
    epoch.intentResult?.intentNonce ??
    (sr?.nonce != null ? String(sr.nonce) : undefined);
  const evmAddressFromResult = epoch.intentResult?.intentData?.recipient as
    | string
    | undefined;
  const destinationChainIdNum = Number.parseInt(chainId, 10);
  const hasValidDestinationChainId =
    Number.isInteger(destinationChainIdNum) && destinationChainIdNum > 0;
  const resolvedEvmRecipient = (evmAddress.trim() || address || "").trim();
  const hasValidEvmRecipient = /^0x[a-fA-F0-9]{40}$/.test(resolvedEvmRecipient);
  const bridgeAssets = useMemo(
    () =>
      midenWallet.assets.filter((asset) => isMidenMainnetUsdcx(asset.assetId)),
    [midenWallet.assets],
  );
  const selectedAssetId = bridgeAssets[0]?.assetId ?? "";
  const selectedAsset = bridgeAssets.find(
    (a) => a.assetId.toLowerCase() === selectedAssetId.toLowerCase(),
  );
  // Graph-backed decimals avoid the wallet adapter fallback (often
  // 8), which would silently mis-scale six-decimal USDCX. `undefined` here
  // gates the form via `Number.isFinite` below.
  const midenFaucetDecimals = selectedAssetId
    ? getMidenFaucetDecimals(selectedAssetId)
    : undefined;

  const buildParams = (): CrossChainIntentParams => {
    const addr = resolvedEvmRecipient;
    if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      throw new Error(
        "Set a valid destination EVM address (0x…) or connect an EVM wallet",
      );
    }
    if (!hasValidDestinationChainId) {
      throw new Error("Destination chain ID must be a positive integer.");
    }
    if (!midenWallet.accountId?.hex) {
      throw new Error("Connect a public Miden account first");
    }
    if (midenFaucetDecimals === undefined) {
      throw new Error(
        `Unknown Miden faucet ${selectedAssetId} — add it to miden-tokens.ts before sending.`,
      );
    }
    return {
      midenAccountId: midenWallet.accountId.hex,
      midenFaucetId: selectedAssetId,
      midenDecimals: midenFaucetDecimals,
      evmRecipient: addr,
      destinationChainId: destinationChainIdNum,
      outputTokenAddress: outputToken,
      minTokenOut,
    };
  };

  const canFetch =
    epoch.isSDKReady &&
    !!midenWallet.accountId?.hex &&
    !!selectedAssetId &&
    hasValidEvmRecipient &&
    !!outputToken &&
    hasValidDestinationChainId &&
    Number.isFinite(midenFaucetDecimals);

  const intent = useMidenBridgeIntent({
    epoch,
    midenAccountIdHex: midenWallet.accountId?.hex,
    buildParams,
    outputToken,
    resolvedEvmRecipient,
  });

  const effectiveIntentNonce = intent.localIntentNonce ?? intentNonceFromEpoch;
  const effectiveIntentUserAddress =
    intent.localIntentUserAddress ??
    evmAddressFromResult ??
    (address as string | undefined);
  const intentStatus = useIntentFlowStatus(
    effectiveIntentUserAddress,
    effectiveIntentNonce,
  );

  const midenScanBase = MIDEN_MAINNET.explorer;
  const midenNoteUrl = intent.localMidenNoteId
    ? `${midenScanBase}/note/${intent.localMidenNoteId}`
    : undefined;

  const flow = intentStatus.status;
  const txStatuses = intentStatus.statuses;
  const latestStatus = txStatuses[txStatuses.length - 1];
  const latestStatusLabel = latestStatus?.status
    ? String(latestStatus.status)
    : undefined;
  const evmStatuses = txStatuses.filter(
    (s) => Number(s.chainId) !== MIDEN_CHAIN_ID,
  );
  const evmCompletedStatus = evmStatuses.find(
    (s) =>
      TERMINAL_OK.has(String(s.status).toLowerCase()) &&
      typeof s.transactionHash === "string" &&
      s.transactionHash.length > 0,
  );
  const evmTransactionHash = evmCompletedStatus?.transactionHash;
  const evmTxChainId = evmCompletedStatus?.chainId ?? destinationChainIdNum;
  const explorerUrl =
    evmTransactionHash && typeof evmTxChainId === "number"
      ? explorerTxUrl(Number(evmTxChainId), evmTransactionHash)
      : null;

  const result = epoch.intentResult;

  return (
    <div className="flex flex-col gap-5">
      <header className="mb-1">
        <h2 className="m-0 text-lg font-[650] text-fg">Miden → EVM bridge</h2>
        <p className="mt-2 max-w-xl text-[0.8125rem] leading-relaxed text-fg-muted">
          Connect Base and a public Miden mainnet wallet. Deposit native USDCX
          and receive Base USDC, get a quote, then confirm to create the P2IDE
          note and submit the cross-chain intent (same flow as{" "}
          <code className="rounded px-1 py-px text-xs bg-surface-muted">
            miden-integration-example
          </code>
          ).
        </p>
      </header>

      <MidenWalletsSection
        midenConnected={midenWallet.connected}
        midenAccountIdHex={midenWallet.accountId?.hex}
        onConnectMiden={() => void midenWallet.connect()}
      />

      {midenWallet.assetsError ? (
        <p role="alert" className="text-[0.8125rem] text-error">
          {midenWallet.assetsError}
        </p>
      ) : null}
      <section className="rounded-[0.875rem] border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h3 className="m-0 text-base font-semibold text-fg">Intent details</h3>
        <p className="mt-2 text-[0.8125rem] leading-snug text-fg-muted">
          Set minimum EVM output (base units), then <strong>Get quote</strong>{" "}
          and <strong>Confirm &amp; sign</strong>.
        </p>

        <div className="mt-4 flex flex-col gap-3.5">
          <MidenBridgeFields
            assets={bridgeAssets}
            isLoadingAssets={midenWallet.isLoadingAssets}
            outputTokens={BASE_TOKENS}
            selectedAssetId={selectedAssetId}
            outputToken={outputToken}
            minTokenOut={minTokenOut}
            setMinTokenOut={setMinTokenOut}
            chainId={chainId}
            evmAddress={evmAddress}
            setEvmAddress={setEvmAddress}
            connectedAddress={address}
            selectedAssetBalance={selectedAsset?.amount}
            onDirty={epoch.clearQuote}
          />

          {epoch.pendingQuote && (
            <MidenQuoteCard
              tokenInRaw={
                (epoch.pendingQuote.quoteResult as Record<string, unknown>)
                  .tokenIn as string | undefined
              }
              faucetDecimals={midenFaucetDecimals}
              assetSymbol={selectedAsset?.symbol}
              onClear={() => epoch.clearQuote()}
            />
          )}

          {!epoch.pendingQuote ? (
            <button
              type="button"
              className={`mt-3 w-full rounded-lg border-none px-4 py-2.5 text-sm font-semibold text-white ${
                !canFetch || epoch.isFetchingQuote
                  ? "cursor-not-allowed bg-primary opacity-50"
                  : "cursor-pointer bg-primary"
              }`}
              disabled={epoch.isFetchingQuote || !canFetch}
              onClick={intent.getQuote}
            >
              {epoch.isFetchingQuote ? "Fetching quote…" : "Get quote"}
            </button>
          ) : (
            <button
              type="button"
              className={`mt-3 w-full rounded-lg border-none px-4 py-2.5 text-sm font-semibold text-white ${
                epoch.isLoading
                  ? "cursor-not-allowed bg-primary opacity-50"
                  : "cursor-pointer bg-primary"
              }`}
              disabled={epoch.isLoading}
              onClick={intent.confirm}
            >
              {epoch.isLoading ? "Processing…" : "Confirm & sign"}
            </button>
          )}

          {!epoch.isSDKReady && (
            <p className="text-xs text-warning">
              Epoch SDK not ready — connect your EVM wallet (RainbowKit header).
            </p>
          )}
          {epoch.error && (
            <p className="text-[0.8125rem] text-error">{epoch.error}</p>
          )}
          {intent.confirmStatus && (
            <p
              className={`text-[0.8125rem] ${intent.confirmStatus.startsWith("Error") ? "text-error" : "text-warning"}`}
            >
              {intent.confirmStatus}
            </p>
          )}

          {intent.localMidenNoteId && (
            <div className="rounded-lg border border-line bg-canvas text-[0.8125rem] p-3">
              <strong className="text-[0.625rem] uppercase text-fg-muted">
                Miden note id
              </strong>
              <div className="mt-1">
                {midenNoteUrl ? (
                  <a
                    href={midenNoteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all font-mono text-xs text-fg"
                  >
                    {intent.localMidenNoteId}
                  </a>
                ) : (
                  <span className="font-mono text-xs">
                    {intent.localMidenNoteId}
                  </span>
                )}
              </div>
            </div>
          )}

          {intentStatus.isPolling &&
            !evmTransactionHash &&
            effectiveIntentNonce && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[0.8125rem] text-warning">
                Waiting for EVM execution…{" "}
                {latestStatusLabel
                  ? `Status: ${latestStatusLabel}`
                  : "Polling every 5s"}
              </div>
            )}

          {evmTransactionHash && explorerUrl && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[0.8125rem]">
              <strong className="text-success">EVM tx</strong>
              <div className="mt-1">
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all font-mono text-xs text-success"
                >
                  {truncateHash(evmTransactionHash, 12, 10)}
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      <MidenExecutionStatus
        result={result ?? null}
        error={epoch.error ?? null}
        flow={flow ?? undefined}
        fallbackNoteId={fallbackMidenNoteId(result)}
      />
    </div>
  );
}
