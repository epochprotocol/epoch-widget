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
          token they hold; withdrawals come back to the same wallet. Use the Mainnet / Testnet toggle
          in the modal header to try dummy-lending on Base Sepolia, Sepolia, and Optimism Sepolia.
        </p>
        <div className="mt-4 max-w-2xl">
          <RowAccordion
            header={
              <span className="text-[12.5px] font-semibold text-fg-muted">For developers</span>
            }
          >
            <p className="m-0 text-[13px] leading-relaxed text-fg-secondary">
              <Code>{'mode="earn"'}</Code> with{' '}
              <Code>{'earnDefaultTab="deposit" | "withdraw"'}</Code>. The network toggle is on by
              default in earn mode (<Code>{'allowNetworkToggle'}</Code>); pass{' '}
              <Code>{'allowNetworkToggle={false}'}</Code> to hide it. Optional{' '}
              <Code>earnMarketsSource</Code> scopes lenders; otherwise bundled mainnet 1delta +
              testnet dummy-lending configs apply. On testnet the widget uses local services by
              default — allocator <Code>localhost:3000</Code>, positions{' '}
              <Code>localhost:4024</Code> (override via <Code>testnetBaseUrl</Code> /{' '}
              <Code>testnetPositionsBaseUrl</Code> on <Code>api</Code>). Mainnet allocator:{' '}
              <Code>{apiBaseUrl}</Code>.
            </p>
          </RowAccordion>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-line bg-surface p-5 shadow-sm">
          <div className="mb-2 text-base font-semibold text-fg">Deposit</div>
          <p className="mb-4 text-[13px] text-fg-muted">
            Pick a lending market and deposit from an EVM wallet or Miden (testnet).
          Toggle <strong>Testnet</strong> in the modal, then use the EVM / Miden
          source switch on the deposit form.
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
