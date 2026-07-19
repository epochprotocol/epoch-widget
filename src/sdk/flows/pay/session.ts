import { keccak256, parseUnits, toBytes, type Address } from "viem";
import { TaskType } from "@epoch-protocol/epoch-commons-sdk";
import {
  CollateralType,
  EpochIntentSDK,
  EVM_TO_MIDEN_EXTRA_TYPESTRING,
  EVM_ZERO_ADDRESS,
  MIDEN_TO_EVM_EXTRA_TYPESTRING,
  MIDEN_VIRTUAL_CHAIN_ID,
  ZERO_BYTES32,
} from "@epoch-protocol/epoch-intents-sdk";
import { TypedEventEmitter } from "../../intent/event-emitter.js";
import { formatRawAmount, formatTokenIn } from "../../utils/format.js";
import type {
  EpochToken,
  IntentCompletePayload,
  IntentConfig,
  IntentSentPayload,
  OnErrorCtx,
  OnSignCtx,
  OnStartCtx,
  OnSuccessCtx,
  RoutingAndLiquidityOptions,
  WidgetFlow,
} from "../../types.js";

/**
 * Protocols that map to the SIO `gettokenout` task type — pure swap / bridge
 * paths where the solver just needs to route token A → token B without
 * invoking a downstream protocol. Anything outside this set is treated as a
 * custom protocol interaction (raffles, vault deposits, etc).
 */
const SIMPLE_SWAP_PROTOCOLS = new Set(["transfer", "swap", "bridge"]);

function deriveTaskType(protocol: string): TaskType {
  return SIMPLE_SWAP_PROTOCOLS.has(protocol.toLowerCase())
    ? TaskType.GetTokenOut
    : TaskType.ProtocolInteraction;
}

/**
 * Pass-through hex normalizer for Miden account / faucet ids — bare hex gets a
 * `0x` prefix, anything already prefixed or non-hex is returned untouched. Mirrors
 * the widget's `normalizeMidenId`; the flows-sdk can't import that, so it keeps a
 * local copy rather than depend on the UI package.
 */
function normalizeMidenId(id: string): string {
  const raw = (id ?? "").trim();
  if (!raw) return raw;
  if (raw.startsWith("0x") || raw.startsWith("0X")) return raw;
  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0) return `0x${raw}`;
  return raw;
}

export type PayIntentFlowStatus =
  "idle" | "submitting" | "sent" | "polling" | "complete" | "error";

export interface PayQuote {
  tokenIn?: string;
  raw?: unknown;
}

export interface PaySubmitInput {
  sourceChainId: number;
  sourceToken: EpochToken;
  /**
   * Present when the source is Miden (Miden→EVM): funds are locked in a P2ID note
   * instead of an EVM Compact deposit. `createP2IDNote` is the Miden "signature" —
   * the SDK calls it mid-solve to mint the note whose id the allocator consumes.
   */
  midenSource?: {
    accountId: string;
    faucetId: string;
    decimals: number;
    createP2IDNote: (
      faucetId: string,
      amount: string,
      allocatorAccountId: string,
    ) => Promise<{ success: boolean; noteId?: string; error?: string }>;
  };
  /**
   * Present when the destination is Miden (EVM→Miden): the EVM wallet pays and the
   * output is delivered to `recipientAccount` on Miden. No P2ID note — the absence
   * of a Miden source account is what flags the EVM→Miden direction to the solver.
   */
  midenDest?: {
    recipientAccount: string;
    faucetId: string;
    decimals: number;
  };
}

export interface PaySessionConfig {
  apiBaseUrl: string;
  address: Address;
  /** Pass a viem `WalletClient`. Type-erased to `unknown` for cross-version safety. */
  walletClient: unknown;
  sessionId: string;
  mode: WidgetFlow;
  requiredToken: { address: string; symbol: string; decimals: number };
  requiredAmount: bigint;
  intentConfig: IntentConfig;
  isTestnet: boolean;
  receiver?: `0x${string}`;
  routingAndLiquidityOptions?: RoutingAndLiquidityOptions;
  /**
   * Read at submit time to decide whether to solve gasless (EIP-7702 relay pays
   * gas) rather than user-paid. A getter, not a boolean, so the caller can flip
   * the toggle after the session is created and the latest value still wins.
   */
  getGasless?: () => boolean;
}

export interface PaySessionEvents {
  statusChange: PayIntentFlowStatus;
  progress: number;
  activeStep: number;
  nonce: string | null;
  error: string | null;
  quote: { raw: string | null; human: string | null } | null;
  quoteError: string | null;
  isQuoting: boolean;
  start: OnStartCtx;
  sign: OnSignCtx;
  success: OnSuccessCtx;
  intentSent: IntentSentPayload;
  intentComplete: IntentCompletePayload;
  errorCtx: OnErrorCtx;
  requestClose: void;
}

