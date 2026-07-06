import { useCallback, useEffect, useRef, useState } from 'react';
import { createPublicClient, http, keccak256, parseUnits, toBytes } from 'viem';
import type { WalletClient } from 'viem';
import { TaskType } from '@epoch-protocol/epoch-commons-sdk';
import {
  CollateralType,
  EpochIntentSDK,
  resolveWalletBatchStrategy,
  executeWalletBatch,
  isUserWalletRejection,
} from '@epoch-protocol/epoch-intents-sdk';
import type { RoutingAndLiquidityOptions } from '../types';
import type {
  EarnMidenCreateP2IDNote,
  EpochEarnMarket,
  EpochEarnPosition,
  EpochToken,
  IntentCompletePayload,
  IntentSentPayload,
  OnErrorCtx,
  OnSignCtx,
  OnStartCtx,
  OnSuccessCtx,
} from '../types';
import {
  EARN_MIDEN_EXTRA_FIELDS,
  EVM_ZERO_ADDRESS,
  normalizeMidenId,
} from './miden';

export type EarnIntentFlowStatus =
  | 'idle'
  | 'quoting'
  | 'submitting'
  | 'sent'
  | 'polling'
  | 'complete'
  | 'error';

interface ExecutionTx {
  target: string;
  value: string;
  callData: string;
}

interface EarnQuote {
  tokenIn?: string;
  tokenOut?: string;
  asset?: string;
  executionTransactions: ExecutionTx[];
  resourceLockRequired: boolean;
  raw?: unknown;
}

interface EarnQuoteInput {
  tab: 'deposit' | 'withdraw';
  amount: string;
  market?: EpochEarnMarket | null;
  position?: EpochEarnPosition | null;
  sourceChainId: number;
  sourceToken: EpochToken;
  network: 'mainnet' | 'testnet';
  /** When set, collateral is locked in a Miden P2IDE note instead of EVM Compact. */
  midenSource?: {
    accountId: string;
    faucetId: string;
    decimals: number;
    createP2IDNote: EarnMidenCreateP2IDNote;
    reclaimHeight?: number;
  };
  /** Withdraw-only. When true, signals the 1delta API to use protocol-level max-withdraw
   *  mechanisms (maxUint256 / share-based redemption) where supported. */
  isAll?: boolean;
  /** Withdraw-only. When true, the intent declares a cross-token / cross-chain
   *  delivery: SIO chains 1delta withdraw on the position chain with a
   *  swap/bridge step that converts the underlying to {@link smartDestTokenAddress}
   *  on {@link smartDestChainId} before delivering to the user. */
  smartWithdraw?: boolean;
  smartDestChainId?: number | null;
  smartDestTokenAddress?: string;
}

interface EarnSubmitInput extends EarnQuoteInput {
  quote: EarnQuote | null;
}

interface UseEarnIntentFlowParams {
  apiBaseUrl: string;
  address: string | undefined;
  walletClient?: WalletClient | null;
  sessionId: string;
  /** Opt-in EIP-7702 gasless Compact deposit. */
  gasless?: boolean;
  /** @deprecated SIO now selects the solver via smallocator; this prop is ignored. */
  earnSolverUrl?: string;
  routingAndLiquidityOptions?: RoutingAndLiquidityOptions;
  onIntentSent?: (data: IntentSentPayload) => void;
  onIntentComplete?: (data: IntentCompletePayload) => void;
  onError?: (ctx: OnErrorCtx) => void;
  onStart?: (ctx: OnStartCtx) => void;
  onSign?: (ctx: OnSignCtx) => void;
  onSuccess?: (ctx: OnSuccessCtx) => void;
  onRequestClose?: () => void;
}

const POLL_INTERVAL_MS = 3000;
const AUTO_CLOSE_DELAY_MS = 2500;

// Smart Withdraw = withdraw a lending position and deliver on another chain/token.
// It runs as TWO calls — (1) withdraw the position to plain underlying, (2) a
// cross-chain GetTokenOut swap of that underlying — fused into ONE atomic batch
// via EIP-5792 `wallet_sendCalls`. No router contract: the box-deposit
// (depositERC20AndRegister) is signature-free calldata, so [withdraw, approve,
// deposit] is a single batch; then `submitAllocation` (a plain POST) starts
// solving. Wallets without batching fall back to the sequential 2-tx path.
const SMART_WITHDRAW_SLIPPAGE_BPS = 100n; // 1% floor on the cross-chain swap leg
const ZERO_BYTES32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

