import type { ScenarioProps } from '../pay/scenarios';

/**
 * Earn scenarios. Omit `earnMarketsSource` to use the bundled configs (1delta
 * mainnet + dummy-lending testnet). Toggle Testnet in the modal header to
 * switch networks.
 */
export const EARN_DEPOSIT_PROPS: ScenarioProps = {
  mode: 'earn',
  earnDefaultTab: 'deposit',
  allowNetworkToggle: true,
  title: 'Earn',
};

export const EARN_WITHDRAW_PROPS: ScenarioProps = {
  mode: 'earn',
  earnDefaultTab: 'withdraw',
  allowNetworkToggle: true,
  title: 'Withdraw',
};
