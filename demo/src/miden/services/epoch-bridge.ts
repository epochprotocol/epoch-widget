import { parseUnits, formatUnits } from "viem";
import type { CrossChainIntentParams, IntentResult } from "../types/miden";
import type {
  EpochIntentSDK,
  IntentQuoteResult,
} from "@epoch-protocol/epoch-intents-sdk";
import { MIDEN_TO_EVM_EXTRA_TYPESTRING } from "@epoch-protocol/epoch-intents-sdk";
import type {
  CollateralType,
  GetTaskDataParams,
  SolveIntentParams,
  TaskType,
} from "@epoch-protocol/epoch-intents-sdk/dist/types";
import { AccountId, Address } from "@miden-sdk/miden-sdk";

export interface CrossChainQuote {
  taskTypeString: string;
  intentData: unknown;
  quoteResult: IntentQuoteResult;
  params: CrossChainIntentParams;
}

/** Format base-unit token amount for display. */
export function formatQuoteTokenIn(
  raw: string | undefined,
  tokenDecimals: number,
): string {
  if (!raw || raw === "0") return "calculated at execution";
  try {
    // If backend ever returns a human-readable decimal string, normalize it.
    // IMPORTANT: integer strings (e.g. "1099993") are base units and must use
    // formatUnits(BigInt(...), dec), not parseUnits(...), otherwise decimals are lost.
    if (/^\d+\.\d+$/.test(raw)) {
      return formatUnits(parseUnits(raw, tokenDecimals), tokenDecimals);
    }

    return formatUnits(BigInt(raw), tokenDecimals);
  } catch {
    return raw;
  }
}

/**
 * Cross-chain bridge architecture using P2ID notes:
 *
 * 1. User creates a P2ID note on Miden targeting the trusted allocator service
 * 2. The allocator service (holding the P2ID note) builds an Epoch intent via SIO
 * 3. SIO solver fulfills the intent on the destination EVM chain
 * 4. On successful execution, the allocator consumes the P2ID note (claiming the Miden funds)
 * 5. If the intent fails/expires, the P2ID note can be recalled by the user
 *
 * This keeps funds locked in a P2ID note (not custodied) until the cross-chain
 * intent is fulfilled — privacy-preserving on the Miden side, trustless on EVM side.
 */

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export function normalizeMidenIdToHex(id: string): string {
  const raw = id.trim();
  if (!raw) return raw;

  // Already hex.
  if (raw.startsWith("0x") || raw.startsWith("0X")) {
    try {
      return AccountId.fromHex(raw).toString();
    } catch {
      return raw;
    }
  }

  // Plain hex without 0x.
  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0) {
    try {
      return AccountId.fromHex(`0x${raw}`).toString();
    } catch {
      return raw;
    }
  }

  // Bech32 (address or account). Wallet adapter often returns `mtst..._...`.
  try {
    if (raw.includes("_")) {
      return Address.fromBech32(raw).accountId().toString();
    }
  } catch {
    // fallthrough
  }

  try {
    return AccountId.fromBech32(raw).toString();
  } catch {
    return raw;
  }
}

export function buildEpochTaskDataParams(
  params: CrossChainIntentParams,
): GetTaskDataParams {
  const midenSourceAccountHex = normalizeMidenIdToHex(params.midenAccountId);
  const midenFaucetIdHex = normalizeMidenIdToHex(params.midenFaucetId);
  console.log("[EpochBridge] Building task data params from:", {
    midenAccountId: midenSourceAccountHex,
    midenFaucetId: midenFaucetIdHex.slice(0, 16) + "...",
    midenAmount: params.midenAmount,
    evmRecipient: params.evmRecipient,
    destinationChainId: params.destinationChainId,
  });

  const outputToken = params.outputTokenAddress || ZERO_ADDRESS;

  // Convert human-readable Miden amount to smallest unit; "0" or omitted = reverse-quote route
  const midenDecimals = params.midenDecimals;
  const rawAmount = params.midenAmount ?? "0";
  const amountInSmallestUnit = parseUnits(rawAmount, midenDecimals).toString();

  // This form treats minTokenOut as base units to avoid any frontend-decimals dependency.
  // For reverse-quote route, pass the value through unchanged.
  const scaledMinTokenOut = (params.minTokenOut ?? "").trim() || "0";

  console.log(
    "[EpochBridge] Route: reverse-quote (minTokenOut in base units)",
    {
      tokenInAmount: amountInSmallestUnit,
      minTokenOut: scaledMinTokenOut,
    },
  );

  const taskDataParams = {
    taskType: "gettokenout" as TaskType,
    intentData: {
      // isNative must be false — tokenIn is zero-address (Miden-sourced) but tokenOut is a real EVM token
      isNative: false,
      depositTokenAddress: ZERO_ADDRESS,
      tokenInAmount: amountInSmallestUnit,
      outputTokenAddress: outputToken,
      minTokenOut: scaledMinTokenOut,
      destinationChainId: String(params.destinationChainId),
      protocolHashIdentifier: ZERO_HASH,
      recipient: params.evmRecipient,
    },
    // Canonical Miden→EVM suffix from the SDK. midenNoteId is a placeholder here;
    // the SDK fills it when it creates the P2IDE note during solveIntent.
    extraDataTypestring: MIDEN_TO_EVM_EXTRA_TYPESTRING,
    extraData: {
      midenSourceAccount: midenSourceAccountHex,
      midenFaucetId: midenFaucetIdHex,
      midenNoteType: "P2IDE",
      midenNoteId: "",
    },
  };

  console.log("[EpochBridge] Task data params built:", taskDataParams);
  return taskDataParams;
}

