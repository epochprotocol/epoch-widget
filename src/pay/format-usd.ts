/**
 * Render a token amount as its USD equivalent, or null when there's nothing
 * meaningful to show.
 *
 * Precision scales down as the number grows: cents matter on $1.23, not on
 * $4,182.
 */
export function formatUsdEquivalent(
  amount: string,
  priceUsd: number | null | undefined,
): string | null {
  if (priceUsd == null) return null;
  if (!amount || amount === '—') return null;
  const n = Number(amount.replace(/,/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;

  const usd = n * priceUsd;
  const formatted =
    usd >= 1000
      ? usd.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : usd >= 1
        ? usd.toFixed(2)
        : usd.toFixed(4);
  return `≈ $${formatted}`;
}
