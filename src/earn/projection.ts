/**
 * APR-only preview: estimated yearly yield (not a guarantee, no maturity payout).
 * `aprDecimal` is annual rate as a fraction, e.g. 0.0525 for 5.25%.
 */
export function estimatedAnnualYield(principalHuman: number, aprDecimal: number): number {
  if (!Number.isFinite(principalHuman) || principalHuman <= 0) return 0;
  if (!Number.isFinite(aprDecimal) || aprDecimal < 0) return 0;
  return principalHuman * aprDecimal;
}
