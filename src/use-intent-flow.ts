import { useCallback, useEffect, useRef, useState } from 'react';
import { parseUnits, keccak256, toBytes, type Address, type WalletClient } from 'viem';
import { TaskType } from '@epoch-protocol/epoch-commons-sdk';
import { EpochIntentSDK } from '@epoch-protocol/epoch-intents-sdk';
import type {
  IntentConfig,
  IntentSentPayload,
  IntentCompletePayload,
  EpochToken,
  OnStartCtx,
  OnSignCtx,
  OnSuccessCtx,
  OnErrorCtx,
  WidgetFlow,
} from './types';

export type IntentFlowStatus =
  | 'idle'
  | 'submitting' // preparing / signing on the client
  | 'sent' // intent submitted, waiting for solver
  | 'polling' // actively checking execution status
  | 'complete'
  | 'error';

interface UseIntentFlowParams {
  apiBaseUrl: string;
  walletClient: WalletClient | undefined;
  address: Address | undefined;
  requiredToken: { address: string; symbol: string; decimals: number };
  requiredAmount: bigint;
  intentConfig: IntentConfig;
  isTestnet: boolean;
  /** Session ID — bundled into ctx callbacks. */
  sessionId: string;
  /** Mode for the current widget activation (passed to onStart). */
  mode: WidgetFlow;
  /** Optional receiver override (defaults to wallet address). */
  receiver?: `0x${string}`;
  onIntentSent?: (data: IntentSentPayload) => void;
  onIntentComplete?: (data: IntentCompletePayload) => void;
  onError?: (error: Error) => void;
  /** Fired ~2s after `onIntentComplete` — a hint for the consumer to close the modal. */
  onRequestClose?: () => void;
  // ---- New ctx callbacks --------------------------------------------------
  onStart?: (ctx: OnStartCtx) => void;
  onSign?: (ctx: OnSignCtx) => void;
  onSuccess?: (ctx: OnSuccessCtx) => void;
  onErrorCtx?: (ctx: OnErrorCtx) => void;
}

interface SubmitInput {
  sourceChainId: number;
  sourceToken: EpochToken;
}

interface UseIntentFlowReturn {
  status: IntentFlowStatus;
  /** 0 while idle, 1..4 during an active submission. Useful for the progress stepper. */
  activeStep: number;
  /** 0..100 — status-check progress under step 4. */
  statusProgress: number;
  nonce: string | null;
  error: string | null;
  submit: (input: SubmitInput) => Promise<void>;
  reset: () => void;
  // ---- Quote (for fixed-output intents) -----------------------------------
  /** Fetch a quote for the current source token selection (fixed-output only). */
  fetchQuote: (input: SubmitInput) => Promise<void>;
  /** True while getIntentQuote is in-flight. */
  isQuoting: boolean;
  /** Formatted string of how much the user needs to pay (after quote). */
  quotedPayAmount: string | null;
  /** Raw tokenIn from the quote (base units). */
  quotedPayRaw: string | null;
  /** Error message if quote fetch failed. */
  quoteError: string | null;
}

// How often to poll for intent execution status once submitted.
const POLL_INTERVAL_MS = 3000;
const AUTO_CLOSE_DELAY_MS = 2000;

// ---------------------------------------------------------------------------
// useIntentFlow
//
// Encapsulates the full client-side intent lifecycle:
//   1. build task data via EpochIntentSDK.getTaskData
//   2. fetch a reverse quote when intent is fixedOutput
//   3. call solveIntent (which deposits to Compact via the SDK)
//   4. poll intentStatus until a terminal state
//
// The host component only needs to supply the selected source chain/token
// and wire up callbacks — all transient state (progress, errors, polling) is
// managed here.
// ---------------------------------------------------------------------------

