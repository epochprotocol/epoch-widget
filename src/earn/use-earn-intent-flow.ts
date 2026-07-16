import { useCallback, useEffect, useRef, useState } from 'react';
import { useLatestRef } from '../hooks/use-latest-ref';
import { keccak256, parseUnits, toBytes } from 'viem';
import type { WalletClient } from 'viem';
import { TaskType } from '@epoch-protocol/epoch-commons-sdk';
import {
  ActionType,
  CollateralType,
  EpochIntentSDK,
  EVM_TO_MIDEN_EXTRA_TYPESTRING,
  ZERO_BYTES32,
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
  MIDEN_VIRTUAL_CHAIN_ID,
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

export interface EarnQuote {
  tokenIn?: string;
  tokenOut?: string;
  asset?: string;
  executionTransactions: ExecutionTx[];
  resourceLockRequired: boolean;
  raw?: unknown;
}

export interface EarnQuoteInput {
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
  };
  /** Withdraw-only. When true, the intent declares a cross-token / cross-chain
   *  delivery: SIO chains 1delta withdraw on the position chain with a
   *  swap/bridge step that converts the underlying to {@link smartDestTokenAddress}
   *  on {@link smartDestChainId} before delivering to the user. */
  smartWithdraw?: boolean;
  smartDestChainId?: number | null;
  smartDestTokenAddress?: string;
  /** Withdraw-only. When set (and `smartDestChainId === MIDEN_VIRTUAL_CHAIN_ID`),
   *  the Smart Withdraw swap leg delivers to a Miden account (EVM→Miden) instead
   *  of an EVM chain/token. `recipientAccount` with no source account is what
   *  routes the intent through smallocator's EVM→Miden path. */
  midenDest?: {
    recipientAccount: string;
    faucetId: string;
    decimals: number;
  };
}

export interface EarnSubmitInput extends EarnQuoteInput {
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

function isSmartWithdrawInput(input: EarnQuoteInput): boolean {
  return (
    input.tab === 'withdraw' &&
    input.smartWithdraw === true &&
    input.smartDestChainId != null &&
    (!!input.smartDestTokenAddress || !!input.midenDest)
  );
}

/** A Smart Withdraw whose destination is a Miden account (EVM→Miden delivery). */
function isMidenDestInput(input: EarnQuoteInput): boolean {
  return (
    !!input.midenDest &&
    input.smartDestChainId === MIDEN_VIRTUAL_CHAIN_ID &&
    !!input.midenDest.recipientAccount
  );
}

/**
 * Build the `getTaskData` params for the Smart Withdraw SWAP leg (the underlying
 * withdrawn on the position chain → destination). Branches on the destination:
 * an EVM chain/token (plain GetTokenOut) vs a Miden account (EVM→Miden — output
 * token is the EVM zero address, destination is the Miden virtual chain, and the
 * faucet/recipient ride in extraData exactly like the canonical bridge intent).
 */
function buildSwapLegTaskInput(
  input: EarnQuoteInput,
  opts: {
    underlyingAddress: `0x${string}`;
    tokenInAmount: string;
    minTokenOut: string;
    recipient: `0x${string}`;
  },
) {
  if (isMidenDestInput(input)) {
    const miden = input.midenDest!;
    return {
      taskType: TaskType.GetTokenOut,
      intentData: {
        isNative: false,
        depositTokenAddress: opts.underlyingAddress,
        tokenInAmount: opts.tokenInAmount,
        // EVM→Miden carries no EVM output token — the real target is the Miden
        // faucet in extraData; the address slot is the zero sentinel.
        outputTokenAddress: EVM_ZERO_ADDRESS as `0x${string}`,
        minTokenOut: opts.minTokenOut,
        destinationChainId: String(MIDEN_VIRTUAL_CHAIN_ID),
        protocolHashIdentifier: ZERO_BYTES32,
        recipient: opts.recipient,
      },
      // The canonical EVM→Miden suffix (midenRecipientAccount,midenFaucetId).
      // Deliberately carries NO midenSourceAccount: its absence is what flags the
      // EVM→Miden direction to smallocator (`isEVMToMidenIntent`).
      extraDataTypestring: EVM_TO_MIDEN_EXTRA_TYPESTRING,
      extraData: {
        midenRecipientAccount: normalizeMidenId(miden.recipientAccount),
        midenFaucetId: normalizeMidenId(miden.faucetId),
      },
    };
  }
  return {
    taskType: TaskType.GetTokenOut,
    intentData: {
      isNative: false,
      depositTokenAddress: opts.underlyingAddress,
      tokenInAmount: opts.tokenInAmount,
      outputTokenAddress: input.smartDestTokenAddress as `0x${string}`,
      minTokenOut: opts.minTokenOut,
      destinationChainId: String(input.smartDestChainId),
      protocolHashIdentifier: ZERO_BYTES32,
      recipient: opts.recipient,
    },
    extraDataTypestring: '',
    extraData: {} as Record<string, string>,
  };
}

/** The asset id a Smart Withdraw delivers into — a Miden faucet id or an EVM token. */
function smartWithdrawDestAsset(input: EarnQuoteInput): string {
  return isMidenDestInput(input)
    ? normalizeMidenId(input.midenDest!.faucetId)
    : (input.smartDestTokenAddress ?? '');
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
  const gaslessRef = useLatestRef(gasless);
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

  const onIntentSentRef = useLatestRef(onIntentSent);
  const onIntentCompleteRef = useLatestRef(onIntentComplete);
  const onErrorRef = useLatestRef(onError);
  const onStartRef = useLatestRef(onStart);
  const onSignRef = useLatestRef(onSign);
  const onSuccessRef = useLatestRef(onSuccess);
  const onRequestCloseRef = useLatestRef(onRequestClose);

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
        // Pinned false to match the SDK's withdraw action: a full-exit withdraw
        // resolves its size at execution time, which a swap leg can't be quoted
        // against. The field stays in the typestring — the solver decodes it.
        extraData.isAll = false;
        extraData.simulate = true;
      }
      if (isMidenDeposit && input.midenSource) {
        extraData.midenSourceAccount = normalizeMidenId(input.midenSource.accountId);
        extraData.midenFaucetId = normalizeMidenId(input.midenSource.faucetId);
        extraData.midenNoteType = 'P2IDE';
        extraData.midenNoteId = '';
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
          const { taskTypeString, intentData } = await sdk.getTaskData(
            buildSwapLegTaskInput(input, {
              underlyingAddress,
              tokenInAmount: amountRaw,
              minTokenOut: '0',
              recipient: address as `0x${string}`,
            }),
          );
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
            asset: smartWithdrawDestAsset(input),
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
    [
      address,
      sessionId,
      // Stable refs — listed only because the linter can't see the useRef
      // behind `useLatestRef`.
      onIntentCompleteRef,
      onSuccessRef,
      onRequestCloseRef,
    ],
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
    [
      sessionId,
      checkIntentStatus,
      // Stable refs — listed only because the linter can't see the useRef
      // behind `useLatestRef`.
      onIntentSentRef,
      onIntentCompleteRef,
      onSuccessRef,
      onRequestCloseRef,
    ],
  );