const POLL_INTERVAL_MS = 3000;
const AUTO_CLOSE_DELAY_MS = 2000;

/**
 * Framework-agnostic state machine for the pay/swap flow. Mirrors the prior
 * `useIntentFlow` hook but emits events rather than calling React setters.
 */
export class PaySession extends TypedEventEmitter<PaySessionEvents> {
  private readonly config: PaySessionConfig;
  private status: PayIntentFlowStatus = "idle";
  private quoteCallId = 0;
  private pollingHandle: ReturnType<typeof setInterval> | null = null;
  private progressBarHandle: ReturnType<typeof setInterval> | null = null;
  private isChecking = false;
  private disposed = false;
  private pendingQuote: {
    taskTypeString: string;
    intentData: unknown;
    quoteResult: unknown;
  } | null = null;

  constructor(config: PaySessionConfig) {
    super();
    this.config = config;
  }

  getStatus(): PayIntentFlowStatus {
    return this.status;
  }

  private setStatus(next: PayIntentFlowStatus): void {
    this.status = next;
    this.emit("statusChange", next);
  }

  reset(): void {
    if (this.pollingHandle) {
      clearInterval(this.pollingHandle);
      this.pollingHandle = null;
    }
    if (this.progressBarHandle) {
      clearInterval(this.progressBarHandle);
      this.progressBarHandle = null;
    }
    this.isChecking = false;
    this.setStatus("idle");
    this.emit("activeStep", 0);
    this.emit("progress", 0);
    this.emit("nonce", null);
    this.emit("error", null);
    this.emit("isQuoting", false);
    this.emit("quote", null);
    this.emit("quoteError", null);
    this.pendingQuote = null;
  }

  dispose(): void {
    this.disposed = true;
    if (this.pollingHandle) clearInterval(this.pollingHandle);
    if (this.progressBarHandle) clearInterval(this.progressBarHandle);
    this.pollingHandle = null;
    this.progressBarHandle = null;
    this.removeAllListeners();
  }

  /**
   * The `EpochIntentSDK` to build/solve with. A Compact intent uses
   * `walletClient.chain.id` as its origin chain, but a Miden source is funded off
   * an EVM chain entirely — so it shallow-clones the wallet with the virtual Miden
   * chain id as origin, exactly like the earn flow's `createEarnIntentSdk`. Every
   * other path uses the wallet as-is.
   */
  private intentSdk(useMidenOrigin: boolean): EpochIntentSDK {
    const base = this.config.walletClient as
      { chain?: { id?: number } } | null | undefined;
    const walletClient =
      useMidenOrigin && base
        ? {
            ...base,
            chain: { ...(base.chain ?? {}), id: MIDEN_VIRTUAL_CHAIN_ID },
          }
        : base;
    return new EpochIntentSDK({
      apiBaseUrl: this.config.apiBaseUrl,
      walletClient: walletClient as unknown as never,
    });
  }