// Stage logger — makes the Smart Withdraw flow traceable in the console and
// maps 1:1 onto the network tab. NOTE: each `getIntentQuote` call below hits
// the allocator's `getCompactData` (GET keyed by sponsor address) followed by
// `POST /checkIfDepositNeeded`, so *one logged "quote" = one such request pair*.
// If you see these repeating, count the `swLog('…quote…')` lines to see which
// leg is firing and how many times.
// Gated tracer for the Smart Withdraw flow — silent by default. Enable at
// runtime with `window.__EPOCH_DEBUG__ = true` or `localStorage['epoch:debug']='1'`.
const swDebugEnabled = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    return (
      (window as { __EPOCH_DEBUG__?: boolean }).__EPOCH_DEBUG__ === true ||
      window.localStorage?.getItem('epoch:debug') === '1'
    );
  } catch {
    return false;
  }
};
const swLog = (stage: string, data?: Record<string, unknown>) => {
  if (!swDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.info(`[SmartWithdraw] ${stage}`, data ?? {});
};

// True only for SUBMISSION-time "wallet can't do wallet_sendCalls" errors (e.g.
// smart account switched off after the capability probe). These fire from
// sendCalls before anything lands on-chain, so it's safe to retry per-tx. A
// mid-batch revert has a different signature and is deliberately NOT matched —
// retrying that would double-execute the withdraw.
const isBatchingUnsupported = (err: unknown): boolean => {
  const m = (err instanceof Error ? err.message : String(err ?? '')).toLowerCase();
  return (
    m.includes('wallet_sendcalls') ||
    m.includes('does not support') ||
    m.includes('unsupported method') ||
    m.includes('method not supported') ||
    m.includes('method not found') ||
    m.includes('4200') ||
    m.includes('32601')
  );
};

function isSmartWithdrawInput(input: EarnQuoteInput): boolean {
  return (
    input.tab === 'withdraw' &&
    input.smartWithdraw === true &&
    input.smartDestChainId != null &&
    !!input.smartDestTokenAddress
  );
}

/**
 * Compact quote/submit uses `walletClient.chain.id` as the intent origin chain.
 * Miden-funded earn deposits must override this to the virtual Miden chain id even
 * when the connected EVM wallet is on Sepolia (same pattern as demo Miden bridge).
 */
function createEarnIntentSdk(
  apiBaseUrl: string,
  walletClient: WalletClient,
  originChainId?: number,
): EpochIntentSDK {
  const effectiveChainId = originChainId ?? walletClient.chain?.id;
  const client =
    effectiveChainId != null && effectiveChainId !== walletClient.chain?.id
      ? ({
          ...walletClient,
          chain: { ...(walletClient.chain ?? {}), id: effectiveChainId },
        } as WalletClient)
      : walletClient;

  return new EpochIntentSDK({
    apiBaseUrl,
    walletClient: client as unknown as never,
  });
}

// All earn intents route through the Epoch graph protocol name embedded in
// `marketUid` (e.g. `DUMMY_LENDING:84532:0x…` → `dummy-lending`). Falls back
// to 1delta for bundled mainnet markets.
const ONEDELTA_PROTOCOL_NAME = '1delta';

function earnProtocolName(marketUid: string): string {
  const prefix = marketUid.split(':')[0]?.toUpperCase();
  if (prefix === 'DUMMY_LENDING') return 'dummy-lending';
  return ONEDELTA_PROTOCOL_NAME;
}

export function useEarnIntentFlow({
  apiBaseUrl,
  address,
  walletClient,
  sessionId,
  routingAndLiquidityOptions,
  gasless = false,
  onIntentSent,
  onIntentComplete,
  onError,
  onStart,
  onSign,
  onSuccess,
  onRequestClose,
}: UseEarnIntentFlowParams) {
  const [status, setStatus] = useState<EarnIntentFlowStatus>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [statusProgress, setStatusProgress] = useState(0);
  const [nonce, setNonce] = useState<string | null>(null);
  const [quote, setQuote] = useState<EarnQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Live label for the CURRENT sub-stage of a submit (which quote is in flight,
  // waiting on the wallet, submitting…). Surfaced on the CTA so the button says
  // exactly what round-trip is happening instead of a generic "Routing…".
  const [stepLabel, setStepLabel] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const gaslessRef = useRef(gasless);
  gaslessRef.current = gasless;
  const quoteCallIdRef = useRef(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCheckingRef = useRef(false);
  // Cache last quote params so submit() can reuse without a re-quote.
  const pendingQuoteRef = useRef<{
    taskTypeString: string;
    intentData: any;
    quoteResult: any;
    /** Origin chain forwarded to Compact/SIO (Miden virtual id for P2ID deposits). */
    originChainId?: number;
  } | null>(null);

  const onIntentSentRef = useRef(onIntentSent);
  const onIntentCompleteRef = useRef(onIntentComplete);
  const onErrorRef = useRef(onError);
  const onStartRef = useRef(onStart);
  const onSignRef = useRef(onSign);
  const onSuccessRef = useRef(onSuccess);
  const onRequestCloseRef = useRef(onRequestClose);
  onIntentSentRef.current = onIntentSent;
  onIntentCompleteRef.current = onIntentComplete;
  onErrorRef.current = onError;
  onStartRef.current = onStart;
  onSignRef.current = onSign;
  onSuccessRef.current = onSuccess;
  onRequestCloseRef.current = onRequestClose;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    quoteCallIdRef.current += 1;
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    isCheckingRef.current = false;
    setStatus('idle');
    setActiveStep(0);
    setStatusProgress(0);
    setNonce(null);
    setQuote(null);
    setQuoteError(null);
    setError(null);
    setStepLabel(null);
    pendingQuoteRef.current = null;
  }, []);

  // Build the params an Epoch intent needs for an earn (lending) deposit/withdraw.
  //
  // Deposit:  tokenIn = user-selected source token, tokenOut = market underlying.
  //           SIO chains bridge/swap before 1delta if source ≠ destination.
  // Withdraw: tokenIn = market underlying on the position chain (post-withdraw
  //           equivalent). When Smart Withdraw is OFF, tokenOut = underlying on
  //           the same chain — single-leg flow. When Smart Withdraw is ON,
  //           tokenOut = user-picked destination token on destination chain;
  //           SIO is expected to chain a bridge/swap leg AFTER the 1delta
  //           withdraw runs on the position chain. The action's chain is
  //           surfaced via `extraData.actionChainId` so the SIO path-finder
  //           can pin the withdraw to the source rather than the destination.
  const buildParams = useCallback(
    (input: EarnQuoteInput) => {
      const market = input.market ?? input.position?.market;
      if (!market) throw new Error('Market missing');
      const marketUid = market.oneDeltaMarketUid;
      if (!marketUid) throw new Error('Market is missing the 1delta marketUid');

      const sourceToken = input.sourceToken;
      if (!sourceToken) throw new Error('Source token missing');

      // Internal-consistency check on the market object. marketUid encodes the
      // canonical (chain, underlying) tuple — `LENDER:chainId:underlyingAddr`.
      // If the picker handed us a market whose chainId or token.address
      // disagrees with the marketUid, downstream routing will quote with one
      // tuple and settle against another. Fail fast at intent-build time with
      // a message that points at the offending field — easier than chasing a
      // revert in the solver.
      const muidParts = marketUid.split(':');
      const muidChain = muidParts[1];
      const muidUnderlying = muidParts[2];
      if (
        muidChain &&
        market.chainId != null &&
        Number(muidChain) !== Number(market.chainId)
      ) {
        throw new Error(
          `Market chainId mismatch: marketUid chain ${muidChain} ≠ market.chainId ${market.chainId}`,
        );
      }
      if (
        muidUnderlying &&
        market.token?.address &&
        muidUnderlying.toLowerCase() !==
          (market.token.address as string).toLowerCase()
      ) {
        throw new Error(
          `Market underlying mismatch: marketUid underlying ${muidUnderlying} ≠ market.token.address ${market.token.address}`,
        );
      }

      const isWithdraw = input.tab === 'withdraw';
      const isMidenDeposit = !isWithdraw && !!input.midenSource;

      const protocolHashIdentifier = keccak256(toBytes(earnProtocolName(marketUid)));
      const underlyingAddress = market.token.address as string;
      const actionChainId =
        market.chainId != null ? String(market.chainId) : muidChain ?? '1';

      // Smart Withdraw is handled by `submitSmartWithdraw` (a 2-leg batch:
      // withdraw → cross-chain swap), so buildParams only ever builds the plain
      // same-chain leg: tokenOut = underlying on the position chain.
      const destinationChainId = actionChainId;
      const tokenOutAddress = underlyingAddress as `0x${string}`;

      const isSameChain = isMidenDeposit
        ? false
        : input.sourceChainId === Number(destinationChainId);
      const payAsset = underlyingAddress;

      const extraDataFields = ['string marketUid', 'string action', 'string payAsset'];
      if (isWithdraw) extraDataFields.push('bool isAll', 'bool simulate');
      if (isMidenDeposit) extraDataFields.push(...EARN_MIDEN_EXTRA_FIELDS);
      const extraDataTypestring = extraDataFields.join(',');

      const extraData: Record<string, string | boolean> = {
        marketUid,
        action: input.tab,
        payAsset,
      };
      if (isWithdraw) {
        extraData.isAll = input.isAll === true;
        extraData.simulate = true;
      }
      if (isMidenDeposit && input.midenSource) {
        extraData.midenSourceAccount = normalizeMidenId(input.midenSource.accountId);
        extraData.midenFaucetId = normalizeMidenId(input.midenSource.faucetId);
        extraData.midenNoteType = 'P2IDE';
        extraData.midenNoteId = '';
        extraData.midenReclaimHeight = String(input.midenSource.reclaimHeight ?? 1000);
      }

      const tokenInDecimals = isMidenDeposit
        ? input.midenSource!.decimals
        : sourceToken.decimals;
      const tokenInAmount = parseUnits(
        input.amount.trim().replace(/,/g, ''),
        tokenInDecimals,
      ).toString();

      const tokenInAddress = isMidenDeposit
        ? (EVM_ZERO_ADDRESS as `0x${string}`)
        : (sourceToken.address as `0x${string}`);

      return {
        tokenInAmount,
        destinationChainId,
        protocolHashIdentifier,
        tokenInAddress,
        tokenOutAddress,
        recipient: (address ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
        extraDataTypestring,
        extraData,
        isSameChain,
        isMidenDeposit,
        midenSource: input.midenSource,
      };
    },
    [address],
  );

  // ---- Quote ----------------------------------------------------------------
  const fetchQuote = useCallback(
    async (input: EarnQuoteInput) => {
      if (!address || !walletClient) return;
      if (!input.amount.trim()) return;
      swLog('fetchQuote', {
        tab: input.tab,
        smart: input.smartWithdraw === true,
        amount: input.amount,
        destChainId: input.smartDestChainId ?? null,
      });

      // Smart Withdraw preview: quote the cross-chain swap leg (underlying →
      // destination token) so the user sees the final received amount. The
      // withdraw leg is ~1:1 underlying, so the swap output is the headline.
      if (isSmartWithdrawInput(input)) {
        const market = input.market ?? input.position?.market;
        if (!market) {
          setQuoteError('Market missing');
          return;
        }
        const underlyingAddress = market.token.address as `0x${string}`;
        let amountRaw: string;
        try {
          amountRaw = parseUnits(
            input.amount.trim().replace(/,/g, ''),
            market.token.decimals,
          ).toString();
        } catch (e) {
          setQuoteError((e as Error).message);
          return;
        }
        const callId = ++quoteCallIdRef.current;
        setStatus('quoting');
        setQuote(null);
        setQuoteError(null);
        pendingQuoteRef.current = null;
        try {
          const sdk = createEarnIntentSdk(apiBaseUrl, walletClient);
          const { taskTypeString, intentData } = await sdk.getTaskData({
            taskType: TaskType.GetTokenOut,
            intentData: {
              isNative: false,
              depositTokenAddress: underlyingAddress,
              tokenInAmount: amountRaw,
              outputTokenAddress: input.smartDestTokenAddress as `0x${string}`,
              minTokenOut: '0',
              destinationChainId: String(input.smartDestChainId),
              protocolHashIdentifier: ZERO_BYTES32,
              recipient: address as `0x${string}`,
            },
            extraDataTypestring: '',
            extraData: {},
          });
          const quoteResult = await sdk.getIntentQuote({
            sponsorAddress: address as `0x${string}`,
            taskTypeString,
            intentData,
            isNative: false,
          });
          if (callId !== quoteCallIdRef.current || !mountedRef.current) return;
          if (!quoteResult?.success) {
            setQuoteError(
              (quoteResult as { error?: string } | undefined)?.error ??
                'Quote unavailable',
            );
            setStatus('idle');
            return;
          }
          swLog('preview:quote ok (GetTokenOut)', {
            tokenOut: quoteResult.tokenOut,
          });
          setQuote({
            tokenIn: quoteResult.tokenIn,
            tokenOut: quoteResult.tokenOut,
            asset: input.smartDestTokenAddress,
            executionTransactions: [],
            resourceLockRequired: true,
            raw: quoteResult,
          });
          setStatus('idle');
        } catch (err) {
          if (callId !== quoteCallIdRef.current || !mountedRef.current) return;
          setQuoteError(err instanceof Error ? err.message : String(err));
          setStatus('idle');
        }
        return;
      }

      let params: ReturnType<typeof buildParams>;
      try {
        params = buildParams(input);
      } catch (e) {
        setQuoteError((e as Error).message);
        return;
      }

      const callId = ++quoteCallIdRef.current;
      setStatus('quoting');
      setQuote(null);
      setQuoteError(null);
      pendingQuoteRef.current = null;

      try {
        const originChainId = params.isMidenDeposit ? input.sourceChainId : undefined;
        const sdk = createEarnIntentSdk(apiBaseUrl, walletClient, originChainId);

        const { taskTypeString, intentData } = await sdk.getTaskData({
          taskType: TaskType.ProtocolInteraction,
          intentData: {
            isNative: false,
            depositTokenAddress: params.tokenInAddress,
            tokenInAmount: params.tokenInAmount,
            outputTokenAddress: params.tokenOutAddress,
            minTokenOut: '0',
            destinationChainId: params.destinationChainId,
            protocolHashIdentifier: params.protocolHashIdentifier,
            recipient: params.recipient,
          },
          extraDataTypestring: params.extraDataTypestring,
          extraData: params.extraData,
        });

        const quoteResult = await sdk.getIntentQuote({
          sponsorAddress: address as `0x${string}`,
          taskTypeString,
          intentData,
          isNative: false,
          ...(routingAndLiquidityOptions
            ? { routingAndLiquidityOptions }
            : {}),
        });

        if (callId !== quoteCallIdRef.current || !mountedRef.current) return;

        if (!quoteResult?.success) {
          setQuoteError(
            (quoteResult as { error?: string } | undefined)?.error ?? 'Quote unavailable',
          );
          setStatus('idle');
          return;
        }

        const txs: ExecutionTx[] = (quoteResult.transactions ?? []) as ExecutionTx[];
        setQuote({
          tokenIn: quoteResult.tokenIn,
          tokenOut: quoteResult.tokenOut,
          asset: params.tokenOutAddress,
          executionTransactions: txs,
          resourceLockRequired: !!quoteResult.resourceLockRequired,
          raw: quoteResult,
        });
        pendingQuoteRef.current = {
          taskTypeString,
          intentData,
          quoteResult,
          originChainId,
        };
        setStatus('idle');
      } catch (err) {
        if (callId !== quoteCallIdRef.current || !mountedRef.current) return;
        setQuoteError(err instanceof Error ? err.message : String(err));
        setStatus('idle');
      }
    },
    [address, walletClient, apiBaseUrl, buildParams, routingAndLiquidityOptions],
  );

  // ---- Poll intent status ---------------------------------------------------
  const checkIntentStatus = useCallback(
    async (nonceStr: string, sdk: EpochIntentSDK) => {
      if (!address || isCheckingRef.current) return;
      isCheckingRef.current = true;
      try {
        const statusList = await sdk.getIntentStatus(address, nonceStr);
        if (!mountedRef.current) return;
        const isComplete = Array.isArray(statusList)
          ? statusList.some(
              (s: { status?: string }) =>
                s.status === 'completed' ||
                s.status === 'finalized' ||
                s.status === 'success',
            )
          : false;

        if (isComplete) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setStatusProgress(100);
          setStatus('complete');
          onIntentCompleteRef.current?.({ nonce: nonceStr, status: statusList });
          onSuccessRef.current?.({ sessionId, nonce: nonceStr, status: statusList });
          setTimeout(() => {
            if (mountedRef.current) onRequestCloseRef.current?.();
          }, AUTO_CLOSE_DELAY_MS);
        } else {
          setStatusProgress((p) => Math.min(p + 5, 95));
        }
      } catch {
        /* swallow — poll again */
      } finally {
        isCheckingRef.current = false;
      }
    },
    [address, sessionId],
  );

  // Shared tail for both `submit` and `submitSmartWithdraw`: if the solve
  // returned a nonce, move to polling; otherwise mark complete and auto-close.
  const beginPolling = useCallback(
    (n: string | null, data: unknown, sdk: EpochIntentSDK) => {
      if (!mountedRef.current) return;
      if (n) {
        setNonce(n);
        setStatus('sent');
        onIntentSentRef.current?.({ nonce: n });
        setStatus('polling');
        setActiveStep(4);
        checkIntentStatus(n, sdk);
        pollingRef.current = setInterval(
          () => checkIntentStatus(n, sdk),
          POLL_INTERVAL_MS,
        );
      } else {
        setStatus('complete');
        setStatusProgress(100);
        setActiveStep(5);
        onIntentCompleteRef.current?.({ nonce: '', status: data });
        onSuccessRef.current?.({ sessionId, nonce: '', status: data });
        setTimeout(() => {
          if (mountedRef.current) onRequestCloseRef.current?.();
        }, AUTO_CLOSE_DELAY_MS);
      }
    },
    [sessionId, checkIntentStatus],
  );

  // ---- Smart Withdraw (batch: withdraw → cross-chain swap) -------------------
  // Builds the two legs as calldata and fuses them into one atomic
  // `wallet_sendCalls` batch (no router). Falls back to sequential 2-tx when the
  // wallet has no EIP-5792 batching. The box-deposit calls + the `/compact`
  // payload come from the SDK's `buildResourceLockCalls` (build, don't send).
  const submitSmartWithdraw = useCallback(
    async (input: EarnSubmitInput) => {
      if (!address || !walletClient) {
        setError('Wallet client unavailable');
        setStatus('error');
        return;
      }
      const market = input.market ?? input.position?.market;
      if (!market) {
        setError('Market missing');
        setStatus('error');
        return;
      }
      const underlyingAddress = market.token.address as `0x${string}`;
      const destChainId = input.smartDestChainId as number;
      const destToken = input.smartDestTokenAddress as `0x${string}`;
      const sponsor = address as `0x${string}`;

      setError(null);
      setStatus('submitting');
      setActiveStep(1);
      setStatusProgress(10);
      setStepLabel('Quoting withdrawal…');
      onStartRef.current?.({ sessionId, mode: 'earn' });
      swLog('submit:begin — will re-quote withdraw+swap legs', {
        amount: input.amount,
        destChainId,
        destToken,
      });

      try {
        const sdk = createEarnIntentSdk(apiBaseUrl, walletClient);

        // Withdraw path and swap path are INDEPENDENT (the swap's slippage floor
        // comes from the reused preview, not the withdraw quote) and both quote
        // endpoints are read-only server-side (suggested-nonce is a pure SELECT
        // with no reservation; checkIfDepositNeeded runs shouldExecute=false). So
        // quote both paths CONCURRENTLY. Promise.allSettled (not all) preserves
        // per-leg error attribution — a plain all() reject hides which leg failed.
        setStepLabel('Quoting routes…');

        // Shared same-chain withdraw params (also the swap-leg input amount).
        const wParams = buildParams({
          ...input,
          smartWithdraw: false,
          smartDestChainId: null,
          smartDestTokenAddress: '',
        });
        const swapAmountRaw = wParams.tokenInAmount;
        const buildSwapTask = (minOut: string) =>
          sdk.getTaskData({
            taskType: TaskType.GetTokenOut,
            intentData: {
              isNative: false,
              depositTokenAddress: underlyingAddress,
              tokenInAmount: swapAmountRaw,
              outputTokenAddress: destToken,
              minTokenOut: minOut,
              destinationChainId: String(destChainId),
              protocolHashIdentifier: ZERO_BYTES32,
              recipient: sponsor,
            },
            extraDataTypestring: '',
            extraData: {},
          });

        // --- Withdraw path → underlying withdraw CALLDATA (transactions[]) ---
        const runWithdrawLeg = async (): Promise<ExecutionTx[]> => {
          const wTask = await sdk.getTaskData({
            taskType: TaskType.ProtocolInteraction,
            intentData: {
              isNative: false,
              depositTokenAddress: wParams.tokenInAddress,
              tokenInAmount: wParams.tokenInAmount,
              outputTokenAddress: wParams.tokenOutAddress,
              minTokenOut: '0',
              destinationChainId: wParams.destinationChainId,
              protocolHashIdentifier: wParams.protocolHashIdentifier,
              recipient: wParams.recipient,
            },
            extraDataTypestring: wParams.extraDataTypestring,
            extraData: wParams.extraData,
          });
          swLog('leg1: withdraw quote → getCompactData + checkIfDepositNeeded');
          const wQuote = await sdk.getIntentQuote({
            sponsorAddress: sponsor,
            taskTypeString: wTask.taskTypeString,
            intentData: wTask.intentData,
            isNative: false,
          });
          if (!wQuote?.success) {
            throw new Error(
              (wQuote as { error?: string } | undefined)?.error ?? 'Withdraw quote failed',
            );
          }
          const txs = ((wQuote as { transactions?: ExecutionTx[] }).transactions ??
            []) as ExecutionTx[];
          swLog('leg1: withdraw quote ok', { txCount: txs.length });
          return txs;
        };

        // --- Swap path → { swapQuote, swapTask }: [reuse preview | probe] → floor → real ---
        const runSwapLeg = async (): Promise<{
          swapQuote: unknown;
          swapTask: Awaited<ReturnType<typeof buildSwapTask>>;
        }> => {
          // Probe = swap output at minTokenOut=0, only to derive the floor. The
          // PREVIEW already fetched exactly this, so reuse it and skip a round-
          // trip; re-probe only if there's no usable preview.
          const preview = input.quote;
          const previewRaw = (preview?.raw ?? null) as
            | { success?: boolean; tokenOut?: string }
            | null;
          const canReusePreview =
            !!previewRaw?.success &&
            previewRaw.tokenOut != null &&
            (preview?.asset ?? '').toLowerCase() === destToken.toLowerCase();

          let probeTokenOut: string;
          let probeQuote: unknown;
          let probeTask: Awaited<ReturnType<typeof buildSwapTask>> | null = null;
          if (canReusePreview) {
            swLog('leg2: reusing PREVIEW swap quote as probe — skipped re-quote #2');
            probeTokenOut = previewRaw!.tokenOut ?? '0';
            probeQuote = previewRaw;
          } else {
            probeTask = await buildSwapTask('0');
            swLog('leg2: swap PROBE quote → getCompactData + checkIfDepositNeeded');
            probeQuote = await sdk.getIntentQuote({
              sponsorAddress: sponsor,
              taskTypeString: probeTask.taskTypeString,
              intentData: probeTask.intentData,
              isNative: false,
            });
            if (!(probeQuote as { success?: boolean })?.success) {
              throw new Error(
                (probeQuote as { error?: string } | undefined)?.error ?? 'Swap quote failed',
              );
            }
            probeTokenOut = (probeQuote as { tokenOut?: string }).tokenOut ?? '0';
          }

          let minTokenOut = '0';
          try {
            const out = BigInt(probeTokenOut);
            if (out > 0n) {
              minTokenOut = (
                (out * (10000n - SMART_WITHDRAW_SLIPPAGE_BPS)) /
                10000n
              ).toString();
            }
          } catch {
            minTokenOut = '0';
          }
          swLog('leg2: minTokenOut floor computed', {
            minTokenOut,
            reusedPreview: canReusePreview,
            willRequote: minTokenOut !== '0',
          });
          // Real quote bakes the slippage floor into the executable intent.
          const swapTask =
            minTokenOut === '0'
              ? (probeTask ?? (await buildSwapTask('0')))
              : await buildSwapTask(minTokenOut);
          if (minTokenOut !== '0') {
            swLog('leg2: swap REAL quote (with slippage floor) → getCompactData + checkIfDepositNeeded');
          }
          const swapQuote =
            minTokenOut === '0'
              ? probeQuote
              : await sdk.getIntentQuote({
                  sponsorAddress: sponsor,
                  taskTypeString: swapTask.taskTypeString,
                  intentData: swapTask.intentData,
                  isNative: false,
                });
          if (!(swapQuote as { success?: boolean })?.success) {
            throw new Error(
              (swapQuote as { error?: string } | undefined)?.error ?? 'Swap quote failed',
            );
          }
          swLog('leg2: swap quote ready', { reusedPreview: canReusePreview });
          return { swapQuote, swapTask };
        };

        // Fire both paths at once; attribute any failure to its specific leg.
        swLog('quoting withdraw + swap paths in PARALLEL');
        const [withdrawRes, swapRes] = await Promise.allSettled([
          runWithdrawLeg(),
          runSwapLeg(),
        ]);
        if (withdrawRes.status === 'rejected' || swapRes.status === 'rejected') {
          const reasons: string[] = [];
          if (withdrawRes.status === 'rejected') {
            reasons.push(
              `withdraw: ${withdrawRes.reason instanceof Error ? withdrawRes.reason.message : String(withdrawRes.reason)}`,
            );
          }
          if (swapRes.status === 'rejected') {
            reasons.push(
              `swap: ${swapRes.reason instanceof Error ? swapRes.reason.message : String(swapRes.reason)}`,
            );
          }
          throw new Error(`Quote failed — ${reasons.join('; ')}`);
        }
        const withdrawTxs = withdrawRes.value;
        const { swapQuote, swapTask } = swapRes.value;
        swLog('both paths quoted', { withdrawTxs: withdrawTxs.length });

        // --- Resolve batch strategy (atomic, sequential-batch, or sequential-tx) ---
        const wc = walletClient as any;
        const chainId = walletClient.chain?.id;
        if (!chainId) {
          throw new Error('Chain ID unavailable');
        }

        const rpcUrl =
          walletClient.chain?.rpcUrls?.default?.http?.[0] ?? '';
        const publicClient = createPublicClient({
          chain: walletClient.chain ?? undefined,
          transport: http(rpcUrl),
        });

        // `as never`: the linked SDK bundles its own viem, so its WalletClient/
        // PublicClient types are nominally distinct from the widget's viem even
        // though the runtime shape is identical. Vanishes once the SDK is consumed
        // from npm (viem is its peerDependency → single dedup'd viem).
        const strategy = await resolveWalletBatchStrategy({
          walletClient: walletClient as never,
          chainId,
          user: sponsor,
          publicClient: publicClient as never,
        });

        swLog('exec: strategy resolved', { mode: strategy.mode });

        // ── Execute [withdraw → approve → depositERC20AndRegister] ─────────────
        // All three are plain calls with msg.sender = user, so the SAME `calls`
        // array works whether we send one EIP-5792 batch (1 prompt — best UX) or
        // fall back to separate txs (N prompts). buildResourceLockCalls yields
        // the [approve, deposit] leg + the /compact payload; we prepend the
        // withdraw calldata from the no-lock quote. submitAllocation runs only
        // AFTER the deposit lands (the register is verified on-chain), and any
        // failure throws to the outer catch — we never submit an allocation for
        // a batch that didn't execute.
        setActiveStep(2);
        setStatusProgress(40);
        setStepLabel('Preparing transaction…');
        swLog('exec: building resource-lock calls (getCompactData)');
        const { calls: lockCalls, createAllocationRequest } =
          await sdk.buildResourceLockCalls({
            isNative: false,
            sponsorAddress: sponsor,
            taskTypeString: swapTask.taskTypeString,
            intentData: swapTask.intentData,
            quoteResult: swapQuote,
          } as never);
        const calls: { to: `0x${string}`; data: `0x${string}`; value: bigint }[] = [
          ...withdrawTxs.map((t) => ({
            to: t.target as `0x${string}`,
            data: t.callData as `0x${string}`,
            value: BigInt(t.value ?? '0'),
          })),
          ...lockCalls.map((c: any) => ({
            to: c.to as `0x${string}`,
            data: c.data as `0x${string}`,
            value: BigInt(c.value ?? '0'),
          })),
        ];
        swLog('exec: assembled calls', {
          withdraw: withdrawTxs.length,
          lock: lockCalls.length,
          total: calls.length,
          mode: strategy.mode,
        });

        // Sign each call in order, awaiting each receipt so the deposit only
        // runs once the withdraw has funded the wallet. Shared by the no-5792
        // path and by the batch path's runtime-unsupported fallback.
        const runSequentialCalls = async () => {
          for (let i = 0; i < calls.length; i++) {
            if (!mountedRef.current) return;
            const c = calls[i];
            setStepLabel(`Confirm ${i + 1}/${calls.length} in wallet…`);
            swLog(`exec: sequential tx ${i + 1}/${calls.length} — WALLET PROMPT EXPECTED`, {
              to: c.to,
            });
            onSignRef.current?.({ sessionId });
            const hash = await wc.sendTransaction({
              account: sponsor,
              to: c.to,
              data: c.data,
              value: c.value,
              chain: walletClient.chain,
            });
            await publicClient.waitForTransactionReceipt({ hash });
            swLog(`exec: sequential tx ${i + 1}/${calls.length} confirmed`, { hash });
          }
        };

        if (strategy.mode === 'atomic' || strategy.mode === 'sequential-batch') {
          // Best UX: one wallet_sendCalls → a single confirmation for all calls.
          setStepLabel('Confirm in your wallet…');
          swLog('exec: wallet_sendCalls (single prompt) — WALLET PROMPT EXPECTED', {
            atomic: strategy.mode === 'atomic',
            calls: calls.length,
          });
          onSignRef.current?.({ sessionId });
          try {
            await executeWalletBatch({
              walletClient: wc,
              chainId,
              account: sponsor,
              calls,
              forceAtomic: strategy.mode === 'atomic',
            });
            swLog('exec: batch confirmed on-chain');
          } catch (err) {
            if (isUserWalletRejection(err)) throw err;
            // Wallet advertised batching but refused wallet_sendCalls at submit
            // time (e.g. smart account toggled off after the probe). Nothing
            // landed → safe to degrade to per-tx. Any other failure (incl. a
            // mid-batch revert) is re-thrown to abort.
            if (!isBatchingUnsupported(err)) throw err;
            swLog('exec: wallet_sendCalls unsupported at runtime — falling back to per-tx', {
              error: err instanceof Error ? err.message : String(err),
            });
            await runSequentialCalls();
          }
        } else {
          // No EIP-5792 → per-tx, one prompt each.
          swLog('exec: sequential-tx (no batching) — one prompt per call', {
            prompts: calls.length,
          });
          await runSequentialCalls();
        }

        if (!mountedRef.current) return;
        setActiveStep(3);
        setStatusProgress(70);
        setStepLabel('Submitting to solver…');
        swLog('exec: submitAllocation (deposit landed → start solving)');
        const res = await sdk.submitAllocation(createAllocationRequest);
        swLog('exec: submitAllocation ok', {
          nonce: (res as { nonce?: string })?.nonce ?? null,
        });
        beginPolling((res as { nonce?: string })?.nonce ?? null, res, sdk);
        return;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        const cancelled = isUserWalletRejection(err);
        swLog(cancelled ? 'submit: CANCELLED in wallet' : 'submit:ERROR — aborting', {
          error: e.message,
        });
        if (mountedRef.current) {
          setError(cancelled ? 'Transaction cancelled' : e.message);
          setStatus('error');
          setActiveStep(0);
          setStatusProgress(0);
          setStepLabel(null);
        }
        onErrorRef.current?.({ sessionId, error: e });
      }
    },
    [address, walletClient, apiBaseUrl, sessionId, buildParams, beginPolling],
  );

  // ---- Submit ---------------------------------------------------------------
  const submit = useCallback(
    async (input: EarnSubmitInput) => {
      if (!address || !walletClient) {
        setError('Wallet client unavailable');
        setStatus('error');
        return;
      }

      // Smart Withdraw takes the dedicated batch path (withdraw → swap).
      if (isSmartWithdrawInput(input)) {
        swLog('submit: routing → submitSmartWithdraw (smart path)');
        return submitSmartWithdraw(input);
      }
      swLog('submit: routing → normal path', {
        tab: input.tab,
        hasCachedQuote: pendingQuoteRef.current != null,
      });

      setError(null);
      setStatus('submitting');
      setActiveStep(1);
      setStatusProgress(15);
      setStepLabel(input.tab === 'withdraw' ? 'Withdrawing…' : 'Depositing…');
      onStartRef.current?.({ sessionId, mode: 'earn' });

      try {
        const submitParams = buildParams(input);
        const originChainId =
          pendingQuoteRef.current?.originChainId ??
          (submitParams.isMidenDeposit ? input.sourceChainId : undefined);
        const sdk = createEarnIntentSdk(apiBaseUrl, walletClient, originChainId);

        let taskTypeString: string;
        let intentData: any;
        let quoteResult: any;

        if (pendingQuoteRef.current) {
          ({ taskTypeString, intentData, quoteResult } = pendingQuoteRef.current);
        } else {
          const params = submitParams;
          const td = await sdk.getTaskData({
            taskType: TaskType.ProtocolInteraction,
            intentData: {
              isNative: false,
              depositTokenAddress: params.tokenInAddress,
              tokenInAmount: params.tokenInAmount,
              outputTokenAddress: params.tokenOutAddress,
              minTokenOut: '0',
              destinationChainId: params.destinationChainId,
              protocolHashIdentifier: params.protocolHashIdentifier,
              recipient: params.recipient,
            },
            extraDataTypestring: params.extraDataTypestring,
            extraData: params.extraData,
          });
          taskTypeString = td.taskTypeString;
          intentData = td.intentData;
          const qr = await sdk.getIntentQuote({
            sponsorAddress: address as `0x${string}`,
            taskTypeString,
            intentData,
            isNative: false,
            ...(routingAndLiquidityOptions
              ? { routingAndLiquidityOptions }
              : {}),
          });
          if (!qr?.success) {
            throw new Error((qr as { error?: string } | undefined)?.error ?? 'Quote failed');
          }
          quoteResult = qr;
        }

        setActiveStep(2);
        setStatusProgress(45);
        onSignRef.current?.({ sessionId });

        const solvePayload: Record<string, unknown> = {
          isNative: false,
          sponsorAddress: address as `0x${string}`,
          taskTypeString,
          intentData,
          quoteResult,
          ...(routingAndLiquidityOptions
            ? { routingAndLiquidityOptions }
            : {}),
        };

        if (submitParams.isMidenDeposit && input.midenSource) {
          solvePayload.collateralType = CollateralType.Miden;
          solvePayload.midenFaucetId = normalizeMidenId(input.midenSource.faucetId);
          solvePayload.midenSourceAccount = normalizeMidenId(input.midenSource.accountId);
          solvePayload.createMidenP2IDNote = input.midenSource.createP2IDNote;
        }

        if (gaslessRef.current && !submitParams.isMidenDeposit) {
          solvePayload.gasless = true;
        }

        const data = await sdk.solveIntent(solvePayload as never);

        if (!mountedRef.current) return;

        setActiveStep(3);
        setStatusProgress(75);

        // Prefer decimal nonce from solveIntent — SIO indexes queue rows by
        // intent.nonce.toString(), while /compact returns 0x-padded hex.
        const responseNonce: string | null =
          (data as { nonce?: string })?.nonce ??
          (data as { allocationResponse?: { nonce?: string } })?.allocationResponse?.nonce ??
          (data as { submittedIntentData?: { nonce?: string } })?.submittedIntentData?.nonce ??
          (data as { intentNonce?: string })?.intentNonce ??
          null;

        beginPolling(responseNonce ? responseNonce.toString() : null, data, sdk);
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(e.message);
          setStatus('error');
          setActiveStep(0);
          setStatusProgress(0);
        }
        onErrorRef.current?.({ sessionId, error: e });
      }
    },
    [
      address,
      walletClient,
      apiBaseUrl,
      sessionId,
      buildParams,
      beginPolling,
      submitSmartWithdraw,
    ],
  );

  return {
    status,
    activeStep,
    statusProgress,
    nonce,
    quote,
    quoteError,
    error,
    stepLabel,
    isQuoting: status === 'quoting',
    isBusy:
      status === 'submitting' ||
      status === 'sent' ||
      status === 'polling',
    fetchQuote,
    submit,
    reset,
  };
}
