import { useState } from 'react';
import { EpochIntentWidget } from 'epoch-intent-widget';
import type { ScenarioProps } from '../pay/scenarios';
import { PAY_SCENARIOS } from '../pay/scenarios';
import { getApiBaseUrl } from '../lib/apiBaseUrl';
import { shorten } from '../lib/format';
import { AppShell } from './AppShell';
import type { DemoSurface } from '../types/surface';
import type { LogEntry } from './log';
import { SettingsPanel, type BuilderState } from '../builder/SettingsPanel';
import { PreviewPane } from '../builder/PreviewPane';

export default function App() {
  const apiBaseUrl = getApiBaseUrl();
  const earnSolverUrl =
    (import.meta.env.VITE_EARN_SOLVER_URL as string | undefined) ?? 'http://localhost:3011';
  const positionsBaseUrl =
    (import.meta.env.VITE_POSITIONS_API_BASE_URL as string | undefined) ??
    'http://localhost:4023';
  const [surface, setSurface] = useState<DemoSurface>('pay');
  const [payScenarioId, setPayScenarioId] = useState(PAY_SCENARIOS[0].id);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [widgetProps, setWidgetProps] = useState<ScenarioProps>(PAY_SCENARIOS[0].props);
  const [log, setLog] = useState<LogEntry[]>([]);

  const addLog = (level: LogEntry['level'], msg: string) =>
    setLog((prev) => [{ ts: new Date(), level, msg }, ...prev].slice(0, 30));

  const openWidget = (props: ScenarioProps, label: string) => {
    setWidgetProps(props);
    setWidgetOpen(true);
    addLog('info', `Opened widget: ${label}`);
  };

  const builderState: BuilderState = { surface, payScenarioId };
  const setBuilderState = (next: BuilderState) => {
    setSurface(next.surface);
    setPayScenarioId(next.payScenarioId);
  };

  const reset = () => {
    setSurface('pay');
    setPayScenarioId(PAY_SCENARIOS[0].id);
  };

  return (
    <AppShell>
      <main className="flex">
        <SettingsPanel state={builderState} onChange={setBuilderState} onReset={reset} />
        <PreviewPane
          surface={surface}
          apiBaseUrl={apiBaseUrl}
          log={log}
          onOpenWidget={openWidget}
          payScenarioId={payScenarioId}
        />
      </main>

      <EpochIntentWidget
        {...widgetProps}
        earnSolverUrl={earnSolverUrl}
        isOpen={widgetOpen}
        onClose={() => {
          setWidgetOpen(false);
          addLog('info', 'Widget closed');
        }}
        api={{ baseUrl: apiBaseUrl, positionsBaseUrl }}
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
