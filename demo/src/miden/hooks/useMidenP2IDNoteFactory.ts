import { useCallback } from "react";
import { useMidenFiWallet } from "@miden-sdk/miden-wallet-adapter-react";
import { Transaction } from "@miden-sdk/miden-wallet-adapter-base";
import { useMiden } from "@miden-sdk/react";
import {
  AccountId,
  FungibleAsset,
  Note,
  NoteArray,
  NoteAssets,
  NoteAttachment,
  NoteType,
  TransactionRequestBuilder,
} from "@miden-sdk/miden-sdk";
import type { EarnMidenCreateP2IDNote } from "@epoch-protocol/epoch-intent-widget";

interface Options {
  midenAccountId: string | null;
  /** Progress copy for the host UI (toast / status line). Optional. */
  onStatus?: (message: string) => void;
  onNoteCreated?: (noteId: string) => void;
}

const WAIT_FOR_TRANSACTION_TIMEOUT_MS = 120_000;

/** Epoch Miden ids are 0x-hex; fall back to bech32 for wallet-formatted ids. */
function toAccountId(id: string): AccountId {
  const s = id.trim();
  return s.startsWith("0x") ? AccountId.fromHex(s) : AccountId.fromBech32(s);
}

/**
 * Mints the reclaimable P2IDE collateral note, binding it to the intent's mandate
 * via the attachment felts the SDK computed (Compact-equivalent witness hash).
 *
 * Submitted through the WALLET (`requestTransaction` + `createCustomTransaction`)
 * rather than the SDK client's own transaction hooks: the wallet holds the
 * account's state, whereas the SDK client's local store may not. The wallet's
 * `SendTransaction` cannot carry an attachment, so the note is built as a custom
 * `TransactionRequest` around `Note.createP2IDENote(…, reclaim, …, attachment)`
 * — the one API that supports reclaim + attachment together. A note minted with
 * plain `SendTransaction` has neither, and the allocator rejects it with "Miden
 * note is not bound to the intent mandate".
 *
 * Shared by every Miden-funded flow in the demo (earn deposits and the bridge
 * panel) so the binding can't drift back out of one of them.
 */
export function useMidenP2IDNoteFactory({
  midenAccountId,
  onStatus,
  onNoteCreated,
}: Options): EarnMidenCreateP2IDNote {
  const { requestTransaction, waitForTransaction } = useMidenFiWallet();
  // useMiden() is non-throwing (unlike useMidenClient, which throws before the
  // client initializes); readiness is gated inside the callback instead.
  const { client, isReady } = useMiden();

  return useCallback<EarnMidenCreateP2IDNote>(
    async (
      faucetIdParam,
      amountParam,
      allocatorId,
      recallBlocks,
      bindingAttachmentFelts,
    ) => {
      onStatus?.("Resource lock required — creating P2IDE note on Miden…");
      try {
        if (!midenAccountId) {
          throw new Error("Missing Miden account id");
        }
        if (!bindingAttachmentFelts?.length) {
          throw new Error("Missing mandate-binding attachment felts from SDK");
        }
        if (!requestTransaction) {
          throw new Error("Wallet does not support custom transactions");
        }
        if (!isReady || !client) {
          throw new Error(
            "Miden client not ready yet — retry once it initializes",
          );
        }

        const assets = new NoteAssets([
          new FungibleAsset(toAccountId(faucetIdParam), BigInt(amountParam)),
        ]);
        // Mandate binding: the witness hash the SDK computed, written verbatim as
        // the note attachment (part of the note commitment, so tamper-proof).
        const attachment = new NoteAttachment(
          BigUint64Array.from(bindingAttachmentFelts),
        );

        // P2IDE reclaim height is ABSOLUTE; the SDK hands over a RELATIVE
        // recallBlocks (allocator minimum + buffer). Convert against the client's
        // synced chain tip (getSyncHeight needs the chain, not the account).
        const currentBlock = await client.getSyncHeight();
        if (!Number.isFinite(currentBlock) || currentBlock <= 0) {
          throw new Error(
            "Miden client not synced yet — retry once the block height is available",
          );
        }
        const note = Note.createP2IDENote(
          toAccountId(midenAccountId),
          toAccountId(allocatorId),
          assets,
          currentBlock + recallBlocks,
          undefined, // no time-lock
          NoteType.Public,
          attachment,
        );
        const noteId = note.id().toString();
        if (!noteId) {
          throw new Error("Could not compute note id for the minted note");
        }

        const txRequest = new TransactionRequestBuilder()
          .withOwnOutputNotes(new NoteArray([note]))
          .build();

        // Submit through the wallet (holds the account + signs).
        const txId = await requestTransaction(
          Transaction.createCustomTransaction(
            midenAccountId,
            allocatorId,
            txRequest,
          ),
        );

        // Wait for finalization before returning, so the note is committed and
        // queryable when the allocator fetches it during intent validation.
        // Without this the intent can race ahead of the note and be rejected
        // "not found on-chain".
        if (waitForTransaction) {
          onStatus?.("P2IDE note created — waiting for finalization on Miden…");
          await waitForTransaction(txId, WAIT_FOR_TRANSACTION_TIMEOUT_MS);
        }

        onNoteCreated?.(noteId);
        return { success: true, noteId };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
    [
      midenAccountId,
      requestTransaction,
      waitForTransaction,
      client,
      isReady,
      onStatus,
      onNoteCreated,
    ],
  );
}
