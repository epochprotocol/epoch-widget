import { useState } from 'react';
import { PAY_SCENARIOS } from '../pay/scenarios';
import type { ScenarioProps } from '../pay/scenarios';
import { SectionLabel } from '../components/SectionLabel';
import { ScenarioCard } from '../components/ScenarioCard';
import { Row } from '../components/Row';
import { Detail } from '../components/Detail';
import { EventLog } from '../components/EventLog';
import type { LogEntry } from '../app/log';
import { fmtAmount } from '../lib/format';
import { Code } from '../components/Code';

interface Props {
  apiBaseUrl: string;
  log: LogEntry[];
  onOpenWidget: (props: ScenarioProps, label: string) => void;
  /** Optional external control (builder). */
  scenarioId?: string;
  onScenarioChange?: (id: string) => void;
  hideScenarioGrid?: boolean;
  hideEventLog?: boolean;
}

export function PaySurface({
  apiBaseUrl,
  log,
  onOpenWidget,
  scenarioId,
  onScenarioChange,
  hideScenarioGrid,
  hideEventLog,
}: Props) {
  const [activeId, setActiveId] = useState(PAY_SCENARIOS[0].id);
  const effectiveId = scenarioId ?? activeId;
  const scenario = PAY_SCENARIOS.find((s) => s.id === effectiveId) ?? PAY_SCENARIOS[0];

  const selectScenario = (id: string) => {
    onScenarioChange?.(id);
    setActiveId(id);
  };

  return (
    <>
      <div className="mb-10">
        <h1 className="m-0 text-3xl font-[650] tracking-tight">Pay</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-demo-text-muted">
          Pick a scenario and open the dialog. Partners embed only the <Code>EpochIntentWidget</Code> — this page
          shows how host apps wire props and callbacks. API: <Code>{apiBaseUrl}</Code>
        </p>
      </div>

      <div
        className={hideEventLog ? 'grid grid-cols-1 gap-6' : 'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]'}
      >
        <section>
          <SectionLabel>Scenarios</SectionLabel>
          {!hideScenarioGrid && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3">
              {PAY_SCENARIOS.map((sc) => (
                <ScenarioCard
                  key={sc.id}
                  scenario={sc}
                  active={effectiveId === sc.id}
                  onSelect={() => selectScenario(sc.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-6 rounded-[0.875rem] border border-demo-border bg-demo-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <Row className="justify-between">
              <div>
                <SectionLabel className="mb-0.5">Selected</SectionLabel>
                <div className="text-base font-semibold">{scenario.name}</div>
              </div>
              <button
                type="button"
                className="cursor-pointer rounded-lg bg-demo-accent px-[1.125rem] py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.1)]"
                onClick={() => onOpenWidget(scenario.props, scenario.name)}
              >
                Open widget →
              </button>
            </Row>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {scenario.props.intent ? (
                <>
                  <Detail
                    label="Required"
                    value={`${fmtAmount(
                      scenario.props.intent.requiredAmount,
                      scenario.props.intent.requiredToken.decimals,
                    )} ${scenario.props.intent.requiredToken.symbol}`}
                  />
                  <Detail label="Destination" value={scenario.props.intent.destinationChainName ?? '—'} />
                  <Detail label="Protocol" value={scenario.props.intent.config.protocol} />
                  <Detail label="Action" value={scenario.props.intent.config.action} />
                </>
              ) : (
                <>
                  <Detail label="To address" value={scenario.props.toAddress ?? '—'} />
                  <Detail
                    label="Amount"
                    value={`${scenario.props.toAmount ?? '—'} ${scenario.props.toTokenSymbol ?? ''}`}
                  />
                  <Detail label="Chain ID" value={String(scenario.props.toChainId ?? '—')} />
                  <Detail label="Token" value={scenario.props.toToken ?? '—'} />
                </>
              )}
            </div>

            {scenario.id === 'evm-swap-quote' && <EvmSwapCallout />}
          </div>
        </section>

        {!hideEventLog && <EventLog entries={log} />}
      </div>
    </>
  );
}

function EvmSwapCallout() {
  return (
    <p className="mt-4 rounded-lg border border-demo-border bg-slate-100 p-3 text-xs leading-snug text-demo-text-muted">
      <strong className="text-demo-text">Miden example vs this widget:</strong> miden-integration-example uses a
      Miden→EVM path (P2IDE note). The widget here is EVM pay-in → fixed token out with an allocator quote.
    </p>
  );
}