/** Step 1 of the minTokenOut route: get a reverse quote without executing. */
export async function getCrossChainQuote(
  sdk: EpochIntentSDK,
  params: CrossChainIntentParams,
  sponsorAddress: string,
): Promise<CrossChainQuote> {
  // tokenInAmount: "0" signals reverse quote — backend computes required input from minTokenOut
  const taskDataParams = buildEpochTaskDataParams({
    ...params,
    midenAmount: "0",
  });
  const { taskTypeString, intentData } = await sdk.getTaskData(taskDataParams);
  console.log("[EpochBridge] getCrossChainQuote getTaskData:", {
    taskTypeString,
    intentData,
  });

  const quoteResult = await sdk.getIntentQuote({
    sponsorAddress: sponsorAddress as `0x${string}`,
    taskTypeString,
    intentData,
    isNative: false,
  });
  console.log("[EpochBridge] getCrossChainQuote quoteResult:", quoteResult);

  if (!quoteResult.success) {
    throw new Error(quoteResult.error ?? "Quote failed");
  }

  return { taskTypeString, intentData, quoteResult, params };
}

export async function buildCrossChainIntent(
  sdk: EpochIntentSDK,
  params: CrossChainIntentParams & {
    collateralType?: CollateralType;
    midenSourceAccount?: string;
    createMidenP2IDNote?: SolveIntentParams["createMidenP2IDNote"];
    /** Pre-fetched quote from getCrossChainQuote — skips getTaskData step. */
    preFetchedQuote?: CrossChainQuote;
  },
): Promise<IntentResult> {
  const midenFaucetIdHex = normalizeMidenIdToHex(params.midenFaucetId);
  const midenSourceHex = normalizeMidenIdToHex(
    params.midenSourceAccount || params.midenAccountId,
  );
  let taskTypeString: string;
  let intentData: unknown;
  let quoteResult: IntentQuoteResult | undefined;

  if (params.preFetchedQuote) {
    ({ taskTypeString, intentData, quoteResult } = params.preFetchedQuote);
    console.log("[EpochBridge] Using pre-fetched quote, skipping getTaskData");
  } else {
    const taskDataParams = buildEpochTaskDataParams(params);
    ({ taskTypeString, intentData } = await sdk.getTaskData(taskDataParams));
    console.log("[EpochBridge] getTaskData:", { taskTypeString, intentData });
  }

  try {
    const solveResult = await sdk.solveIntent({
      isNative: false,
      sponsorAddress: params.evmRecipient as `0x${string}`,
      taskTypeString,
      intentData,
      quoteResult,
      collateralType: (params.collateralType ?? "miden") as CollateralType,
      midenFaucetId: midenFaucetIdHex,
      midenSourceAccount: midenSourceHex,
      createMidenP2IDNote: params.createMidenP2IDNote,
    });

    console.log("[EpochBridge] SDK.solveIntent() response:", solveResult);

    return {
      taskTypeString,
      intentData: intentData as Record<string, unknown>,
      solveResult, // Include the full execution result
    };
  } catch (err) {
    console.error("[EpochBridge] solveIntent failed:", err);
    // Still return the task data even if solve fails
    return {
      taskTypeString,
      intentData: intentData as Record<string, unknown>,
      error: err instanceof Error ? err.message : "Failed to solve intent",
    };
  }
}
