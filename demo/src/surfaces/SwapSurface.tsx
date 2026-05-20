import type { ScenarioProps } from '../pay/scenarios';
import { SWAP_SCENARIOS } from '../pay/scenarios';
import { Code } from '../components/Code';

interface Props {
  apiBaseUrl: string;
  onOpenWidget: (props: ScenarioProps, label: string) => void;
}

export function SwapSurface({ apiBaseUrl, onOpenWidget }: Props) {
  const scenario = SWAP_SCENARIOS[0];
  return (
    <>
      <div className="mb-8">
        <h1 className="m-0 text-3xl font-[650] tracking-tight">Swap</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-demo-text-muted">
          Same Epoch intent SDK path as pay, with <Code>mode=&quot;swap&quot;</Code> for UI labels and lifecycle
          callbacks. Allocator: <Code>{apiBaseUrl}</Code>
        </p>
      </div>
      <button
        type="button"
        className="inline-flex cursor-pointer items-center justify-center rounded-lg border-none bg-demo-accent px-4 py-2.5 text-sm font-semibold text-white"
        onClick={() => onOpenWidget(scenario.props, scenario.name)}
      >
        Open swap widget
      </button>
    </>
  );
}
