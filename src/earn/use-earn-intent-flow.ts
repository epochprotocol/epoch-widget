import { useCallback, useEffect, useRef, useState } from 'react';
import { keccak256, parseUnits, toBytes } from 'viem';
import type { WalletClient } from 'viem';
import { TaskType } from '@epoch-protocol/epoch-commons-sdk';
import { CollateralType, EpochIntentSDK } from '@epoch-protocol/epoch-intents-sdk';
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
      const isSmartWithdraw =
        isWithdraw &&
        input.smartWithdraw === true &&
        input.smartDestChainId != null &&
        !!input.smartDestTokenAddress;

      const protocolHashIdentifier = keccak256(toBytes(earnProtocolName(marketUid)));
      const underlyingAddress = market.token.address as string;
      const actionChainId =
        market.chainId != null ? String(market.chainId) : muidChain ?? '1';

      const destinationChainId = isSmartWithdraw
        ? String(input.smartDestChainId)
        : actionChainId;

      const tokenOutAddress = isSmartWithdraw
        ? (input.smartDestTokenAddress as `0x${string}`)
        : (underlyingAddress as `0x${string}`);

      const isSameChain = isMidenDeposit
        ? false
        : input.sourceChainId === Number(destinationChainId);
      const payAsset = underlyingAddress;

      const extraDataFields = ['string marketUid', 'string action', 'string payAsset'];
      if (isWithdraw) extraDataFields.push('bool isAll', 'bool simulate');
      if (isSmartWithdraw) extraDataFields.push('string actionChainId', 'string actionOutputToken');
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
      if (isSmartWithdraw) {
        extraData.actionChainId = actionChainId;
        extraData.actionOutputToken = underlyingAddress;
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

  // ---- Submit ---------------------------------------------------------------
  const submit = useCallback(
    async (input: EarnSubmitInput) => {
      if (!address || !walletClient) {
        setError('Wallet client unavailable');
        setStatus('error');
        return;
      }

      setError(null);
      setStatus('submitting');
      setActiveStep(1);
      setStatusProgress(15);
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

        if (responseNonce) {
          const n = responseNonce.toString();
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
    [address, walletClient, apiBaseUrl, sessionId, buildParams, checkIntentStatus],
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
      status === 'submitting' ||
      status === 'sent' ||
      status === 'polling',
    fetchQuote,
    submit,
    reset,
  };
}
