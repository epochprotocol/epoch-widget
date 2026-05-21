import { Code } from '../components/Code';

interface Props {
  /** Scroll to / activate the Pay tab. */
  onTryPay: () => void;
}

const SNIPPET = `import { EpochIntentWidget } from 'epoch-intent-widget';
import 'epoch-intent-widget/styles.css';

<EpochIntentWidget
  isOpen={open}
  onClose={() => setOpen(false)}
  toAddress="0x…"
  toAmount="10"
  toToken="USDC"
  toChainId={8453}
/>`;

/**
 * Landing hero. Goal: a first-time visitor reads the screen and understands
 * what the widget does in 10 seconds, before scrolling to the live demos.
 */
export function Hero({ onTryPay }: Props) {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:py-14">
      <div>
        <h1 className="m-0 text-3xl font-[650] leading-[1.15] -tracking-tight text-fg sm:text-[34px]">
          Accept on-chain payments, swaps, and yield deposits from any chain.
        </h1>
        <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-fg-secondary">
          <Code>{'<EpochIntentWidget />'}</Code> is a React modal you drop into your app. Users pay or
          deposit with whatever token they already hold; Epoch&apos;s intent network handles the
          bridging and execution.
        </p>

        <div className="mt-6 space-y-4 text-[14px] leading-relaxed text-fg-muted">
          <p className="m-0">
            <span className="font-semibold text-fg">Plain English.</span> Your customer wants to buy
            something or deposit into a vault. They probably don&apos;t have the exact token, on the
            exact chain, that your contract expects. This widget gives them a familiar modal — pick
            any token, sign once, done. The infrastructure does the routing.
          </p>
          <p className="m-0">
            <span className="font-semibold text-fg">For developers.</span> One React component, four
            props for the common case. Lifecycle callbacks (<Code>onIntentSent</Code>,{' '}
            <Code>onIntentComplete</Code>, <Code>onError</Code>) plug into your analytics and order
            pipeline. Theming via CSS variables — no rebuild needed.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onTryPay}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border-0 bg-primary px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Try the Pay demo
            <span aria-hidden>→</span>
          </button>
          <a
            href="https://github.com/anthropics/claude-code"
            target="_blank"
            rel="noreferrer"
            className="text-[13px] font-medium text-fg-muted underline decoration-line-strong underline-offset-4 hover:text-fg"
          >
            View the package on npm
          </a>
        </div>
      </div>

      <div className="lg:pl-2">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
          Drop-in install
        </div>
        <Code block>{SNIPPET}</Code>
        <p className="mt-3 text-[12.5px] leading-relaxed text-fg-muted">
          Wrap in a <Code>WagmiProvider</Code> with connectors of your choice. Source token
          discovery, balance checks, and the modal UI come bundled.
        </p>
      </div>
    </section>
  );
}