  /**
   * Builds the `getTaskData` arguments for one submit/quote. Four shapes share the
   * base mandate: EVM→EVM (the original path), plus the two Miden legs, which
   * mirror the earn flow / demo bridge field-for-field:
   *  - Miden source (Miden→EVM): deposit token is the zero sentinel, the Miden
   *    witness suffix carries the source account + faucet, and it reverse-quotes.
   *  - Miden dest (EVM→Miden): output token is the zero sentinel, destination is
   *    the virtual Miden chain, and the suffix carries the recipient + faucet.
   * A Miden leg drops the `fixedOutcome` triplet (a pure-EVM affordance) and always
   * reverse-quotes (`tokenIn = 0`, solver computes the near side from `minTokenOut`).
   */
  private buildTaskData(input: PaySubmitInput, recipient: Address) {
    const { intentConfig, isTestnet, requiredAmount, requiredToken } =
      this.config;
    const { sourceToken, midenSource, midenDest } = input;
    const isMidenSource = !!midenSource;
    const isMidenDest = !!midenDest;

    const destChainId = isMidenDest
      ? MIDEN_VIRTUAL_CHAIN_ID
      : isTestnet
        ? (intentConfig.destinationTestnetChainId ?? 84532)
        : (intentConfig.destinationChainId ?? 8453);

    // Apply output slippage: minTokenOut may land below requiredAmount by up
    // to `slippageBps` so the SIO solver quote isn't rejected for being
    // marginally below the display amount. Cross-chain bridges + cross-token
    // swaps commonly come back 0.5-1.5% short due to spread + bridge fees;
    // default 100 bps (1%) covers most paths without surprising the user.
    const slippageBps = BigInt(
      Math.max(0, Math.floor(intentConfig.slippageBps ?? 100)),
    );
    const minRequiredAmount =
      slippageBps === 0n
        ? requiredAmount
        : (requiredAmount * (10000n - slippageBps)) / 10000n;

    const outputAmountStr = formatRawAmount(
      minRequiredAmount,
      requiredToken.decimals,
    );
    // A Miden leg always reverse-quotes: the user fixes the far-side amount and
    // the solver computes the near-side input.
    const reverseQuote =
      intentConfig.fixedOutput || isMidenSource || isMidenDest;
    const inputAmountStr = reverseQuote ? "0" : outputAmountStr;

    const useFixedOutcome =
      intentConfig.fixedOutput && !isMidenSource && !isMidenDest;

    const protocolHash =
      isMidenSource || isMidenDest
        ? ZERO_BYTES32
        : (intentConfig.protocolHashIdentifier ??
          keccak256(toBytes(intentConfig.protocol)));

    const depositTokenAddress = isMidenSource
      ? EVM_ZERO_ADDRESS
      : sourceToken.address;
    const outputTokenAddress = isMidenDest
      ? EVM_ZERO_ADDRESS
      : requiredToken.address;

    let extraDataTypestring = "bytes32 protocol,bytes32 action";
    if (intentConfig.extraDataTypestring) {
      extraDataTypestring += "," + intentConfig.extraDataTypestring;
    }
    if (useFixedOutcome) {
      extraDataTypestring +=
        ",bool fixedOutcome,address fixedOutcomeToken,uint256 fixedOutcomeAmount";
    }
    if (isMidenSource)
      extraDataTypestring += "," + MIDEN_TO_EVM_EXTRA_TYPESTRING;
    if (isMidenDest) extraDataTypestring += "," + EVM_TO_MIDEN_EXTRA_TYPESTRING;

    const extraData: Record<string, unknown> = {
      protocol: keccak256(toBytes(intentConfig.protocol)),
      action: keccak256(toBytes(intentConfig.action)),
      ...(intentConfig.extraData ?? {}),
    };
    if (useFixedOutcome) {
      extraData.fixedOutcome = true;
      extraData.fixedOutcomeToken = requiredToken.address;
      extraData.fixedOutcomeAmount = requiredAmount.toString();
    }
    if (isMidenSource && midenSource) {
      extraData.midenSourceAccount = normalizeMidenId(midenSource.accountId);
      extraData.midenFaucetId = normalizeMidenId(midenSource.faucetId);
      extraData.midenNoteType = "P2IDE";
      extraData.midenNoteId = "";
    }
    if (isMidenDest && midenDest) {
      extraData.midenRecipientAccount = normalizeMidenId(
        midenDest.recipientAccount,
      );
      extraData.midenFaucetId = normalizeMidenId(midenDest.faucetId);
    }

    const intentData = {
      isNative: false,
      depositTokenAddress,
      tokenInAmount: parseUnits(
        inputAmountStr,
        sourceToken.decimals,
      ).toString(),
      outputTokenAddress,
      minTokenOut: parseUnits(
        outputAmountStr,
        requiredToken.decimals,
      ).toString(),
      destinationChainId: destChainId.toString(),
      protocolHashIdentifier: protocolHash,
      recipient,
    };

    return {
      taskType: deriveTaskType(intentConfig.protocol),
      intentData,
      extraDataTypestring,
      extraData,
      isMidenSource,
      isMidenDest,
    };
  }

