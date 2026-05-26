import type { ScenarioProps } from '../pay/scenarios';
import { EARN_DEPOSIT_PROPS, EARN_WITHDRAW_PROPS } from '../earn/earnMarkets';

interface Props {
  apiBaseUrl: string;
  onOpenWidget: (props: ScenarioProps) => void;
}

export function EarnSurface({ onOpenWidget }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="m-0 text-3xl font-[650] -tracking-tight text-fg">Earn</h1>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-line bg-surface p-5 shadow-sm">
          <div className="mb-4 text-base font-semibold text-fg">Deposit</div>
          <button
            type="button"
            onClick={() => onOpenWidget(EARN_DEPOSIT_PROPS)}
            className="cursor-pointer rounded-md border-0 bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Open deposit flow →
          </button>
        </div>
        <div className="rounded-md border border-line bg-surface p-5 shadow-sm">
          <div className="mb-4 text-base font-semibold text-fg">Withdraw</div>
          <button
            type="button"
            onClick={() => onOpenWidget(EARN_WITHDRAW_PROPS)}
            className="cursor-pointer rounded-md border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-fg shadow-sm transition-colors hover:border-line-strong"
          >
            Open withdraw flow →
          </button>
        </div>
      </section>
    </div>
  );
}
