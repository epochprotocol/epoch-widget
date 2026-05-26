import { PAY_SCENARIOS } from '../pay/scenarios';
import type { ScenarioProps } from '../pay/scenarios';
import { SectionLabel } from '../components/SectionLabel';
import { ScenarioCard } from '../components/ScenarioCard';
import { Row } from '../components/Row';
import { Detail } from '../components/Detail';
import { fmtAmount } from '../lib/format';

interface Props {
  apiBaseUrl: string;
  scenarioId: string;
  onChangeScenario: (id: string) => void;
  onOpenWidget: (props: ScenarioProps) => void;
}

export function PaySurface({ scenarioId, onChangeScenario, onOpenWidget }: Props) {
  const scenario = PAY_SCENARIOS.find((s) => s.id === scenarioId) ?? PAY_SCENARIOS[0];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="m-0 text-3xl font-[650] -tracking-tight text-fg">Pay</h1>
      </header>

      <section>
        <SectionLabel>Scenarios</SectionLabel>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3">
          {PAY_SCENARIOS.map((sc) => (
            <ScenarioCard
              key={sc.id}
              scenario={sc}
              active={scenarioId === sc.id}
              onSelect={() => onChangeScenario(sc.id)}
            />
          ))}
        </div>

        <div className="mt-6 rounded-md border border-line bg-surface p-5 shadow-sm">
          <Row className="justify-between">
            <div>
              <SectionLabel className="mb-0.5">Selected</SectionLabel>
              <div className="text-base font-semibold text-fg">{scenario.name}</div>
            </div>
            <button
              type="button"
              onClick={() => onOpenWidget(scenario.props)}
              className="cursor-pointer rounded-md border-0 bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
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
        </div>
      </section>
    </div>
  );
}
