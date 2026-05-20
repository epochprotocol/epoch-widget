/**
 * @module utils
 * Shared utilities for the Epoch Intent Widget.
 */

// ---------------------------------------------------------------------------
// Class name merging
// ---------------------------------------------------------------------------

/**
 * Merge class names, filtering out falsy values.
 *
 * @example
 *   cx('base', isActive && 'active', undefined) // → 'base active'
 */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Amount formatting
// ---------------------------------------------------------------------------

/**
 * Format a raw token amount (bigint) into a human-readable decimal string.
 *
 * @param amount  Raw amount in the token's smallest unit.
 * @param decimals  Token decimals (e.g. 18 for ETH, 6 for USDC).
 * @param maxFrac  Maximum fractional digits to display (default: 6).
 */
export function formatAmount(
  amount: bigint,
  decimals: number,
  maxFrac = 6,
): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  if (remainder === 0n) return whole.toString();
  const fracStr = remainder
    .toString()
    .padStart(decimals, '0')
    .replace(/0+$/, '');
  const trimmed = fracStr.slice(0, Math.min(maxFrac, fracStr.length));
  return `${whole}.${trimmed}`;
}

/**
 * Truncate an Ethereum address to `0x1234…5678` form.
 */
export function truncateAddress(address: string, chars = 4): string {
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

/** Strip trailing zeros for human-editable amount strings built from bigint. */
export function trimAmountInput(s: string): string {
  if (!s.includes('.')) return s;
  return s.replace(/\.?0+$/, '') || '0';
}

/**
 * Format a fraction of an on-chain balance for a deposit input (e.g. 20% / 50% / Max).
 */
export function formatBalancePortionForInput(
  balance: bigint,
  numerator: number,
  denominator: number,
  decimals: number,
): string {
  if (denominator <= 0) return '0';
  const part = (balance * BigInt(numerator)) / BigInt(denominator);
  return trimAmountInput(formatAmount(part, decimals, Math.min(18, decimals)));
}

// ---------------------------------------------------------------------------
// Keyframe injection (once per page)
// ---------------------------------------------------------------------------

let _keyframesInjected = false;

/**
 * Inject the widget's CSS keyframe animations into the document head.
 * Safe to call multiple times — will only inject once.
 */
export function injectKeyframes(): void {
  if (_keyframesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes epoch-spin { to { transform: rotate(360deg); } }
    @keyframes epoch-dropdown-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes epoch-modal-in {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes epoch-overlay-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  `;
  style.setAttribute('data-epoch-widget', 'keyframes');
  document.head.appendChild(style);
  _keyframesInjected = true;
}
