import { useCallback, useEffect, useRef, useState } from 'react';
import type { WalletClient } from 'viem';
import {
  EarnSession,
  type EarnIntentFlowStatus,
  type EarnQuote,
  type EarnQuoteInput,
  type EarnSubmitInput,
} from '@epoch-protocol/epoch-flows-sdk';
import type {
  IntentCompletePayload,
  IntentSentPayload,
  OnErrorCtx,
  OnSignCtx,
  OnStartCtx,
  OnSuccessCtx,
} from '../types';

export type { EarnIntentFlowStatus } from '@epoch-protocol/epoch-flows-sdk';

interface UseEarnIntentFlowParams {
  apiBaseUrl: string;
  address: string | undefined;
  walletClient?: WalletClient | null;
  sessionId: string;
  /** @deprecated SIO selects the solver via smallocator; this prop is ignored. */
  earnSolverUrl?: string;
  onIntentSent?: (data: IntentSentPayload) => void;
  onIntentComplete?: (data: IntentCompletePayload) => void;
  onError?: (ctx: OnErrorCtx) => void;
  onStart?: (ctx: OnStartCtx) => void;
  onSign?: (ctx: OnSignCtx) => void;
  onSuccess?: (ctx: OnSuccessCtx) => void;
  onRequestClose?: () => void;
}

/**
 * Thin React adapter over `EarnSession` (in `@epoch-protocol/epoch-flows-sdk`).
 * Creates a fresh session whenever the wallet/address tuple changes and
 * mirrors session events into React state so the component re-renders.
 *
 * The public surface (status / activeStep / statusProgress / fetchQuote / submit
 * / reset) is unchanged from the prior in-widget implementation.
 */
export function useEarnIntentFlow({
  apiBaseUrl,
  address,
  walletClient,
  sessionId,
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

  const sessionRef = useRef<EarnSession | null>(null);
  const mountedRef = useRef(true);

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
    };
  }, []);

  // Recreate session whenever wallet/address/apiBaseUrl change.
  useEffect(() => {
    if (!address || !walletClient) {
      sessionRef.current?.dispose();
      sessionRef.current = null;
      return;
    }

    const session = new EarnSession({
      apiBaseUrl,
      address,
      walletClient,
      sessionId,
    });
    sessionRef.current = session;

    const offs: Array<() => void> = [];
    offs.push(session.on('statusChange', (s) => mountedRef.current && setStatus(s)));
    offs.push(session.on('activeStep', (n) => mountedRef.current && setActiveStep(n)));
    offs.push(session.on('progress', (n) => mountedRef.current && setStatusProgress(n)));
    offs.push(
      session.on('pollTick', () =>
        mountedRef.current && setStatusProgress((p) => Math.min(p + 5, 95)),
      ),
    );
    offs.push(session.on('nonce', (n) => mountedRef.current && setNonce(n)));
    offs.push(session.on('quote', (q) => mountedRef.current && setQuote(q)));
    offs.push(
      session.on('quoteError', (e) => mountedRef.current && setQuoteError(e)),
    );
    offs.push(session.on('error', (e) => mountedRef.current && setError(e)));
    offs.push(session.on('intentSent', (d) => onIntentSentRef.current?.(d)));
    offs.push(session.on('intentComplete', (d) => onIntentCompleteRef.current?.(d)));
    offs.push(session.on('start', (c) => onStartRef.current?.(c)));
    offs.push(session.on('sign', (c) => onSignRef.current?.(c)));
    offs.push(session.on('success', (c) => onSuccessRef.current?.(c)));
    offs.push(session.on('errorCtx', (c) => onErrorRef.current?.(c)));
    offs.push(session.on('requestClose', () => onRequestCloseRef.current?.()));

    return () => {
      for (const off of offs) off();
      session.dispose();
      if (sessionRef.current === session) sessionRef.current = null;
    };
  }, [apiBaseUrl, address, walletClient, sessionId]);

  const reset = useCallback(() => {
    sessionRef.current?.reset();
    // Local state mirrors fire from the session via events.
  }, []);

  const fetchQuote = useCallback(
    async (input: EarnQuoteInput) => {
      await sessionRef.current?.quote(input);
    },
    [],
  );

  const submit = useCallback(
    async (input: EarnSubmitInput) => {
      await sessionRef.current?.submit(input);
    },
    [],
  );

  return {
    status,
    activeStep,
    statusProgress,
    nonce,
    quote,
    quoteError,
    error,
    isQuoting: status === 'quoting',
    isBusy:
      status === 'submitting' || status === 'sent' || status === 'polling',
    fetchQuote,
    submit,
    reset,
  };
}
