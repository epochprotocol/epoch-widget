import { RowAccordion } from 'epoch-intent-widget';
import type { ScenarioProps } from '../pay/scenarios';
import { EARN_DEPOSIT_PROPS, EARN_WITHDRAW_PROPS } from '../earn/earnMarkets';
import { Code } from '../components/Code';

interface Props {
  apiBaseUrl: string;
  onOpenWidget: (props: ScenarioProps, label: string) => void;
}

export function EarnSurface({ apiBaseUrl, onOpenWidget }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="m-0 text-3xl font-[650] -tracking-tight text-fg">Earn</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-fg-secondary">
          Deposit into yield markets, withdraw on demand.
        </p>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-fg-muted">
          Show a list of lending and yield markets right inside your app. Users deposit with any
          token they hold; withdrawals come back to the same wallet. No new accounts to open, no
          separate UI to maintain.
        </p>
        <div className="mt-4 max-w-2xl">
          <RowAccordion
            header={
              <span className="text-[12.5px] font-semibold text-fg-muted">For developers</span>
            }
          >
            <p className="m-0 text-[13px] leading-relaxed text-fg-secondary">
              <Code>{'mode="earn"'}</Code> with{' '}
              <Code>{'earnDefaultTab="deposit" | "withdraw"'}</Code>. Pass your own market list via{' '}
              <Code>earnMarketsSource</Code>, or import <Code>HARDCODED_ONEDELTA_CONFIGS</Code> from
              the package. Quotes hit a sibling solver at{' '}
              <Code>VITE_EARN_SOLVER_URL</Code> (defaults to <Code>localhost:3011</Code>). Allocator:{' '}
              <Code>{apiBaseUrl}</Code>.
            </p>
          </RowAccordion>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-line bg-surface p-5 shadow-sm">
          <div className="mb-2 text-base font-semibold text-fg">Deposit</div>
          <p className="mb-4 text-[13px] text-fg-muted">
            Pick a lending market and deposit any token. The widget routes and converts as needed.
          </p>
          <button
            type="button"
            onClick={() => onOpenWidget(EARN_DEPOSIT_PROPS, 'Earn deposit')}
            className="cursor-pointer rounded-md border-0 bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Open deposit flow →
          </button>
        </div>
        <div className="rounded-md border border-line bg-surface p-5 shadow-sm">
          <div className="mb-2 text-base font-semibold text-fg">Withdraw</div>
          <p className="mb-4 text-[13px] text-fg-muted">
            See your open positions and withdraw any amount — partial or max — back to your wallet.
          </p>
          <button
            type="button"
            onClick={() => onOpenWidget(EARN_WITHDRAW_PROPS, 'Earn withdraw')}
            className="cursor-pointer rounded-md border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-fg shadow-sm transition-colors hover:border-line-strong"
          >
            Open withdraw flow →
          </button>
        </div>
      </section>
    </div>
  );
}
