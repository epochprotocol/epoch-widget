import { RowAccordion } from 'epoch-intent-widget';
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
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="m-0 text-3xl font-[650] -tracking-tight text-fg">Swap</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-fg-secondary">
          Convert between tokens with one signature.
        </p>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-fg-muted">
          Same flow as Pay, presented as a swap. The user picks a source token, the widget shows a
          quote, they confirm — and receives the target token on the destination chain.
        </p>
        <div className="mt-4 max-w-2xl">
          <RowAccordion
            header={
              <span className="text-[12.5px] font-semibold text-fg-muted">For developers</span>
            }
          >
            <p className="m-0 text-[13px] leading-relaxed text-fg-secondary">
              Identical SDK path to Pay; <Code>{'mode="swap"'}</Code> swaps button labels and
              lifecycle copy. Allocator: <Code>{apiBaseUrl}</Code>.
            </p>
          </RowAccordion>
        </div>
      </header>

      <section className="rounded-md border border-line bg-surface p-5 shadow-sm">
        <div className="mb-3 text-base font-semibold text-fg">{scenario.name}</div>
        <p className="m-0 mb-4 text-[13px] text-fg-muted">{scenario.tagline}</p>
        <button
          type="button"
          onClick={() => onOpenWidget(scenario.props, scenario.name)}
          className="cursor-pointer rounded-md border-0 bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
        >
          Open swap widget →
        </button>
      </section>
    </div>
  );
}
