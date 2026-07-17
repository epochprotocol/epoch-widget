/**
 * Small "Testnet" chip for the modal header. Shown when the widget is on testnet
 * but the network toggle isn't offered, so the user always knows which network
 * an intent will target. When the toggle IS offered it already carries that
 * signal, so this stays out of its way.
 */
export function NetworkBadge({ isTestnet }: { isTestnet: boolean }) {
  if (!isTestnet) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-warning bg-warning-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning">
      <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
      Testnet
    </span>
  );
}
