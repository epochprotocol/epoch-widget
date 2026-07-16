import { useEffect, useRef } from 'react';
import { useLatestRef } from '../hooks/use-latest-ref';
import type { EpochIntentWidgetProps, EpochToken } from '../types';

export interface UsePaySwapCallbacksOptions {
  sessionId: string;
  sourceChainId: number | null;
  sourceTokenAddress: string;
  sourceToken: EpochToken | null;
  flow: {
    status: string;
    statusProgress: number;
    activeStep: number;
    isQuoting: boolean;
    quotedPayAmount: string | null;
    quotedPayRaw: string | null;
    quoteError: string | null;
  };
  onSourceTokenChange?: EpochIntentWidgetProps['onSourceTokenChange'];
  onStatus?: EpochIntentWidgetProps['onStatus'];
  onQuote?: EpochIntentWidgetProps['onQuote'];
}

function toBigIntOrNull(raw: string | null): bigint | null {
  if (!raw) return null;
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

/**
 * Reports source, status, and quote results back to the integrator.
 *
 * Every callback is read through a ref, so an integrator passing inline arrow
 * functions can't retrigger these effects on each of their own renders.
 */
export function usePaySwapCallbacks({
  sessionId,
  sourceChainId,
  sourceTokenAddress,
  sourceToken,
  flow,
  onSourceTokenChange,
  onStatus,
  onQuote,
}: UsePaySwapCallbacksOptions): void {
  const onSourceTokenChangeRef = useLatestRef(onSourceTokenChange);
  const onStatusRef = useLatestRef(onStatus);
  const onQuoteRef = useLatestRef(onQuote);

  useEffect(() => {
    if (!onSourceTokenChangeRef.current) return;
    if (!sourceChainId || !sourceTokenAddress) return;
    onSourceTokenChangeRef.current({
      chainId: sourceChainId,
      tokenAddress: sourceTokenAddress as `0x${string}`,
    });
  }, [sourceChainId, sourceTokenAddress, onSourceTokenChangeRef]);

  useEffect(() => {
    onStatusRef.current?.({
      sessionId,
      status: flow.status as never,
      progress: flow.statusProgress,
      activeStep: flow.activeStep,
    });
  }, [
    sessionId,
    flow.status,
    flow.statusProgress,
    flow.activeStep,
    onStatusRef,
  ]);

  // Fires on the falling edge of `isQuoting` — once per settled quote, rather
  // than on every render while one is in flight.
  const prevQuotingRef = useRef(false);
  useEffect(() => {
    const wasQuoting = prevQuotingRef.current;
    prevQuotingRef.current = flow.isQuoting;
    if (!onQuoteRef.current) return;
    if (!wasQuoting || flow.isQuoting) return;
    if (!sourceChainId || !sourceToken) return;
    onQuoteRef.current({
      sourceChainId,
      sourceTokenAddress: sourceTokenAddress as `0x${string}`,
      paySymbol: sourceToken.symbol,
      payAmount: flow.quotedPayAmount ?? null,
      payAmountRaw: toBigIntOrNull(flow.quotedPayRaw),
      error: flow.quoteError ?? undefined,
    });
  }, [
    flow.isQuoting,
    flow.quotedPayAmount,
    flow.quotedPayRaw,
    flow.quoteError,
    sourceChainId,
    sourceTokenAddress,
    sourceToken,
    onQuoteRef,
  ]);
}
