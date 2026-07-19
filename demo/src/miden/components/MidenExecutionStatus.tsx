import type { IntentResult } from "../types/miden";
import {
  explorerTxUrl,
  midenscanNoteUrl,
  truncateHash,
  MIDEN_CHAIN_ID,
} from "../lib/explorers";

interface MidenExecutionStatusProps {
  result: IntentResult | null;
  error: string | null;
  /** Live flow status from the poller, if one is running. */
  flow?: { midenNoteId?: string; midenTxId?: string; evmChainId?: number };
  /** Fallback when the flow hasn't reported a note id yet. */
  fallbackNoteId?: string;
}

function StatusRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-fg-muted">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-blue-600 underline"
        >
          {value}
        </a>
      ) : (
        <span className="font-mono text-xs text-fg">{value}</span>
      )}
    </div>
  );
}

/** Transaction receipts for a submitted bridge intent, once there are any. */
export function MidenExecutionStatus({
  result,
  error,
  flow,
  fallbackNoteId,
}: MidenExecutionStatusProps) {
  if (!result && !error) return null;

  const depositTxHash = result?.solveResult?.depositResult?.transactionHash;
  const depositChainId =
    (result as { depositChainId?: number } | null)?.depositChainId ??
    flow?.evmChainId;
  const depositTxUrl =
    depositChainId != null && depositTxHash
      ? explorerTxUrl(Number(depositChainId), depositTxHash)
      : null;

  const midenTxId = flow?.midenTxId;
  const noteId = flow?.midenNoteId ?? fallbackNoteId;

  return (
    <section className="rounded-[0.875rem] border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <h3 className="m-0 text-base font-semibold text-fg">Execution status</h3>
      {error && !result && <p className="text-sm text-error">{error}</p>}
      {result && (
        <div className="mt-3 flex flex-col gap-2">
          {depositTxHash && (
            <StatusRow
              label="Compact deposit"
              value={truncateHash(depositTxHash)}
              href={depositTxUrl}
            />
          )}
          {midenTxId && (
            <StatusRow
              label="Miden settlement"
              value={truncateHash(midenTxId)}
              href={explorerTxUrl(MIDEN_CHAIN_ID, midenTxId)}
            />
          )}
          {noteId && (
            <StatusRow
              label="Miden note"
              value={truncateHash(noteId)}
              href={midenscanNoteUrl(noteId)}
            />
          )}
        </div>
      )}
    </section>
  );
}
