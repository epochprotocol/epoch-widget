import { useEffect, useMemo, useState } from 'react';
import { EpochIntentWidget, SegmentedTabs } from '@epoch-protocol/epoch-intent-widget';
import type { ScenarioProps } from '../pay/scenarios';
import { PAY_SCENARIOS, PAY_TESTNET_SCENARIOS } from '../pay/scenarios';
import { getApiBaseUrl } from '../lib/apiBaseUrl';
import { AppShell } from './AppShell';
import type { DemoNetwork } from './AppShell';
import type { DemoSurface } from '../types/surface';
import { PaySurface } from '../surfaces/PaySurface';
import { SwapSurface } from '../surfaces/SwapSurface';
import { EarnSurface } from '../surfaces/EarnSurface';
import { AdvancedSurface } from '../surfaces/AdvancedSurface';
import { useEarnMidenAdapter } from '../earn/useEarnMidenAdapter';

/**
 * Read `?advanced=1` once on mount. When set, the Advanced (Miden → EVM)
 * tab joins the tab strip. Default visitors never see it.
 */
function useAdvancedFlag(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('advanced') === '1';
  }, []);
}

const PAY_TAB = { value: 'pay'  as const, label: 'Pay' };
const SWAP_TAB = { value: 'swap' as const, label: 'Swap' };
const EARN_TAB = { value: 'earn' as const, label: 'Earn' };
const ADVANCED_TAB = { value: 'advanced' as const, label: 'Advanced' };

export default function App() {
  const apiBaseUrl = getApiBaseUrl();
  const earnSolverUrl =
    (import.meta.env.VITE_EARN_SOLVER_URL as string | undefined) ?? 'http://localhost:3011';
  const positionsBaseUrl =
    (import.meta.env.VITE_POSITIONS_API_BASE_URL as string | undefined) ?? 'http://localhost:4023';

  const showAdvanced = useAdvancedFlag();
  const earnMiden = useEarnMidenAdapter();

  const [network, setNetwork] = useState<DemoNetwork>('mainnet');
  const tabs = useMemo(() => {
    const base = [PAY_TAB, SWAP_TAB, EARN_TAB];
    return showAdvanced ? [...base, ADVANCED_TAB] : base;
  }, [showAdvanced]);

  const [surface, setSurface] = useState<DemoSurface>('pay');
  const [payScenarioId, setPayScenarioId] = useState(PAY_SCENARIOS[0].id);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [widgetProps, setWidgetProps] = useState<ScenarioProps>(PAY_SCENARIOS[0].props);

  const openWidget = (props: ScenarioProps) => {
    setWidgetProps(props);
    setWidgetOpen(true);
  };

  // Defensive: if `?advanced=1` is removed mid-session and the saved surface
  // is `'advanced'`, fall back to Pay so we don't render a hidden tab.
  useEffect(() => {
    if (surface === 'advanced' && !showAdvanced) setSurface('pay');
  }, [surface, showAdvanced]);

  // Reset pay scenario when network flips — testnet + mainnet have disjoint
  // scenario ids so the previously selected id won't match anything.
  useEffect(() => {
    const scenarios = network === 'testnet' ? PAY_TESTNET_SCENARIOS : PAY_SCENARIOS;
    setPayScenarioId(scenarios[0].id);
  }, [network]);

  return (
    <AppShell network={network} onNetworkChange={setNetwork}>
      <div className="mx-auto max-w-3xl px-6 pt-6">
        <SegmentedTabs<DemoSurface>
          tabs={tabs}
          value={surface}
          onChange={setSurface}
          size="md"
        />
      </div>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {surface === 'pay' && (
          <PaySurface
            apiBaseUrl={apiBaseUrl}
            scenarioId={payScenarioId}
            onChangeScenario={setPayScenarioId}
            onOpenWidget={openWidget}
            network={network}
          />
        )}
        {surface === 'swap' && (
          <SwapSurface onOpenWidget={openWidget} network={network} />
        )}
        {surface === 'earn' && (
          <EarnSurface apiBaseUrl={apiBaseUrl} onOpenWidget={openWidget} />
        )}
        {surface === 'advanced' && showAdvanced && <AdvancedSurface api={apiBaseUrl} />}
      </main>

      {(() => {
        const widgetMode = widgetProps.mode ?? widgetProps.flow ?? 'pay';
        const isEarnMode = widgetMode === 'earn';
        return (
          <EpochIntentWidget
            {...widgetProps}
            {...(isEarnMode ? { earnSolverUrl } : {})}
            // One adapter for every flow; the widget wires earn and pay/swap off
            // it. Testnet only — mainnet has no Miden faucets.
            miden={network === 'testnet' ? earnMiden : undefined}
            isOpen={widgetOpen}
            onClose={() => setWidgetOpen(false)}
            network={network}
            api={
              isEarnMode
                ? {
                    baseUrl: apiBaseUrl,
                    positionsBaseUrl,
                    testnetBaseUrl:
                      (import.meta.env.VITE_TESTNET_API_BASE_URL as string | undefined) ??
                      'http://localhost:3000',
                    testnetPositionsBaseUrl:
                      (import.meta.env.VITE_TESTNET_POSITIONS_API_BASE_URL as string | undefined) ??
                      'http://localhost:4024',
                  }
                : {
                    baseUrl: apiBaseUrl,
                    testnetBaseUrl:
                      (import.meta.env.VITE_TESTNET_API_BASE_URL as string | undefined) ??
                      'http://localhost:3000',
                  }
            }
          />
        );
      })()}
    </AppShell>
  );
}
