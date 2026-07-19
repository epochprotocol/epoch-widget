import { useState } from "react";
import { toast } from "sonner";
import { SendTransaction } from "@miden-sdk/miden-wallet-adapter-base";
import { useMidenFiWallet } from "@miden-sdk/miden-wallet-adapter-react";
import type { SolveIntentParams } from "@epoch-protocol/epoch-intents-sdk/dist/types";
import type { CrossChainIntentParams } from "../types/miden";

interface UseMidenBridgeIntentOptions {
  epoch: {
    pendingQuote: unknown;
    fetchQuote: (params: CrossChainIntentParams) => Promise<unknown>;
    confirmIntent: (
      createNote: SolveIntentParams["createMidenP2IDNote"],
    ) => Promise<unknown>;
  };
  midenAccountIdHex: string | undefined;
  /** Throws when the form isn't complete enough to build an intent. */
  buildParams: () => CrossChainIntentParams;
  outputToken: string;
  resolvedEvmRecipient: string;
}

interface MidenBridgeIntent {
  confirmStatus: string;
  /** Note id from the P2IDE send, surfaced before the intent settles. */
  localMidenNoteId: string | undefined;
  localIntentNonce: string | undefined;
  localIntentUserAddress: string | undefined;
  getQuote: () => void;
  confirm: () => void;
}

const isNonceLike = (v: unknown) =>
  typeof v === "string" || typeof v === "number" || typeof v === "bigint";

/** Pull the intent nonce out of whatever shape the solver returned. */
function readNonce(r: Record<string, unknown>): string | undefined {
  const solveNonce = (r.solveResult as Record<string, unknown> | undefined)
    ?.nonce;
  const raw = isNonceLike(r.nonce)
    ? r.nonce
    : isNonceLike(r.intentNonce)
      ? r.intentNonce
      : isNonceLike(solveNonce)
        ? solveNonce
        : undefined;
  return raw != null ? String(raw) : undefined;
}

/**
 * Quote + confirm for the Miden → EVM bridge.
 *
 * `confirm` hands the SDK a callback that mints the P2IDE note on Miden; the SDK
 * calls it mid-solve, so the note id only becomes known from inside that
 * callback — hence the local state rather than a return value.
 */
export function useMidenBridgeIntent({
  epoch,
  midenAccountIdHex,
  buildParams,
  outputToken,
  resolvedEvmRecipient,
}: UseMidenBridgeIntentOptions): MidenBridgeIntent {
  const { requestSend, waitForTransaction } = useMidenFiWallet();
  const [confirmStatus, setConfirmStatus] = useState("");
  const [localMidenNoteId, setLocalMidenNoteId] = useState<string>();
  const [localIntentNonce, setLocalIntentNonce] = useState<string>();
  const [localIntentUserAddress, setLocalIntentUserAddress] =
    useState<string>();

  const getQuote = () => {
    if (
      !outputToken ||
      outputToken === "0x0000000000000000000000000000000000000000"
    ) {
      toast.error("Select a valid output token");
      return;
    }
    void toast.promise(epoch.fetchQuote(buildParams()), {
      loading: "Fetching quote…",
      success: "Quote ready — review and confirm",
      error: (err) => (err instanceof Error ? err.message : "Quote failed"),
    });
  };

  const createMidenP2IDNote: SolveIntentParams["createMidenP2IDNote"] = async (
    faucetIdParam,
    amountParam,
    allocatorId,
  ) => {
    setConfirmStatus("Creating P2IDE note on Miden…");
    try {
      if (!midenAccountIdHex) throw new Error("Missing Miden account id");
      if (!requestSend) throw new Error("Miden wallet adapter not available");
      // Checked before the send, not after: requestSend broadcasts a real
      // transaction, so bailing out afterwards would move funds and still
      // throw, leaving the note unreadable.
      if (!waitForTransaction)
        throw new Error("waitForTransaction not available in adapter");

      const normalizedAmount = BigInt(amountParam);
      if (normalizedAmount > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error("Amount too large for wallet adapter send");
      }

      const payload = new SendTransaction(
        midenAccountIdHex,
        allocatorId,
        faucetIdParam,
        "public",
        Number(normalizedAmount),
      );
      const txId = await requestSend(payload);
      const finalized = await waitForTransaction(txId, 120_000);
      const first = finalized.outputNotes?.[0];
      const noteId = first ? first.id().toString() : "";
      if (!noteId)
        throw new Error(`Could not read output note id for tx ${txId}`);
      setLocalMidenNoteId(noteId);
      return { success: true, noteId };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  };

  const confirm = () => {
    if (!epoch.pendingQuote) return;
    void toast.promise(
      (async () => {
        setConfirmStatus("Submitting intent…");
        const result = await epoch.confirmIntent(createMidenP2IDNote);
        if (
          result &&
          typeof result === "object" &&
          "error" in result &&
          (result as { error?: string }).error
        ) {
          throw new Error((result as { error: string }).error);
        }
        if (result && typeof result === "object") {
          const r = result as unknown as Record<string, unknown>;
          const nonce = readNonce(r);
          const intentData = r.intentData as { recipient?: string } | undefined;
          const recipient =
            typeof intentData?.recipient === "string"
              ? intentData.recipient
              : undefined;
          if (nonce) setLocalIntentNonce(nonce);
          setLocalIntentUserAddress(
            (recipient ?? resolvedEvmRecipient)?.trim() || undefined,
          );
        }
        setConfirmStatus("Intent submitted successfully.");
        return "Cross-chain intent submitted";
      })(),
      {
        loading: "Confirming intent…",
        success: (msg) => msg,
        error: (err) => {
          const msg = err instanceof Error ? err.message : "Unknown error";
          setConfirmStatus(`Error: ${msg}. Quote is still saved — try again.`);
          return `Error: ${msg}`;
        },
      },
    );
  };

  return {
    confirmStatus,
    localMidenNoteId,
    localIntentNonce,
    localIntentUserAddress,
    getQuote,
    confirm,
  };
}
