/**
 * @module utils
 * Shared utilities for the Epoch Intent Widget.
 *
 * Pure formatters now live in `@epoch-protocol/epoch-flows-sdk` and are
 * re-exported here so existing import paths keep working.
 */

export {
  formatAmount,
  truncateAddress,
  trimAmountInput,
  formatBalancePortionForInput,
} from '@epoch-protocol/epoch-flows-sdk';

/**
 * Merge class names, filtering out falsy values.
 *
 * @example
 *   cx('base', isActive && 'active', undefined) // → 'base active'
 */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * @deprecated Keyframes now ship in `epoch-intent-widget/styles.css`. The
 * export remains as a no-op for one release cycle to avoid breaking consumers
 * that imported it directly.
 */
export function injectKeyframes(): void {
  /* no-op: keyframes are in the bundled CSS */
}