export function useIntentFlow(params: UseIntentFlowParams): UseIntentFlowReturn {
  const {
    apiBaseUrl,
    walletClient,
    address,
    requiredToken,
    requiredAmount,
    intentConfig,
    isTestnet,
    sessionId,
    mode,
    receiver,
    onIntentSent,
    onIntentComplete,
    onError,
    onRequestClose,
    onStart,
    onSign,
    onSuccess,
    onErrorCtx,
  } = params;

  // Keep latest callbacks without listing them on useCallback deps — inline
  // handlers from hosts would otherwise recreate submit/fetchQuote every render
  // and retrigger effects that depend on those functions (e.g. auto quote).
  const onIntentSentRef = useRef(onIntentSent);
  onIntentSentRef.current = onIntentSent;
  const onIntentCompleteRef = useRef(onIntentComplete);
  onIntentCompleteRef.current = onIntentComplete;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onRequestCloseRef = useRef(onRequestClose);
  onRequestCloseRef.current = onRequestClose;
  const onStartRef = useRef(onStart);
  onStartRef.current = onStart;
  const onSignRef = useRef(onSign);
  onSignRef.current = onSign;
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorCtxRef = useRef(onErrorCtx);
  onErrorCtxRef.current = onErrorCtx;

  const [status, setStatus] = useState<IntentFlowStatus>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [statusProgress, setStatusProgress] = useState(0);
  const [nonce, setNonce] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quote-related state
  const [isQuoting, setIsQuoting] = useState(false);
  const [quotedPayAmount, setQuotedPayAmount] = useState<string | null>(null);
  const [quotedPayRaw, setQuotedPayRaw] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const pendingQuoteRef = useRef<{ taskTypeString: string; intentData: unknown; quoteResult: unknown } | null>(null);
  // Incremented on every fetchQuote call; checked after awaits to discard superseded results.
  const quoteCallIdRef = useRef(0);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressBarRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const isCheckingRef = useRef(false);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (progressBarRef.current) clearInterval(progressBarRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (progressBarRef.current) {
      clearInterval(progressBarRef.current);
      progressBarRef.current = null;
    }
    isCheckingRef.current = false;
    setStatus('idle');
    setActiveStep(0);
    setStatusProgress(0);
    setNonce(null);
    setError(null);
    setIsQuoting(false);
    setQuotedPayAmount(null);
    setQuotedPayRaw(null);
    setQuoteError(null);
    pendingQuoteRef.current = null;
  }, []);

  const checkIntentStatus = useCallback(
    async (nonceStr: string, sdk: EpochIntentSDK) => {
      if (!address || isCheckingRef.current) return;
      isCheckingRef.current = true;
      setStatusProgress(0);

      // Indeterminate progress bar that creeps from 0 → 90 while the request
      // is in flight, then jumps to 100 on success.
      let p = 0;
      if (progressBarRef.current) clearInterval(progressBarRef.current);
      progressBarRef.current = setInterval(() => {
        p = Math.min(p + 3, 90);
        setStatusProgress(p);
      }, 150);

      try {
        const statusList = await sdk.getIntentStatus(address, nonceStr);
        if (progressBarRef.current) {
          clearInterval(progressBarRef.current);
          progressBarRef.current = null;
        }
        if (!mountedRef.current) return;
        setStatusProgress(100);

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
          setStatus('complete');
          onIntentCompleteRef.current?.({ nonce: nonceStr, status: statusList });
          onSuccessRef.current?.({ sessionId, nonce: nonceStr, status: statusList });
          setTimeout(() => {
            if (mountedRef.current) onRequestCloseRef.current?.();
          }, AUTO_CLOSE_DELAY_MS);
        } else {
          // Drop the bar back to 0 so the next tick animates forward again.
          setTimeout(() => {
            if (mountedRef.current) setStatusProgress(0);
          }, 1500);
        }
      } catch {
        if (progressBarRef.current) {
          clearInterval(progressBarRef.current);
          progressBarRef.current = null;
        }
        if (mountedRef.current) setStatusProgress(0);
      } finally {
        isCheckingRef.current = false;
      }
    },
    [address, sessionId],
  );

  // Build the SDK-ready task data and extra data from the current intent config.
  // Shared between fetchQuote and submit so both use identical params.
  const buildTaskParams = useCallback(
    (sourceToken: EpochToken) => {
      const destChainId = isTestnet
        ? (intentConfig.destinationTestnetChainId ?? 84532)
        : (intentConfig.destinationChainId ?? 8453);

      const outputAmountStr = formatRawAmount(requiredAmount, requiredToken.decimals);
      const inputAmountStr = intentConfig.fixedOutput ? '0' : outputAmountStr;

      const protocolHash =
        intentConfig.protocolHashIdentifier ??
        keccak256(toBytes(intentConfig.protocol));

      let extraDataTypestring = 'bytes32 protocol,bytes32 action';
      if (intentConfig.extraDataTypestring) {
        extraDataTypestring += ',' + intentConfig.extraDataTypestring;
      }
      if (intentConfig.fixedOutput) {
        extraDataTypestring +=
          ',bool fixedOutcome,address fixedOutcomeToken,uint256 fixedOutcomeAmount';
      }

      const extraData: Record<string, unknown> = {
        protocol: keccak256(toBytes(intentConfig.protocol)),
        action: keccak256(toBytes(intentConfig.action)),
        ...(intentConfig.extraData ?? {}),
      };
      if (intentConfig.fixedOutput) {
        extraData.fixedOutcome = true;
        extraData.fixedOutcomeToken = requiredToken.address;
        extraData.fixedOutcomeAmount = requiredAmount.toString();
      }

      return {
        destChainId,
        outputAmountStr,
        inputAmountStr,
        protocolHash,
        extraDataTypestring,
        extraData,
        sourceToken,
      };
    },
    [intentConfig, isTestnet, requiredAmount, requiredToken],
  );

  // ---- fetchQuote --------------------------------------------------------
  // For fixed-output intents: fetch a quote to show the user how much they
  // need to pay before they commit. Stores the result internally so submit()
  // can use it directly.

  const fetchQuote = useCallback(
    async ({ sourceChainId, sourceToken }: SubmitInput) => {
      if (!walletClient || !address) return;
      if (!intentConfig.fixedOutput) return; // quotes only needed for fixed-output

      const callId = ++quoteCallIdRef.current;

      setIsQuoting(true);
      setQuoteError(null);
      setQuotedPayAmount(null);
      setQuotedPayRaw(null);
      pendingQuoteRef.current = null;

      try {
        const params = buildTaskParams(sourceToken);

        const sdk = new EpochIntentSDK({
          apiBaseUrl,
          walletClient: walletClient as unknown as never,
        });

        const { taskTypeString, intentData } = await sdk.getTaskData({
          taskType: TaskType.ProtocolInteraction,
          intentData: {
            isNative: false,
            depositTokenAddress: sourceToken.address,
            tokenInAmount: parseUnits(params.inputAmountStr, sourceToken.decimals).toString(),
            outputTokenAddress: requiredToken.address,
            minTokenOut: parseUnits(params.outputAmountStr, requiredToken.decimals).toString(),
            destinationChainId: params.destChainId.toString(),
            protocolHashIdentifier: params.protocolHash,
            recipient: receiver ?? address,
          },
          extraDataTypestring: params.extraDataTypestring,
          extraData: params.extraData,
        });

        const quoteResult = await sdk.getIntentQuote({
          sponsorAddress: address,
          taskTypeString,
          intentData,
          isNative: false,
        });

        // Discard if a newer fetchQuote call has started since this one.
        if (callId !== quoteCallIdRef.current) return;
        if (!mountedRef.current) return;

        if (quoteResult?.success && quoteResult.tokenIn) {
          const raw = quoteResult.tokenIn;
          setQuotedPayRaw(raw);
          setQuotedPayAmount(formatTokenIn(raw, sourceToken.decimals));
          // Cache for submit to reuse
          pendingQuoteRef.current = { taskTypeString, intentData, quoteResult };
        } else {
          setQuoteError(
            (quoteResult as { error?: string } | undefined)?.error ?? 'Quote unavailable',
          );
        }
      } catch (err) {
        if (callId !== quoteCallIdRef.current) return;
        if (mountedRef.current) {
          setQuoteError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (callId === quoteCallIdRef.current && mountedRef.current) setIsQuoting(false);
      }
    },
    [walletClient, address, apiBaseUrl, buildTaskParams, intentConfig, requiredToken, receiver],
  );

  // ---- submit ------------------------------------------------------------

  const submit = useCallback(
    async ({ sourceChainId, sourceToken }: SubmitInput) => {
      if (!walletClient || !address) return;

      setError(null);
      setStatus('submitting');
      setActiveStep(1);
      onStartRef.current?.({ sessionId, mode });

      try {
        const sdk = new EpochIntentSDK({
          apiBaseUrl,
          walletClient: walletClient as unknown as never,
        });

        let taskTypeString: string;
        let intentData: unknown;
        let quoteResult: unknown | undefined;

        // If we already have a cached quote from fetchQuote(), reuse it.
        if (pendingQuoteRef.current) {
          taskTypeString = pendingQuoteRef.current.taskTypeString;
          intentData = pendingQuoteRef.current.intentData;
          quoteResult = pendingQuoteRef.current.quoteResult;
        } else {
          // Build fresh
          const params = buildTaskParams(sourceToken);

          const taskResult = await sdk.getTaskData({
            taskType: TaskType.ProtocolInteraction,
            intentData: {
              isNative: false,
              depositTokenAddress: sourceToken.address,
              tokenInAmount: parseUnits(params.inputAmountStr, sourceToken.decimals).toString(),
              outputTokenAddress: requiredToken.address,
              minTokenOut: parseUnits(params.outputAmountStr, requiredToken.decimals).toString(),
              destinationChainId: params.destChainId.toString(),
              protocolHashIdentifier: params.protocolHash,
              recipient: address,
            },
            extraDataTypestring: params.extraDataTypestring,
            extraData: params.extraData,
          });
          taskTypeString = taskResult.taskTypeString;
          intentData = taskResult.intentData;

          // For fixedOutput, we need a quote if we didn't pre-fetch one
          if (intentConfig.fixedOutput) {
            const qr = await sdk.getIntentQuote({
              sponsorAddress: address,
              taskTypeString,
              intentData,
              isNative: false,
            });
            if (!qr?.success) {
              throw new Error(
                (qr as { error?: string } | undefined)?.error ?? 'Failed to get intent quote',
              );
            }
            quoteResult = qr;
          }
        }

        setActiveStep(2);
        onSignRef.current?.({ sessionId });

        const data = await sdk.solveIntent({
          isNative: false,
          sponsorAddress: address,
          taskTypeString,
          intentData,
          ...(quoteResult ? { quoteResult } : {}),
        } as any);

        setActiveStep(3);

        const responseNonce: string | null =
          (data as { allocationResponse?: { nonce?: string } })?.allocationResponse
            ?.nonce ??
          (data as { submittedIntentData?: { nonce?: string } })?.submittedIntentData
            ?.nonce ??
          (data as { intentNonce?: string })?.intentNonce ??
          null;

        if (responseNonce) {
          const nonceStr = responseNonce.toString();
          setNonce(nonceStr);
          onIntentSentRef.current?.({ nonce: nonceStr });
          setStatus('polling');
          setActiveStep(4);

          checkIntentStatus(nonceStr, sdk);
          pollingRef.current = setInterval(
            () => checkIntentStatus(nonceStr, sdk),
            POLL_INTERVAL_MS,
          );
        } else {
          setStatus('complete');
          onIntentCompleteRef.current?.({ nonce: '', status: data });
          onSuccessRef.current?.({ sessionId, nonce: '', status: data });
        }
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(e.message);
          setStatus('error');
          setActiveStep(0);
        }
        onErrorRef.current?.(e);
        onErrorCtxRef.current?.({ sessionId, error: e });
      }
    },
    [
      walletClient,
      address,
      apiBaseUrl,
      intentConfig,
      buildTaskParams,
      requiredToken,
      sessionId,
      mode,
      checkIntentStatus,
    ],
  );

  return {
    status, activeStep, statusProgress, nonce, error, submit, reset,
    // Quote
    fetchQuote, isQuoting, quotedPayAmount, quotedPayRaw, quoteError,
  };
}

// ---- Utilities ------------------------------------------------------------

function formatRawAmount(amount: bigint, decimals: number, maxFrac = 6): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  if (remainder === 0n) return whole.toString();
  const fracStr = remainder
    .toString()
    .padStart(decimals, '0')
    .replace(/0+$/, '')
    .slice(0, Math.min(maxFrac, decimals));
  return `${whole}.${fracStr}`;
}

/**
 * Format a tokenIn amount (raw base-units string from the quote API) into a
 * human-readable decimal string using the token's decimals.
 */
function formatTokenIn(raw: string, decimals: number): string {
  try {
    if (/^\d+$/.test(raw)) {
      return formatRawAmount(BigInt(raw), decimals);
    }
    return raw;
  } catch {
    return raw;
  }
}
