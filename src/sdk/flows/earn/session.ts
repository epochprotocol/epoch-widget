import { keccak256, parseUnits, toBytes } from "viem";
import { TaskType } from "@epoch-protocol/epoch-commons-sdk";
import { EpochIntentSDK } from "@epoch-protocol/epoch-intents-sdk";
import { TypedEventEmitter } from "../../intent/event-emitter.js";
import type {
  EpochEarnMarket,
  EpochEarnPosition,
  EpochToken,
  IntentCompletePayload,
  IntentSentPayload,
  OnErrorCtx,
  OnSignCtx,
  OnStartCtx,
  OnSuccessCtx,
  RoutingAndLiquidityOptions,
} from "../../types.js";

export type EarnIntentFlowStatus =
  | "idle"
  | "quoting"
  | "submitting"
  | "sent"
  | "polling"
  | "complete"
  | "error";

export interface ExecutionTx {
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
  tab: "deposit" | "withdraw";
  amount: string;
  market?: EpochEarnMarket | null;
  position?: EpochEarnPosition | null;
  sourceChainId: number;
  sourceToken: EpochToken;
  network: "mainnet" | "testnet";
  /** Withdraw-only: signals 1delta API to use protocol-level max-withdraw mechanisms. */
  isAll?: boolean;
  /** Withdraw-only: cross-chain delivery flag. */
  smartWithdraw?: boolean;
  smartDestChainId?: number | null;
  smartDestTokenAddress?: string;
}

export interface EarnSubmitInput extends EarnQuoteInput {
  quote: EarnQuote | null;
}

export interface EarnSessionConfig {
  apiBaseUrl: string;
  address: string;
  /** Pass a viem `WalletClient`. Type-erased to `unknown` to avoid
   *  cross-version structural mismatch in monorepos with multiple viem copies. */
  walletClient: unknown;
  sessionId: string;
  routingAndLiquidityOptions?: RoutingAndLiquidityOptions;
}

export interface EarnSessionEvents {
  statusChange: EarnIntentFlowStatus;
  progress: number;
  activeStep: number;
  quote: EarnQuote | null;
  quoteError: string | null;
  error: string | null;
  nonce: string | null;
  start: OnStartCtx;
  sign: OnSignCtx;
  success: OnSuccessCtx;
  intentSent: IntentSentPayload;
  intentComplete: IntentCompletePayload;
  errorCtx: OnErrorCtx;
  requestClose: void;
  /** Emitted on each polling tick that did not detect completion. Consumers
   *  typically use this to nudge progress forward (e.g. +5 capped at 95). */
  pollTick: void;
}

const POLL_INTERVAL_MS = 3000;
const AUTO_CLOSE_DELAY_MS = 2500;
const ONEDELTA_PROTOCOL_NAME = "1delta";

/**
 * Framework-agnostic state machine for the earn (deposit/withdraw) flow.
 * Mirrors the behavior previously embedded in `useEarnIntentFlow` but free of
 * React hooks — consumers subscribe via `.on('statusChange', ...)` etc.
 *
 * Lifecycle: idle → quoting → submitting → sent → polling → complete / error.
 */
export class EarnSession extends TypedEventEmitter<EarnSessionEvents> {
  private readonly config: EarnSessionConfig;
  private status: EarnIntentFlowStatus = "idle";
  private quoteCallId = 0;
  private pollingHandle: ReturnType<typeof setInterval> | null = null;
  private isChecking = false;
  private disposed = false;
  private pendingQuote: {
    taskTypeString: string;
    intentData: unknown;
    quoteResult: unknown;
  } | null = null;

  constructor(config: EarnSessionConfig) {
    super();
    this.config = config;
  }

  getStatus(): EarnIntentFlowStatus {
    return this.status;
  }

  private setStatus(next: EarnIntentFlowStatus): void {
    this.status = next;
    this.emit("statusChange", next);
  }

  reset(): void {
    this.quoteCallId += 1;
    if (this.pollingHandle) {
      clearInterval(this.pollingHandle);
      this.pollingHandle = null;
    }
    this.isChecking = false;
    this.setStatus("idle");
    this.emit("activeStep", 0);
    this.emit("progress", 0);
    this.emit("nonce", null);
    this.emit("quote", null);
    this.emit("quoteError", null);
    this.emit("error", null);
    this.pendingQuote = null;
  }

  dispose(): void {
    this.disposed = true;
    if (this.pollingHandle) {
      clearInterval(this.pollingHandle);
      this.pollingHandle = null;
    }
    this.removeAllListeners();
  }

  // -------------------------------------------------------------------------
  // Build params — pure, mirrors original `buildParams`
  // -------------------------------------------------------------------------

