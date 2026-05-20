import type { Scenario } from '../pay/scenarios';
import { Row } from './Row';
import { Badge } from './Badge';

interface Props {
  scenario: Scenario;
  active: boolean;
  onSelect: () => void;
}

export function ScenarioCard({ scenario, active, onSelect }: Props) {
  return (
    <button
      type="button"
      className={[
        'block w-full cursor-pointer rounded-[0.875rem] border bg-demo-surface p-4 text-left transition-[border-color,box-shadow]',
        active
          ? 'border-demo-border-active shadow-[0_0_0_3px_rgba(59,130,246,0.15),0_1px_2px_rgba(15,23,42,0.04)]'
          : 'border-demo-border shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
      ].join(' ')}
      onClick={onSelect}
    >
      <Row className="items-start justify-between">
        <div className="text-[0.9375rem] font-semibold">{scenario.name}</div>
        {active && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-blue-700">
            Active
          </span>
        )}
      </Row>
      <div className="mt-1 text-xs leading-normal text-demo-text-muted">{scenario.tagline}</div>
      <Row className="mt-3 flex-wrap gap-1.5">
        {scenario.props.intent ? (
          <>
            <Badge>{scenario.props.intent.config.protocol}</Badge>
            <Badge>{scenario.props.intent.config.action}</Badge>
            {scenario.props.intent.config.fixedOutput && <Badge tone="violet">fixed-output</Badge>}
          </>
        ) : (
          <Badge tone="violet">flat</Badge>
        )}
        {scenario.props.network === 'testnet' && <Badge tone="amber">testnet</Badge>}
      </Row>
    </button>
  );
}
