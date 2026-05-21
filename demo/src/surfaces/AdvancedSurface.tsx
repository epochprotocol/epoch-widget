import { MidenBridgePanel } from '../miden/MidenBridgePanel';
import { Code } from '../components/Code';

interface Props {
  api: string;
}

export function AdvancedSurface({ api }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="m-0 text-3xl font-[650] -tracking-tight text-fg">
          Advanced: Miden → EVM bridge
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-fg-secondary">
          Cross-VM intent flow (Miden testnet → EVM testnet).
        </p>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-fg-muted">
          This panel demonstrates an intent that originates on Miden and settles on an EVM chain.
          Most integrations don&apos;t need this — it&apos;s here to show that the same intent
          primitives extend beyond EVM-only flows. Allocator: <Code>{api}</Code>.
        </p>
      </header>
      <MidenBridgePanel />
    </div>
  );
}
