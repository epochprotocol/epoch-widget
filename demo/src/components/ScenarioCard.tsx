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
      onClick={onSelect}
      className={[
        'block w-full cursor-pointer rounded-md border bg-surface p-4 text-left shadow-sm transition-[border-color,box-shadow]',
        active
          ? 'border-primary shadow-[0_0_0_3px_var(--epoch-color-accent-soft),0_1px_2px_rgba(15,23,42,0.04)]'
          : 'border-line hover:border-line-strong',
      ].join(' ')}
    >
      <Row className="items-start justify-between">
        <div className="text-[15px] font-semibold text-fg">{scenario.name}</div>
        {active && (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
            Active
          </span>
        )}
      </Row>
      <div className="mt-1 text-xs leading-normal text-fg-muted">{scenario.tagline}</div>
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
