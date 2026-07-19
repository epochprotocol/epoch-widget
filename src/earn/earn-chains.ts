import {
  DUMMY_LENDING_DESTINATION_CHAIN_IDS,
  DUMMY_LENDING_SOURCE_EVM_CHAIN_IDS,
} from './dummy-lending-markets';

/**
 * The earn chain universe, in one place.
 *
 * These were previously declared in EarnIntentWidget and hand-copied into
 * MarketPickerPage under a "keep in sync" comment — the picker silently offered
 * the wrong chains whenever the two drifted.
 */

/** Mainnet earn chains, bounded by what 1delta indexes upstream. */
export const EARN_MAINNET_CHAIN_IDS: ReadonlySet<number> = new Set<number>([
  1, 8453, 42161, 10, 137,
]);

/** Testnet has no 1delta indexing, so it rides the bundled dummy-lending set. */
export const EARN_TESTNET_CHAIN_IDS: ReadonlySet<number> = new Set<number>(
  DUMMY_LENDING_DESTINATION_CHAIN_IDS,
);

/** Chains a testnet deposit may be funded *from*. */
export const EARN_TESTNET_SOURCE_EVM_CHAIN_IDS: ReadonlySet<number> =
  new Set<number>(DUMMY_LENDING_SOURCE_EVM_CHAIN_IDS);

/** Earn chains for `network`, as a plain array (dropdowns, CSV scopes). */
export function earnChainIdsFor(isTestnet: boolean): number[] {
  return [...(isTestnet ? EARN_TESTNET_CHAIN_IDS : EARN_MAINNET_CHAIN_IDS)];
}
