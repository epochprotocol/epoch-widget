import type { ScenarioProps } from '../pay/scenarios';
import { EARN_DEPOSIT_PROPS, EARN_WITHDRAW_PROPS } from '../earn/earnMarkets';
import { Code } from '../components/Code';

interface Props {
  apiBaseUrl: string;
  onOpenWidget: (props: ScenarioProps, label: string) => void;
}

export function EarnSurface({ apiBaseUrl, onOpenWidget }: Props) {
  return (
    <>
      <div className="mb-8">
        <h1 className="m-0 text-3xl font-[650] tracking-tight">Earn</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-demo-text-muted">
          Deposit + withdraw flows live in <Code>EpochIntentWidget</Code> with <Code>mode=&quot;earn&quot;</Code>.
          Markets come from <Code>HARDCODED_ONEDELTA_CONFIGS</Code> in the widget bundle and are passed in via{' '}
          <Code>earnMarketsSource</Code>. Quotes target a sibling{' '}
          <Code>1delta-solver</Code> service (<Code>/solver-type</Code>, <Code>/quote</Code>). API: <Code>{apiBaseUrl}</Code>
        </p>
      </div>

      <div>
        <button
          type="button"
          className="mb-2 mr-2 inline-flex cursor-pointer items-center justify-center rounded-lg border-none bg-demo-accent px-4 py-2.5 text-sm font-semibold text-white"
          onClick={() => onOpenWidget(EARN_DEPOSIT_PROPS, 'Earn deposit')}
        >
          Open earn deposit
        </button>
        <button
          type="button"
          className="mb-2 mr-2 inline-flex cursor-pointer items-center justify-center rounded-lg border border-demo-border bg-transparent px-4 py-2.5 text-sm font-semibold text-demo-text"
          onClick={() => onOpenWidget(EARN_WITHDRAW_PROPS, 'Earn withdraw')}
        >
          Open earn withdraw
        </button>
      </div>
    </>
  );
}