  private buildParams(input: EarnQuoteInput) {
    const market = input.market ?? input.position?.market;
    if (!market) throw new Error("Market missing");
    const marketUid = market.oneDeltaMarketUid;
    if (!marketUid) throw new Error("Market is missing the 1delta marketUid");

    const sourceToken = input.sourceToken;
    if (!sourceToken) throw new Error("Source token missing");

    const muidParts = marketUid.split(":");
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

    const tokenInAmount = parseUnits(
      input.amount.trim().replace(/,/g, ""),
      sourceToken.decimals,
    ).toString();

    const isWithdraw = input.tab === "withdraw";
    const isSmartWithdraw =
      isWithdraw &&
      input.smartWithdraw === true &&
      input.smartDestChainId != null &&
      !!input.smartDestTokenAddress;

    const protocolHashIdentifier = keccak256(toBytes(ONEDELTA_PROTOCOL_NAME));
    const underlyingAddress = market.token.address as string;
    const actionChainId =
      market.chainId != null ? String(market.chainId) : (muidChain ?? "1");

    const destinationChainId = isSmartWithdraw
      ? String(input.smartDestChainId)
      : actionChainId;

    const tokenOutAddress = isSmartWithdraw
      ? (input.smartDestTokenAddress as `0x${string}`)
      : (underlyingAddress as `0x${string}`);

    const isSameChain = input.sourceChainId === Number(destinationChainId);
    const payAsset = underlyingAddress;

    const extraDataFields = [
      "string marketUid",
      "string action",
      "string payAsset",
    ];
    if (isWithdraw) extraDataFields.push("bool isAll", "bool simulate");
    if (isSmartWithdraw)
      extraDataFields.push("string actionChainId", "string actionOutputToken");
    const extraDataTypestring = extraDataFields.join(",");

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

    return {
      tokenInAmount,
      destinationChainId,
      protocolHashIdentifier,
      tokenInAddress: sourceToken.address as `0x${string}`,
      tokenOutAddress,
      recipient: (this.config.address ??
        "0x0000000000000000000000000000000000000000") as `0x${string}`,
      extraDataTypestring,
      extraData,
      isSameChain,
    };
  }

  // -------------------------------------------------------------------------
  // Quote
  // -------------------------------------------------------------------------

