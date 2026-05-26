import type { ScenarioProps } from '../pay/scenarios';
import { SWAP_SCENARIOS } from '../pay/scenarios';

interface Props {
  apiBaseUrl: string;
  onOpenWidget: (props: ScenarioProps) => void;
}

export function SwapSurface({ onOpenWidget }: Props) {
  const scenario = SWAP_SCENARIOS[0];
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="m-0 text-3xl font-[650] -tracking-tight text-fg">Swap</h1>
      </header>

      <section className="flex flex-col rounded-md border border-line bg-surface p-5 shadow-sm">
        <div className="text-base font-semibold text-fg">{scenario.name}</div>
        <p className="mt-1.5 mb-4 text-[13px] leading-relaxed text-fg-muted">
          {scenario.tagline}
        </p>
        <button
          type="button"
          onClick={() => onOpenWidget(scenario.props)}
          className="cursor-pointer self-start rounded-md border-0 bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
        >
          Open widget →
        </button>
      </section>
    </div>
  );
}
