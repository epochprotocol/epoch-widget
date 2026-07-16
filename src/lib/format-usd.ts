/**
 * Format a USD amount for display, precision scaling down as the value grows.
 * Returns null for missing/invalid input so callers can render their own dash.
 */
export function formatUsdPrice(v: number | null | undefined): string | null {
  if (v == null || !Number.isFinite(v)) return null;
  if (v >= 1)
    return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (v >= 0.01) return `$${v.toFixed(4)}`;
  if (v > 0) return '<$0.01';
  return '$0.00';
}

/**
 * Render a token amount as its USD equivalent (`≈ $x`), or null when there's
 * nothing meaningful to show.
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
