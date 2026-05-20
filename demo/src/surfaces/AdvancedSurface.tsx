import { MidenBridgePanel } from '../miden/MidenBridgePanel';
import { getApiBaseUrl } from '../lib/apiBaseUrl';
import { Code } from '../components/Code';

export function AdvancedSurface() {
  const api = getApiBaseUrl();
  return (
    <>
      <div className="mb-8">
        <h1 className="m-0 text-3xl font-[650] tracking-tight">Advanced</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-demo-text-muted">
          Miden → EVM bridge (same flow as miden-integration-example). Not required for typical business integrations.
          Allocator: <Code>{api}</Code>
        </p>
      </div>
      <MidenBridgePanel />
    </>
  );
}