  async fetchQuote(input: PaySubmitInput): Promise<void> {
    if (this.disposed) return;
    if (!this.config.intentConfig.fixedOutput) return;

    const callId = ++this.quoteCallId;
    this.emit("isQuoting", true);
    this.emit("quoteError", null);
    this.emit("quote", null);
    this.pendingQuote = null;

    try {
      const task = this.buildTaskData(
        input,
        this.config.receiver ?? this.config.address,
      );
      const sdk = this.intentSdk(task.isMidenSource);

      const { taskTypeString, intentData } = await sdk.getTaskData({
        taskType: task.taskType,
        intentData: task.intentData,
        extraDataTypestring: task.extraDataTypestring,
        extraData: task.extraData,
      });

      const quoteResult = await sdk.getIntentQuote({
        sponsorAddress: this.config.address,
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

      if (callId !== this.quoteCallId || this.disposed) return;

      const qr = quoteResult as {
        success?: boolean;
        tokenIn?: string;
        error?: string;
      };
      if (qr?.success && qr.tokenIn) {
        const raw = qr.tokenIn;
        this.emit("quote", {
          raw,
          human: formatTokenIn(raw, input.sourceToken.decimals),
        });
        this.pendingQuote = { taskTypeString, intentData, quoteResult };
      } else {
        this.emit("quoteError", qr?.error ?? "Quote unavailable");
      }
    } catch (err) {
      if (callId !== this.quoteCallId || this.disposed) return;
      this.emit("quoteError", err instanceof Error ? err.message : String(err));
    } finally {
      if (callId === this.quoteCallId && !this.disposed) {
        this.emit("isQuoting", false);
      }
    }
  }

  async submit(input: PaySubmitInput): Promise<void> {
    if (this.disposed) return;

    this.emit("error", null);
    this.setStatus("submitting");
    this.emit("activeStep", 1);
    this.emit("start", {
      sessionId: this.config.sessionId,
      mode: this.config.mode,
    });

    try {
      const task = this.buildTaskData(input, this.config.address);
      const sdk = this.intentSdk(task.isMidenSource);

      let taskTypeString: string;
      let intentData: unknown;
      let quoteResult: unknown | undefined;

      if (this.pendingQuote) {
        ({ taskTypeString, intentData, quoteResult } = this.pendingQuote);
      } else {
        const td = await sdk.getTaskData({
          taskType: task.taskType,
          intentData: task.intentData,
          extraDataTypestring: task.extraDataTypestring,
          extraData: task.extraData,
        });
        taskTypeString = td.taskTypeString;
        intentData = td.intentData;

        if (this.config.intentConfig.fixedOutput) {
          const qr = await sdk.getIntentQuote({
            sponsorAddress: this.config.address,
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
              (qr as { error?: string } | undefined)?.error ??
                "Failed to get intent quote",
            );
          }
          quoteResult = qr;
        }
      }

      this.emit("activeStep", 2);
      this.emit("sign", { sessionId: this.config.sessionId });

      const solvePayload: Record<string, unknown> = {
        isNative: false,
        sponsorAddress: this.config.address,
        taskTypeString,
        intentData,
        ...(quoteResult ? { quoteResult } : {}),
        ...(this.config.routingAndLiquidityOptions
          ? {
              routingAndLiquidityOptions:
                this.config.routingAndLiquidityOptions,
            }
          : {}),
      };

      // Miden source: collateral is a P2ID note the SDK mints mid-solve via the
      // injected callback, not an EVM Compact deposit.
      if (task.isMidenSource && input.midenSource) {
        solvePayload.collateralType = CollateralType.Miden;
        solvePayload.midenFaucetId = normalizeMidenId(
          input.midenSource.faucetId,
        );
        solvePayload.midenSourceAccount = normalizeMidenId(
          input.midenSource.accountId,
        );
        solvePayload.createMidenP2IDNote = input.midenSource.createP2IDNote;
      }
      // Gasless relay is EVM-collateral only; a Miden source funds its own note.
      if (this.config.getGasless?.() && !task.isMidenSource) {
        solvePayload.gasless = true;
      }

      const data = await sdk.solveIntent(solvePayload as never);

      this.emit("activeStep", 3);

      const responseNonce: string | null =
        (data as { allocationResponse?: { nonce?: string } })
          ?.allocationResponse?.nonce ??
        (data as { submittedIntentData?: { nonce?: string } })
          ?.submittedIntentData?.nonce ??
        (data as { intentNonce?: string })?.intentNonce ??
        null;

      if (responseNonce) {
        const nonceStr = responseNonce.toString();
        this.emit("nonce", nonceStr);
        this.emit("intentSent", { nonce: nonceStr });
        this.setStatus("polling");
        this.emit("activeStep", 4);
        this.checkIntentStatus(nonceStr, sdk);
        this.pollingHandle = setInterval(
          () => this.checkIntentStatus(nonceStr, sdk),
          POLL_INTERVAL_MS,
        );
      } else {
        this.setStatus("complete");
        this.emit("intentComplete", { nonce: "", status: data });
        this.emit("success", {
          sessionId: this.config.sessionId,
          nonce: "",
          status: data,
        });
      }
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      if (!this.disposed) {
        this.emit("error", e.message);
        this.setStatus("error");
        this.emit("activeStep", 0);
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
    this.emit("progress", 0);

    let p = 0;
    if (this.progressBarHandle) clearInterval(this.progressBarHandle);
    this.progressBarHandle = setInterval(() => {
      p = Math.min(p + 3, 90);
      this.emit("progress", p);
    }, 150);

    try {
      const statusList = await sdk.getIntentStatus(
        this.config.address,
        nonceStr,
      );
      if (this.progressBarHandle) {
        clearInterval(this.progressBarHandle);
        this.progressBarHandle = null;
      }
      if (this.disposed) return;
      this.emit("progress", 100);

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
        setTimeout(() => {
          if (!this.disposed) this.emit("progress", 0);
        }, 1500);
      }
    } catch {
      if (this.progressBarHandle) {
        clearInterval(this.progressBarHandle);
        this.progressBarHandle = null;
      }
      if (!this.disposed) this.emit("progress", 0);
    } finally {
      this.isChecking = false;
    }
  }
}
