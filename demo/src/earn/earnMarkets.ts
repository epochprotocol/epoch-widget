import { HARDCODED_ONEDELTA_CONFIGS } from "@epoch-protocol/epoch-intent-widget";
import type { ScenarioProps } from "../pay/scenarios";

/**
 * Earn scenarios. The widget ships hardcoded 1delta lender configs in
 * `HARDCODED_ONEDELTA_CONFIGS`; we forward them via `earnMarketsSource` so
 * the picker has data without any backend. Replace with your own array to
 * scope which lenders / chains appear.
 */
export const EARN_DEPOSIT_PROPS: ScenarioProps = {
  mode: "earn",
  earnDefaultTab: "deposit",
  earnMarketsSource: HARDCODED_ONEDELTA_CONFIGS,
  title: "Earn",
};

export const EARN_WITHDRAW_PROPS: ScenarioProps = {
  mode: "earn",
  earnDefaultTab: "withdraw",
  earnMarketsSource: HARDCODED_ONEDELTA_CONFIGS,
  title: "Withdraw",
};
