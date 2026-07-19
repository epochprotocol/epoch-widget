import { parseUnits } from 'viem';
import type { EpochEarnPosition } from '../types';

/**
 * True when a validly-entered amount exceeds the available balance.
 *
 * Empty or partial input (mid-typing, e.g. "1.") is not treated as
 * insufficient — it returns false so the CTA falls through to its "enter an
 * amount" state rather than flashing an insufficient-balance error.
 */
export function exceedsBalance(
  human: string,
  decimals: number,
  balanceRaw: bigint,
): boolean {
  const trimmed = human.trim().replace(/,/g, '');
  if (!trimmed) return false;
  let amountRaw: bigint;
  try {
    amountRaw = parseUnits(trimmed, decimals);
  } catch {
    return false;
  }
  return amountRaw > balanceRaw;
}

/** Withdrawable underlying for a position, in raw units (0 if unparseable). */
export function positionWithdrawableRaw(position: EpochEarnPosition): bigint {
  try {
    return BigInt(position.withdrawableRaw ?? position.underlyingBalanceRaw);
  } catch {
    return 0n;
  }
}
