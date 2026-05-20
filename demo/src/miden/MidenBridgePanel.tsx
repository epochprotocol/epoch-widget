/**
 * Miden → EVM bridge demo (ported from miden-integration-example CrosschainTab).
 * Styled with Tailwind (demo shell tokens).
 */
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { SendTransaction } from '@miden-sdk/miden-wallet-adapter-base';
import { useMidenFiWallet } from '@miden-sdk/miden-wallet-adapter-react';
import { toast } from 'sonner';
import type { CrossChainIntentParams } from './types/miden';
import type { IntentResult } from './types/miden';
import type { SolveIntentParams } from '@epoch-protocol/epoch-intents-sdk/dist/types';
import { formatQuoteTokenIn } from './services/epoch-bridge';
import { explorerTxUrl, midenscanNoteUrl, truncateHash, MIDEN_CHAIN_ID } from './lib/explorers';
import { DEFAULT_SEPOLIA_CHAIN_ID_STR } from './constants/chains';
import { getMidenFaucetDecimals } from './constants/miden-tokens';
import { useMidenWalletAdapter } from './hooks/useMidenWalletAdapter';
import { useEpochIntent } from './hooks/useEpochIntent';
import { useIntentFlowStatus } from './hooks/useIntentFlowStatus';

const SEPOLIA_TOKENS: ReadonlyArray<{ symbol: string; address: string; decimals: number }> = [
  { symbol: 'USDC', address: '0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69', decimals: 18 },
  { symbol: 'DAI', address: '0xc30f1Ce05d1434d484E9A47283aA925fc8A8699a', decimals: 18 },
  { symbol: 'USDT', address: '0xc04d2869665Be874881133943523723Be5782720', decimals: 18 },
  { symbol: 'WETH', address: '0x7946dd86eE310D0aC16804A37787289Fa5b88A8A', decimals: 18 },
];

function fallbackMidenNoteId(result: IntentResult | null): string | undefined {
  if (!result) return undefined;
  const r = result as unknown as Record<string, unknown>;
  const candidates = [
    r?.midenNoteId,
    (r?.solveResult as Record<string, unknown> | undefined)?.midenNoteId,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0) return c;
  }
  return undefined;
}

