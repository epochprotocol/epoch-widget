import { useCallback, useEffect, useRef, useState } from 'react';
import { useLatestRef } from './hooks/use-latest-ref';
import { type Address, type WalletClient } from 'viem';
import {
  PaySession,
  type PayIntentFlowStatus,
  type PaySubmitInput,
} from './sdk';
import type {
  IntentConfig,
  IntentSentPayload,
  IntentCompletePayload,
  OnStartCtx,
  OnSignCtx,
  OnSuccessCtx,
  OnErrorCtx,
  RoutingAndLiquidityOptions,
  WidgetFlow,
} from './types';

export type IntentFlowStatus = PayIntentFlowStatus;

interface UseIntentFlowParams {
  apiBaseUrl: string;
  walletClient: WalletClient | undefined;
  address: Address | undefined;
  requiredToken: { address: string; symbol: string; decimals: number };
  requiredAmount: bigint;
  intentConfig: IntentConfig;
  isTestnet: boolean;
  sessionId: string;
  mode: WidgetFlow;
  receiver?: `0x${string}`;
  routingAndLiquidityOptions?: RoutingAndLiquidityOptions;
  gasless?: boolean;
  onIntentSent?: (data: IntentSentPayload) => void;
  onIntentComplete?: (data: IntentCompletePayload) => void;
  onError?: (error: Error) => void;
  onRequestClose?: () => void;
  onStart?: (ctx: OnStartCtx) => void;
  onSign?: (ctx: OnSignCtx) => void;
  onSuccess?: (ctx: OnSuccessCtx) => void;
  onErrorCtx?: (ctx: OnErrorCtx) => void;
}

interface UseIntentFlowReturn {
  status: IntentFlowStatus;
  activeStep: number;
  statusProgress: number;
  nonce: string | null;
  error: string | null;
  submit: (input: PaySubmitInput) => Promise<void>;
  reset: () => void;
  fetchQuote: (input: PaySubmitInput) => Promise<void>;
  isQuoting: boolean;
  quotedPayAmount: string | null;
  quotedPayRaw: string | null;
  quoteError: string | null;
}

/**
 * Thin React adapter over `PaySession` (in `./sdk`).
 * Same surface as before — host components are unchanged. All state/polling
 * logic lives in the SDK; this hook just mirrors session events into React.
 */
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
    routingAndLiquidityOptions,
    gasless = false,
    onIntentSent,
    onIntentComplete,
    onError,
    onRequestClose,
    onStart,
    onSign,
    onSuccess,
    onErrorCtx,
  } = params;

  // The long-lived PaySession subscribes once and closes over these, so they
  // must track the newest props without tearing the session down.
  const onIntentSentRef = useLatestRef(onIntentSent);
  const onIntentCompleteRef = useLatestRef(onIntentComplete);
  const onErrorRef = useLatestRef(onError);
  const onRequestCloseRef = useLatestRef(onRequestClose);
  const onStartRef = useLatestRef(onStart);
  const onSignRef = useLatestRef(onSign);
  const onSuccessRef = useLatestRef(onSuccess);
  const onErrorCtxRef = useLatestRef(onErrorCtx);

  const [status, setStatus] = useState<IntentFlowStatus>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [statusProgress, setStatusProgress] = useState(0);
  const [nonce, setNonce] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quotedPayAmount, setQuotedPayAmount] = useState<string | null>(null);
  const [quotedPayRaw, setQuotedPayRaw] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const sessionRef = useRef<PaySession | null>(null);
  const gaslessRef = useLatestRef(gasless);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!walletClient || !address) {
      sessionRef.current?.dispose();
      sessionRef.current = null;
      return;
    }

    const session = new PaySession({
      apiBaseUrl,
      address,
      walletClient,
      sessionId,
      mode,
      requiredToken,
      requiredAmount,
      intentConfig,
      isTestnet,
      receiver,
      routingAndLiquidityOptions,
      getGasless: () => gaslessRef.current,
    });
    sessionRef.current = session;

    const offs: Array<() => void> = [];
    offs.push(session.on('statusChange', (s) => mountedRef.current && setStatus(s)));
    offs.push(session.on('activeStep', (n) => mountedRef.current && setActiveStep(n)));
    offs.push(session.on('progress', (n) => mountedRef.current && setStatusProgress(n)));
    offs.push(session.on('nonce', (n) => mountedRef.current && setNonce(n)));
    offs.push(session.on('error', (e) => mountedRef.current && setError(e)));
    offs.push(session.on('isQuoting', (b) => mountedRef.current && setIsQuoting(b)));
    offs.push(
      session.on('quote', (q) => {
        if (!mountedRef.current) return;
        setQuotedPayRaw(q?.raw ?? null);
        setQuotedPayAmount(q?.human ?? null);
      }),
    );
    offs.push(
      session.on('quoteError', (e) => mountedRef.current && setQuoteError(e)),
    );
    offs.push(session.on('intentSent', (d) => onIntentSentRef.current?.(d)));
    offs.push(session.on('intentComplete', (d) => onIntentCompleteRef.current?.(d)));
    offs.push(session.on('start', (c) => onStartRef.current?.(c)));
    offs.push(session.on('sign', (c) => onSignRef.current?.(c)));
    offs.push(session.on('success', (c) => onSuccessRef.current?.(c)));
    offs.push(
      session.on('errorCtx', (c) => {
        // Map back to legacy `onError(error: Error)` shape.
        onErrorRef.current?.(c.error);
        onErrorCtxRef.current?.(c);
      }),
    );
    offs.push(session.on('requestClose', () => onRequestCloseRef.current?.()));

    return () => {
      for (const off of offs) off();
      session.dispose();
      if (sessionRef.current === session) sessionRef.current = null;
    };
  }, [
    apiBaseUrl,
    walletClient,
    address,
    sessionId,
    mode,
    isTestnet,
    receiver,
    routingAndLiquidityOptions,
    // Hot deps for the session config — recreating on intent shape changes is
    // fine because typed-data signing is per-submit anyway.
    requiredToken,
    requiredAmount,
    intentConfig,
    // Ref objects from `useLatestRef`. Their identity never changes, so they
    // can't retrigger this effect — listed because the linter can't see the
    // `useRef` behind the custom hook and would otherwise call them missing.
    gaslessRef,
    onIntentSentRef,
    onIntentCompleteRef,
    onStartRef,
    onSignRef,
    onSuccessRef,
    onErrorRef,
    onErrorCtxRef,
    onRequestCloseRef,
  ]);

  const reset = useCallback(() => {
    sessionRef.current?.reset();
  }, []);

  const fetchQuote = useCallback(
    async (input: PaySubmitInput) => {
      await sessionRef.current?.fetchQuote(input);
    },
    [],
  );

  const submit = useCallback(
    async (input: PaySubmitInput) => {
      await sessionRef.current?.submit(input);
    },
    [],
  );

  return {
    status,
    activeStep,
    statusProgress,
    nonce,
    error,
    submit,
    reset,
    fetchQuote,
    isQuoting,
    quotedPayAmount,
    quotedPayRaw,
    quoteError,
  };
}
