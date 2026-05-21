import { RowAccordion } from 'epoch-intent-widget';
import { PAY_SCENARIOS } from '../pay/scenarios';
import type { ScenarioProps } from '../pay/scenarios';
import { SectionLabel } from '../components/SectionLabel';
import { ScenarioCard } from '../components/ScenarioCard';
import { Row } from '../components/Row';
import { Detail } from '../components/Detail';
import { Code } from '../components/Code';
import { fmtAmount } from '../lib/format';

interface Props {
  apiBaseUrl: string;
  scenarioId: string;
  onChangeScenario: (id: string) => void;
  onOpenWidget: (props: ScenarioProps, label: string) => void;
}

export function PaySurface({ apiBaseUrl, scenarioId, onChangeScenario, onOpenWidget }: Props) {
  const scenario = PAY_SCENARIOS.find((s) => s.id === scenarioId) ?? PAY_SCENARIOS[0];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="m-0 text-3xl font-[650] -tracking-tight text-fg">Pay</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-fg-secondary">
          Accept payments in any token, on any supported chain.
        </p>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-fg-muted">
          Send the widget your destination address, amount, and the token you want to receive. The
          user picks whatever they hold — USDC on Optimism, ETH on Arbitrum, anything supported — and
          the intent network handles the conversion and delivery.
        </p>
        <div className="mt-4 max-w-2xl">
          <RowAccordion
            header={
              <span className="text-[12.5px] font-semibold text-fg-muted">For developers</span>
            }
          >
            <p className="m-0 text-[13px] leading-relaxed text-fg-secondary">
              Pay mode accepts either flat props (<Code>toAddress</Code> / <Code>toAmount</Code> /{' '}
              <Code>toToken</Code> / <Code>toChainId</Code>) for simple transfers, or a nested{' '}
              <Code>intent</Code> object when you need a structured action routed by the allocator at{' '}
              <Code>{apiBaseUrl}</Code>.
            </p>
          </RowAccordion>
        </div>
      </header>

      <section>
        <SectionLabel>Try a scenario</SectionLabel>
        <p className="-mt-1 mb-3 text-[13px] text-fg-muted">
          Each card shows a different shape of <Code>{'<EpochIntentWidget />'}</Code> props. Click to
          load — the widget opens with that scenario&apos;s data.
        </p>
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
              onClick={() => onOpenWidget(scenario.props, scenario.name)}
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