export function MidenBridgePanel() {
  const midenWallet = useMidenWalletAdapter({ enabled: true });
  const epoch = useEpochIntent();
  const { requestSend, waitForTransaction } = useMidenFiWallet();
  const { address } = useAccount();

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [minTokenOut, setMinTokenOut] = useState('1000000000000000000');
  const [outputToken, setOutputToken] = useState(SEPOLIA_TOKENS[0].address);
  const [chainId, setChainId] = useState(DEFAULT_SEPOLIA_CHAIN_ID_STR);
  const [confirmStatus, setConfirmStatus] = useState('');
  const [localIntentNonce, setLocalIntentNonce] = useState<string | undefined>(undefined);
  const [localIntentUserAddress, setLocalIntentUserAddress] = useState<string | undefined>(undefined);
  const [localMidenNoteId, setLocalMidenNoteId] = useState<string | undefined>(undefined);
  const [evmAddress, setEvmAddress] = useState('');

  useEffect(() => {
    if (address) {
      setEvmAddress((prev) => (prev.trim() === '' ? address : prev));
    }
  }, [address]);

  const sr = epoch.intentResult?.solveResult as { nonce?: string | number | bigint } | undefined;
  const intentNonceFromEpoch =
    epoch.intentResult?.intentNonce ??
    (sr?.nonce != null ? String(sr.nonce) : undefined);
  const evmAddressFromResult = epoch.intentResult?.intentData?.recipient as string | undefined;
  const destinationChainIdNum = Number.parseInt(chainId, 10);
  const hasValidDestinationChainId = Number.isInteger(destinationChainIdNum) && destinationChainIdNum > 0;
  const effectiveIntentNonce = localIntentNonce ?? intentNonceFromEpoch;
  const effectiveIntentUserAddress =
    localIntentUserAddress ?? evmAddressFromResult ?? (address as string | undefined);
  const intentStatus = useIntentFlowStatus(effectiveIntentUserAddress, effectiveIntentNonce);

  const midenScanBase = import.meta.env.VITE_MIDENSCAN_URL ?? 'https://testnet.midenscan.com';
  const midenNoteUrl = localMidenNoteId ? `${midenScanBase}/note/${localMidenNoteId}` : undefined;

  const resolvedEvmRecipient = (evmAddress.trim() || address || '').trim();
  const hasValidEvmRecipient = /^0x[a-fA-F0-9]{40}$/.test(resolvedEvmRecipient);
  const selectedAsset = midenWallet.assets.find(
    (a) => a.assetId.toLowerCase() === selectedAssetId.toLowerCase(),
  );
  // Hardcoded map — wallet adapter's reported `decimals` is unreliable (often
  // defaults to 8 and silently mis-scales 6-decimal tokens). `undefined` here
  // gates the form via `Number.isFinite` below.
  const midenFaucetDecimals = selectedAssetId
    ? getMidenFaucetDecimals(selectedAssetId)
    : undefined;

  const buildParams = (): CrossChainIntentParams => {
    const addr = resolvedEvmRecipient;
    if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      throw new Error('Set a valid destination EVM address (0x…) or connect an EVM wallet');
    }
    if (!hasValidDestinationChainId) {
      throw new Error('Destination chain ID must be a positive integer.');
    }
    if (!midenWallet.accountId?.hex) {
      throw new Error('Connect Miden wallet first');
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

  const handleGetQuote = () => {
    if (!outputToken || outputToken === '0x0000000000000000000000000000000000000000') {
      toast.error('Select a valid output token');
      return;
    }
    void toast.promise(epoch.fetchQuote(buildParams()), {
      loading: 'Fetching quote…',
      success: 'Quote ready — review and confirm',
      error: (err) => (err instanceof Error ? err.message : 'Quote failed'),
    });
  };

  const handleConfirm = () => {
    if (!epoch.pendingQuote) return;

    const createMidenP2IDNote: SolveIntentParams['createMidenP2IDNote'] = async (
      faucetIdParam,
      amountParam,
      allocatorId,
    ) => {
      setConfirmStatus('Creating P2IDE note on Miden…');
      try {
        if (!midenWallet.accountId?.hex) throw new Error('Missing Miden account id');
        if (!requestSend) throw new Error('Miden wallet adapter not available');

        const normalizedAmount = BigInt(amountParam);
        if (normalizedAmount > BigInt(Number.MAX_SAFE_INTEGER)) {
          throw new Error('Amount too large for wallet adapter send');
        }

        const payload = new SendTransaction(
          midenWallet.accountId.hex,
          allocatorId,
          faucetIdParam,
          'public',
          Number(normalizedAmount),
        );
        const txId = await requestSend(payload);
        if (!waitForTransaction) throw new Error('waitForTransaction not available in adapter');
        const finalized = await waitForTransaction(txId, 120_000);
        const first = finalized.outputNotes?.[0];
        const noteId = first ? first.id().toString() : '';
        if (!noteId) throw new Error(`Could not read output note id for tx ${txId}`);
        setLocalMidenNoteId(noteId);
        return { success: true, noteId };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    };

    void toast.promise(
      (async () => {
        setConfirmStatus('Submitting intent…');
        const result = await epoch.confirmIntent(createMidenP2IDNote);
        if (result && typeof result === 'object' && 'error' in result && (result as { error?: string }).error) {
          throw new Error((result as { error: string }).error);
        }
        if (result && typeof result === 'object') {
          const r = result as unknown as Record<string, unknown>;
          const isNonceLike = (v: unknown) =>
            typeof v === 'string' || typeof v === 'number' || typeof v === 'bigint';
          const rawNonce = isNonceLike(r.nonce)
            ? r.nonce
            : isNonceLike(r.intentNonce)
              ? r.intentNonce
              : isNonceLike((r.solveResult as Record<string, unknown> | undefined)?.nonce)
                ? (r.solveResult as Record<string, unknown>).nonce
                : undefined;
          const nonce = rawNonce != null ? String(rawNonce) : undefined;
          const intentData = r.intentData as { recipient?: string } | undefined;
          const recipient = typeof intentData?.recipient === 'string' ? intentData.recipient : undefined;
          const addr = resolvedEvmRecipient;
          if (nonce) setLocalIntentNonce(nonce);
          setLocalIntentUserAddress((recipient ?? addr)?.trim() || undefined);
        }
        setConfirmStatus('Intent submitted successfully.');
        return 'Cross-chain intent submitted';
      })(),
      {
        loading: 'Confirming intent…',
        success: (msg) => msg,
        error: (err) => {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          setConfirmStatus(`Error: ${msg}. Quote is still saved — try again.`);
          return `Error: ${msg}`;
        },
      },
    );
  };

  const flow = intentStatus.status;
  const txStatuses = intentStatus.statuses;
  const latestStatus = txStatuses[txStatuses.length - 1];
  const latestStatusLabel = latestStatus?.status ? String(latestStatus.status) : undefined;
  const evmStatuses = txStatuses.filter((s) => Number(s.chainId) !== MIDEN_CHAIN_ID);
  const TERMINAL_OK = new Set(['success', 'completed']);
  const evmCompletedStatus = evmStatuses.find(
    (s) =>
      TERMINAL_OK.has(String(s.status).toLowerCase()) &&
      typeof s.transactionHash === 'string' &&
      s.transactionHash.length > 0,
  );
  const evmTransactionHash = evmCompletedStatus?.transactionHash;
  const evmTxChainId = evmCompletedStatus?.chainId ?? destinationChainIdNum;
  const explorerUrl =
    evmTransactionHash && typeof evmTxChainId === 'number'
      ? explorerTxUrl(Number(evmTxChainId), evmTransactionHash)
      : null;

  const result = epoch.intentResult;
  const depositTxHash = result?.solveResult?.depositResult?.transactionHash;
  const depositChainId =
    (result as { depositChainId?: number } | null)?.depositChainId ?? flow?.evmChainId;
  const depositTxUrl =
    depositChainId != null && depositTxHash ? explorerTxUrl(Number(depositChainId), depositTxHash) : null;
  const midenNoteIdForStatus = flow?.midenNoteId ?? fallbackMidenNoteId(result);
  const midenTxId = flow?.midenTxId;
  const midenTxUrl = midenTxId ? explorerTxUrl(MIDEN_CHAIN_ID, midenTxId) : null;
  const noteUrlStatus = midenNoteIdForStatus ? midenscanNoteUrl(midenNoteIdForStatus) : null;

  return (
    <div className="flex flex-col gap-5">
      <header className="mb-1">
        <h2 className="m-0 text-lg font-[650] text-demo-text">Miden → EVM bridge</h2>
        <p className="mt-2 max-w-xl text-[0.8125rem] leading-relaxed text-demo-text-muted">
          Connect an Ethereum wallet and a Miden wallet. Pick a Miden asset and EVM output token, get a quote, then
          confirm to create the P2IDE note and submit the cross-chain intent (same flow as{' '}
          <code className="rounded px-1 py-px text-xs bg-demo-code-bg">miden-integration-example</code>
          ).
        </p>
      </header>

      <section className="rounded-[0.875rem] border border-demo-border bg-demo-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="mb-3 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-demo-text-faint">Wallets</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-demo-border bg-demo-bg p-3">
            <div className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-wide text-demo-text-faint">
              EVM (gas + recipient)
            </div>
            <ConnectButtonPlaceholder />
          </div>
          <div className="rounded-lg border border-demo-border bg-demo-bg p-3">
            <div className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-wide text-demo-text-faint">Miden</div>
            <div className="mb-2 break-all font-mono text-xs text-demo-slate-700">
              {midenWallet.connected ? midenWallet.accountId?.hex ?? 'connected' : 'Not connected'}
            </div>
            <button
              type="button"
              className={`cursor-pointer rounded-lg border-none bg-demo-accent px-3 py-1.5 text-[0.8125rem] font-semibold text-white ${midenWallet.connected ? 'opacity-60' : ''}`}
              disabled={midenWallet.connected}
              onClick={() => void midenWallet.connect()}
            >
              {midenWallet.connected ? 'Connected' : 'Connect Miden'}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[0.875rem] border border-demo-border bg-demo-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h3 className="m-0 text-base font-semibold text-demo-text">Intent details</h3>
        <p className="mt-2 text-[0.8125rem] leading-snug text-demo-text-muted">
          Set minimum EVM output (base units), then <strong>Get quote</strong> and <strong>Confirm &amp; sign</strong>.
        </p>

        <div className="mt-4 flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-wide text-demo-text-faint">
              Source asset (Miden)
            </label>
            <select
              className="box-border w-full rounded-lg border border-demo-border px-2.5 py-2 font-sans text-sm"
              value={selectedAssetId}
              onChange={(e) => {
                setSelectedAssetId(e.target.value);
                epoch.clearQuote();
              }}
              disabled={midenWallet.isLoadingAssets}
            >
              <option value="">{midenWallet.isLoadingAssets ? 'Loading…' : 'Select asset'}</option>
              {midenWallet.assets.map((a) => (
                <option key={a.assetId} value={a.assetId}>
                  {(a.symbol ?? a.assetId.slice(0, 16) + '…')} — {a.amount.toString()}
                </option>
              ))}
            </select>
            <div className="mt-1 text-[0.6875rem] text-demo-text-muted">
              Balance: {selectedAsset?.amount?.toString() ?? '—'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-wide text-demo-text-faint">
                Output token (Sepolia)
              </label>
              <select
                className="box-border w-full rounded-lg border border-demo-border px-2.5 py-2 font-sans text-sm"
                value={outputToken}
                onChange={(e) => {
                  setOutputToken(e.target.value);
                  epoch.clearQuote();
                }}
              >
                {SEPOLIA_TOKENS.map((t) => (
                  <option key={t.address} value={t.address}>
                    {t.symbol}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-wide text-demo-text-faint">
                Min output (wei)
              </label>
              <input
                className="box-border w-full rounded-lg border border-demo-border px-2.5 py-2 font-mono text-sm"
                value={minTokenOut}
                onChange={(e) => {
                  setMinTokenOut(e.target.value);
                  epoch.clearQuote();
                }}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-wide text-demo-text-faint">
              Destination chain ID
            </label>
            <input
              className="box-border w-full rounded-lg border border-demo-border px-2.5 py-2 font-mono text-sm"
              value={chainId}
              onChange={(e) => {
                setChainId(e.target.value);
                epoch.clearQuote();
              }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-wide text-demo-text-faint">
              Destination EVM address
            </label>
            <input
              className="box-border w-full rounded-lg border border-demo-border px-2.5 py-2 font-mono text-sm"
              value={evmAddress}
              onChange={(e) => {
                setEvmAddress(e.target.value);
                epoch.clearQuote();
              }}
              placeholder={address ?? '0x…'}
            />
            {address && (
              <button
                type="button"
                className="mt-1.5 cursor-pointer border-none bg-transparent p-0 text-[0.6875rem] text-blue-600 underline"
                onClick={() => setEvmAddress(address)}
              >
                Use connected wallet
              </button>
            )}
          </div>

          {epoch.pendingQuote && (
            <div className="rounded-xl border border-blue-400/35 bg-blue-500/[0.06] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-demo-text">Quote</span>
                <button
                  type="button"
                  className="cursor-pointer border-none bg-transparent text-[0.6875rem] text-demo-text-muted underline"
                  onClick={() => epoch.clearQuote()}
                >
                  Clear quote
                </button>
              </div>
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="text-[0.625rem] font-semibold uppercase text-amber-900">Required Miden deposit</div>
                <div className="mt-1 font-mono text-lg font-semibold text-demo-amber-900">
                  {(() => {
                    const qr = epoch.pendingQuote.quoteResult as Record<string, unknown>;
                    const tokenInRaw = qr.tokenIn as string | undefined;
                    if (!tokenInRaw) return 'calculated at execution';
                    if (midenFaucetDecimals === undefined) return tokenInRaw;
                    return `${formatQuoteTokenIn(tokenInRaw, midenFaucetDecimals)} ${selectedAsset?.symbol ?? 'tokens'}`;
                  })()}
                </div>
              </div>
            </div>
          )}

          {!epoch.pendingQuote ? (
            <button
              type="button"
              className={`mt-3 w-full rounded-lg border-none px-4 py-2.5 text-sm font-semibold text-white ${
                !canFetch || epoch.isFetchingQuote ? 'cursor-not-allowed bg-demo-accent opacity-50' : 'cursor-pointer bg-demo-accent'
              }`}
              disabled={epoch.isFetchingQuote || !canFetch}
              onClick={handleGetQuote}
            >
              {epoch.isFetchingQuote ? 'Fetching quote…' : 'Get quote'}
            </button>
          ) : (
            <button
              type="button"
              className={`mt-3 w-full rounded-lg border-none px-4 py-2.5 text-sm font-semibold text-white ${
                epoch.isLoading ? 'cursor-not-allowed bg-demo-accent opacity-50' : 'cursor-pointer bg-demo-accent'
              }`}
              disabled={epoch.isLoading}
              onClick={handleConfirm}
            >
              {epoch.isLoading ? 'Processing…' : 'Confirm & sign'}
            </button>
          )}

          {!epoch.isSDKReady && (
            <p className="text-xs text-demo-amber-700">Epoch SDK not ready — connect your EVM wallet (RainbowKit header).</p>
          )}
          {epoch.error && <p className="text-[0.8125rem] text-demo-red-700">{epoch.error}</p>}
          {confirmStatus && (
            <p
              className={`text-[0.8125rem] ${confirmStatus.startsWith('Error') ? 'text-demo-red-700' : 'text-demo-amber-800'}`}
            >
              {confirmStatus}
            </p>
          )}

          {localMidenNoteId && (
            <div className="rounded-lg border border-demo-border bg-demo-bg text-[0.8125rem] p-3">
              <strong className="text-[0.625rem] uppercase text-demo-text-muted">Miden note id</strong>
              <div className="mt-1">
                {midenNoteUrl ? (
                  <a
                    href={midenNoteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all font-mono text-xs text-demo-text"
                  >
                    {localMidenNoteId}
                  </a>
                ) : (
                  <span className="font-mono text-xs">{localMidenNoteId}</span>
                )}
              </div>
            </div>
          )}

          {intentStatus.isPolling && !evmTransactionHash && effectiveIntentNonce && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[0.8125rem] text-demo-amber-800">
              Waiting for EVM execution…{' '}
              {latestStatusLabel ? `Status: ${latestStatusLabel}` : 'Polling every 5s'}
            </div>
          )}

          {evmTransactionHash && explorerUrl && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[0.8125rem]">
              <strong className="text-demo-green-700">EVM tx</strong>
              <div className="mt-1">
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all font-mono text-xs text-demo-green-600"
                >
                  {truncateHash(evmTransactionHash, 12, 10)}
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {(result || epoch.error) && (
        <section className="rounded-[0.875rem] border border-demo-border bg-demo-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h3 className="m-0 text-base font-semibold text-demo-text">Execution status</h3>
          {epoch.error && !result && <p className="text-sm text-demo-red-700">{epoch.error}</p>}
          {result && (
            <div className="mt-3 flex flex-col gap-2">
              {depositTxHash && (
                <StatusRow label="Compact deposit" value={truncateHash(depositTxHash)} href={depositTxUrl} />
              )}
              {midenTxId && <StatusRow label="Miden settlement" value={truncateHash(midenTxId)} href={midenTxUrl} />}
              {midenNoteIdForStatus && (
                <StatusRow label="Miden note" value={truncateHash(midenNoteIdForStatus)} href={noteUrlStatus} />
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function StatusRow({ label: lb, value, href }: { label: string; value: string; href: string | null }) {
  return (
    <div className="rounded-lg border border-demo-border bg-demo-bg px-3 py-2">
      <div className="text-[0.625rem] font-bold uppercase text-demo-text-muted">{lb}</div>
      <div className="mt-1">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="font-mono text-xs">
            {value}
          </a>
        ) : (
          <span className="font-mono text-xs">{value}</span>
        )}
      </div>
    </div>
  );
}

/** RainbowKit lives in the app header — remind users to connect there. */
function ConnectButtonPlaceholder() {
  return (
    <p className="m-0 text-xs leading-normal text-demo-text-muted">
      Use <strong>Connect</strong> in the page header (RainbowKit). This wallet pays gas and receives status polls for{' '}
      <code className="font-mono text-[0.6875rem]">getIntentStatus</code>.
    </p>
  );
}