  // ---- Smart Withdraw (withdraw → cross-chain swap) --------------------------
  // One SDK action. `executeActions` builds both legs (withdraw + swap), probes
  // the slippage floor, fuses them into a single batch, executes it (relay when
  // gasless, else wallet-paid EIP-5792 with a sequential fallback), and submits
  // the allocation once the batch confirms. We only supply the action params —
  // no task typestrings, no call assembly, no allocation plumbing.
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
      const marketUid = market.oneDeltaMarketUid;
      if (!marketUid) {
        setError('Market is missing the 1delta marketUid');
        setStatus('error');
        return;
      }

      const sponsor = address as `0x${string}`;
      const toMiden = isMidenDestInput(input);
      const destToken = smartWithdrawDestAsset(input);
      const gasless = gaslessRef.current === true;

      setError(null);
      setStatus('submitting');
      setActiveStep(1);
      setStatusProgress(10);
      setStepLabel('Quoting withdrawal…');
      onStartRef.current?.({ sessionId, mode: 'earn' });
      swLog('submit:begin — executeActions(Withdraw)', {
        amount: input.amount,
        destChainId: input.smartDestChainId,
        destToken,
        gasless,
      });

      try {
        const sdk = createEarnIntentSdk(apiBaseUrl, walletClient);

        // buildParams is reused only for its decimal-aware amount parse — the
        // SDK builds both legs' task data from the action params below.
        const amount = buildParams({
          ...input,
          smartWithdraw: false,
          smartDestChainId: null,
          smartDestTokenAddress: '',
        }).tokenInAmount;

        setActiveStep(2);
        setStatusProgress(40);
        setStepLabel(
          gasless ? 'Sign to authorise…' : 'Confirm in your wallet…',
        );
        onSignRef.current?.({ sessionId });

        const result = await sdk.helpers.executeActions({
          action: ActionType.Withdraw,
          underlying: market.token.address as `0x${string}`,
          amount,
          protocol: earnProtocolName(marketUid),
          chainId: market.chainId ?? undefined,
          // 1delta's uid is authoritative (it comes from the markets API), so
          // pass it rather than let the SDK derive one from `protocol`.
          marketUid,
          swapAndBridge: toMiden
            ? {
                toToken: destToken,
                toChainId: MIDEN_VIRTUAL_CHAIN_ID,
                recipient: normalizeMidenId(input.midenDest!.recipientAccount),
              }
            : {
                toToken: destToken,
                toChainId: input.smartDestChainId as number,
                recipient: sponsor,
              },
          gasless,
          onExecutionStatus: (s) => {
            if (!mountedRef.current) return;
            swLog('exec: status', { phase: s.phase });
          },
        });

        swLog('exec: executeActions ok — allocation submitted', {
          transactionHash: result.transactionHash,
          gaslessUsed: result.gaslessUsed,
          nonce: result.nonce,
        });

        if (!mountedRef.current) return;
        setActiveStep(3);
        setStatusProgress(70);
        setStepLabel('Submitting to solver…');

        beginPolling(
          result.nonce,
          result.allocations[0]?.submittedIntentData ?? null,
          sdk,
        );
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
    [
      address,
      walletClient,
      apiBaseUrl,
      sessionId,
      buildParams,
      beginPolling,
      // Stable refs — listed only because the linter can't see the useRef
      // behind `useLatestRef`.
      gaslessRef,
      onStartRef,
      onSignRef,
      onErrorRef,
    ],
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
      // `submit` forwards this into the intent payload; without it here a
      // changed routing config would submit under the old one. `fetchQuote`
      // already tracks it.
      routingAndLiquidityOptions,
      // Stable refs — listed only because the linter can't see the useRef
      // behind `useLatestRef`.
      onStartRef,
      onSignRef,
      gaslessRef,
      onErrorRef,
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
