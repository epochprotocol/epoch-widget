import { useEffect, useMemo, useRef, useState } from 'react';
import { EpochIntentWidget, SegmentedTabs } from 'epoch-intent-widget';
import type { ScenarioProps } from '../pay/scenarios';
import { PAY_SCENARIOS } from '../pay/scenarios';
import { getApiBaseUrl } from '../lib/apiBaseUrl';
import { shorten } from '../lib/format';
import { AppShell } from './AppShell';
import { Hero } from './Hero';
import type { DemoSurface } from '../types/surface';
import type { LogEntry } from './log';
import { PaySurface } from '../surfaces/PaySurface';
import { SwapSurface } from '../surfaces/SwapSurface';
import { EarnSurface } from '../surfaces/EarnSurface';
import { AdvancedSurface } from '../surfaces/AdvancedSurface';
import { EventLog } from '../components/EventLog';
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

const BASE_TABS = [
  { value: 'pay'  as const, label: 'Pay' },
  { value: 'swap' as const, label: 'Swap' },
  { value: 'earn' as const, label: 'Earn' },
];
const ADVANCED_TAB = { value: 'advanced' as const, label: 'Advanced' };

export default function App() {
  const apiBaseUrl = getApiBaseUrl();
  const earnSolverUrl =
    (import.meta.env.VITE_EARN_SOLVER_URL as string | undefined) ?? 'http://localhost:3011';
  const positionsBaseUrl =
    (import.meta.env.VITE_POSITIONS_API_BASE_URL as string | undefined) ?? 'http://localhost:4023';

  const showAdvanced = useAdvancedFlag();
  const tabs = showAdvanced ? [...BASE_TABS, ADVANCED_TAB] : BASE_TABS;
  const earnMiden = useEarnMidenAdapter();

  const [surface, setSurface] = useState<DemoSurface>('pay');
  const [payScenarioId, setPayScenarioId] = useState(PAY_SCENARIOS[0].id);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [widgetProps, setWidgetProps] = useState<ScenarioProps>(PAY_SCENARIOS[0].props);
  const [log, setLog] = useState<LogEntry[]>([]);

  const tabsRef = useRef<HTMLDivElement>(null);

  const addLog = (level: LogEntry['level'], msg: string) =>
    setLog((prev) => [{ ts: new Date(), level, msg }, ...prev].slice(0, 50));

  const openWidget = (props: ScenarioProps, label: string) => {
    setWidgetProps(props);
    setWidgetOpen(true);
    addLog('info', `Opened widget: ${label}`);
  };

  // Hero CTA → Pay tab + scroll to the tab strip.
  const handleTryPay = () => {
    setSurface('pay');
    requestAnimationFrame(() => {
      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  // Defensive: if `?advanced=1` is removed mid-session and the saved surface
  // is `'advanced'`, fall back to Pay so we don't render a hidden tab.
  useEffect(() => {
    if (surface === 'advanced' && !showAdvanced) setSurface('pay');
  }, [surface, showAdvanced]);

  return (
    <AppShell>
      <Hero onTryPay={handleTryPay} />

      <div ref={tabsRef} className="mx-auto max-w-6xl px-6">
        <SegmentedTabs<DemoSurface>
          tabs={tabs}
          value={surface}
          onChange={setSurface}
          size="md"
        />
      </div>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section>
          {surface === 'pay' && (
            <PaySurface
              apiBaseUrl={apiBaseUrl}
              scenarioId={payScenarioId}
              onChangeScenario={setPayScenarioId}
              onOpenWidget={openWidget}
            />
          )}
          {surface === 'swap' && (
            <SwapSurface apiBaseUrl={apiBaseUrl} onOpenWidget={openWidget} />
          )}
          {surface === 'earn' && (
            <EarnSurface apiBaseUrl={apiBaseUrl} onOpenWidget={openWidget} />
          )}
          {surface === 'advanced' && showAdvanced && (
            <AdvancedSurface api={apiBaseUrl} />
          )}
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <EventLog entries={log} />
        </aside>
      </main>

      <EpochIntentWidget
        {...widgetProps}
        earnSolverUrl={earnSolverUrl}
        earnMiden={widgetProps.mode === 'earn' ? earnMiden : undefined}
        isOpen={widgetOpen}
        onClose={() => {
          setWidgetOpen(false);
          addLog('info', 'Widget closed');
        }}
        api={{
          baseUrl: apiBaseUrl,
          positionsBaseUrl,
          testnetBaseUrl:
            (import.meta.env.VITE_TESTNET_API_BASE_URL as string | undefined) ??
            'http://localhost:3000',
          testnetPositionsBaseUrl:
            (import.meta.env.VITE_TESTNET_POSITIONS_API_BASE_URL as string | undefined) ??
            'http://localhost:4024',
        }}
        onIntentSent={({ nonce }) => addLog('info', `Intent sent — nonce ${shorten(nonce)}`)}
        onIntentComplete={({ nonce }) => addLog('success', `Intent complete — nonce ${shorten(nonce)}`)}
        onError={({ error }) => addLog('error', error.message)}
        onStart={({ sessionId, mode }) =>
          addLog('info', `onStart — mode=${mode} session=${shorten(sessionId)}`)
        }
        onSign={({ sessionId }) => addLog('info', `onSign — session=${shorten(sessionId)}`)}
        onSuccess={({ sessionId, nonce }) =>
          addLog('success', `onSuccess — nonce=${shorten(nonce)} session=${shorten(sessionId)}`)
        }
        onStatus={({ status, progress, activeStep }) =>
          addLog('info', `status=${status} step=${activeStep} progress=${progress}`)
        }
        onOpen={() => addLog('info', 'Widget opened')}
      />
    </AppShell>
  );
}