  async quote(input: EarnQuoteInput): Promise<EarnQuote | null> {
    if (this.disposed) return null;
    if (!input.amount.trim()) return null;

    let params: ReturnType<EarnSession["buildParams"]>;
    try {
      params = this.buildParams(input);
    } catch (e) {
      this.emit("quoteError", (e as Error).message);
      return null;
    }

    const callId = ++this.quoteCallId;
    this.setStatus("quoting");
    this.emit("quote", null);
    this.emit("quoteError", null);
    this.pendingQuote = null;

    try {
      const sdk = new EpochIntentSDK({
        apiBaseUrl: this.config.apiBaseUrl,
        walletClient: this.config.walletClient as unknown as never,
      });

      const { taskTypeString, intentData } = await sdk.getTaskData({
        taskType: TaskType.ProtocolInteraction,
        intentData: {
          isNative: false,
          depositTokenAddress: params.tokenInAddress,
          tokenInAmount: params.tokenInAmount,
          outputTokenAddress: params.tokenOutAddress,
          minTokenOut: "0",
          destinationChainId: params.destinationChainId,
          protocolHashIdentifier: params.protocolHashIdentifier,
          recipient: params.recipient,
        },
        extraDataTypestring: params.extraDataTypestring,
        extraData: params.extraData,
      });

      const quoteResult = await sdk.getIntentQuote({
        sponsorAddress: this.config.address as `0x${string}`,
        taskTypeString,
        intentData,
        isNative: false,
        ...(this.config.routingAndLiquidityOptions
          ? {
              routingAndLiquidityOptions:
                this.config.routingAndLiquidityOptions,
            }
          : {}),
      });

      if (callId !== this.quoteCallId || this.disposed) return null;

      if (!(quoteResult as { success?: boolean })?.success) {
        const msg =
          (quoteResult as { error?: string } | undefined)?.error ??
          "Quote unavailable";
        this.emit("quoteError", msg);
        this.setStatus("idle");
        return null;
      }

      const qr = quoteResult as {
        tokenIn?: string;
        tokenOut?: string;
        transactions?: ExecutionTx[];
        resourceLockRequired?: boolean;
      };
      const txs: ExecutionTx[] = (qr.transactions ?? []) as ExecutionTx[];
      const quoteOut: EarnQuote = {
        tokenIn: qr.tokenIn,
        tokenOut: qr.tokenOut,
        asset: params.tokenOutAddress,
        executionTransactions: txs,
        resourceLockRequired: !!qr.resourceLockRequired,
        raw: quoteResult,
      };
      this.emit("quote", quoteOut);
      this.pendingQuote = { taskTypeString, intentData, quoteResult };
      this.setStatus("idle");
      return quoteOut;
    } catch (err) {
      if (callId !== this.quoteCallId || this.disposed) return null;
      this.emit("quoteError", err instanceof Error ? err.message : String(err));
      this.setStatus("idle");
      return null;
    }
  }

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  async submit(input: EarnSubmitInput): Promise<void> {
    if (this.disposed) return;
    if (!this.config.walletClient) {
      this.emit("error", "Wallet client unavailable");
      this.setStatus("error");
      return;
    }

    this.emit("error", null);
    this.setStatus("submitting");
    this.emit("activeStep", 1);
    this.emit("progress", 15);
    this.emit("start", { sessionId: this.config.sessionId, mode: "earn" });

    try {
      const sdk = new EpochIntentSDK({
        apiBaseUrl: this.config.apiBaseUrl,
        walletClient: this.config.walletClient as unknown as never,
      });

      let taskTypeString: string;
      let intentData: unknown;
      let quoteResult: unknown;

      if (this.pendingQuote) {
        ({ taskTypeString, intentData, quoteResult } = this.pendingQuote);
      } else {
        const params = this.buildParams(input);
        const td = await sdk.getTaskData({
          taskType: TaskType.ProtocolInteraction,
          intentData: {
            isNative: false,
            depositTokenAddress: params.tokenInAddress,
            tokenInAmount: params.tokenInAmount,
            outputTokenAddress: params.tokenOutAddress,
            minTokenOut: "0",
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
          sponsorAddress: this.config.address as `0x${string}`,
          taskTypeString,
          intentData,
          isNative: false,
          ...(this.config.routingAndLiquidityOptions
            ? {
                routingAndLiquidityOptions:
                  this.config.routingAndLiquidityOptions,
              }
            : {}),
        });
        if (!(qr as { success?: boolean })?.success) {
          throw new Error(
            (qr as { error?: string } | undefined)?.error ?? "Quote failed",
          );
        }
        quoteResult = qr;
      }

      this.emit("activeStep", 2);
      this.emit("progress", 45);
      this.emit("sign", { sessionId: this.config.sessionId });

      const data = await sdk.solveIntent({
        isNative: false,
        sponsorAddress: this.config.address as `0x${string}`,
        taskTypeString,
        intentData,
        quoteResult,
        ...(this.config.routingAndLiquidityOptions
          ? {
              routingAndLiquidityOptions:
                this.config.routingAndLiquidityOptions,
            }
          : {}),
      } as never);

      if (this.disposed) return;

      this.emit("activeStep", 3);
      this.emit("progress", 75);

      const responseNonce: string | null =
        (data as { allocationResponse?: { nonce?: string } })
          ?.allocationResponse?.nonce ??
        (data as { submittedIntentData?: { nonce?: string } })
          ?.submittedIntentData?.nonce ??
        (data as { intentNonce?: string })?.intentNonce ??
        null;

      if (responseNonce) {
        const n = responseNonce.toString();
        this.emit("nonce", n);
        this.setStatus("sent");
        this.emit("intentSent", { nonce: n });
        this.setStatus("polling");
        this.emit("activeStep", 4);
        this.checkIntentStatus(n, sdk);
        this.pollingHandle = setInterval(
          () => this.checkIntentStatus(n, sdk),
          POLL_INTERVAL_MS,
        );
      } else {
        this.setStatus("complete");
        this.emit("progress", 100);
        this.emit("activeStep", 5);
        this.emit("intentComplete", { nonce: "", status: data });
        this.emit("success", {
          sessionId: this.config.sessionId,
          nonce: "",
          status: data,
        });
        setTimeout(() => {
          if (!this.disposed) this.emit("requestClose", undefined);
        }, AUTO_CLOSE_DELAY_MS);
      }
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      if (!this.disposed) {
        this.emit("error", e.message);
        this.setStatus("error");
        this.emit("activeStep", 0);
        this.emit("progress", 0);
      }
      this.emit("errorCtx", { sessionId: this.config.sessionId, error: e });
    }
  }

  private async checkIntentStatus(
    nonceStr: string,
    sdk: EpochIntentSDK,
  ): Promise<void> {
    if (this.disposed || this.isChecking) return;
    this.isChecking = true;
    try {
      const statusList = await sdk.getIntentStatus(
        this.config.address,
        nonceStr,
      );
      if (this.disposed) return;
      const isComplete = Array.isArray(statusList)
        ? statusList.some(
            (s: { status?: string }) =>
              s.status === "completed" ||
              s.status === "finalized" ||
              s.status === "success",
          )
        : false;

      if (isComplete) {
        if (this.pollingHandle) {
          clearInterval(this.pollingHandle);
          this.pollingHandle = null;
        }
        this.emit("progress", 100);
        this.setStatus("complete");
        this.emit("intentComplete", { nonce: nonceStr, status: statusList });
        this.emit("success", {
          sessionId: this.config.sessionId,
          nonce: nonceStr,
          status: statusList,
        });
        setTimeout(() => {
          if (!this.disposed) this.emit("requestClose", undefined);
        }, AUTO_CLOSE_DELAY_MS);
      } else {
        this.emit("pollTick", undefined);
      }
    } catch {
      /* swallow — poll again */
    } finally {
      this.isChecking = false;
    }
  }
}
