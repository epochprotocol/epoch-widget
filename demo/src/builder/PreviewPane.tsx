import type { DemoSurface } from '../types/surface';
import type { ScenarioProps } from '../pay/scenarios';
import { PhoneFrame } from './PhoneFrame';
import { PaySurface } from '../surfaces/PaySurface';
import { EarnSurface } from '../surfaces/EarnSurface';
import { SwapSurface } from '../surfaces/SwapSurface';
import type { LogEntry } from '../app/log';

export function PreviewPane({
  surface,
  apiBaseUrl,
  log,
  onOpenWidget,
  payScenarioId,
}: {
  surface: DemoSurface;
  apiBaseUrl: string;
  log: LogEntry[];
  onOpenWidget: (props: ScenarioProps, label: string) => void;
  payScenarioId: string;
}) {
  return (
    <section className="h-[calc(100vh-73px)] min-w-0 flex-1 overflow-y-auto px-6 py-5">
      <div className="mb-4 flex justify-center gap-5 text-[0.8125rem] text-demo-text-muted">
        <span className="rounded-full border border-demo-border-active bg-blue-500/[0.06] px-3 py-1.5 font-semibold text-demo-text">
          Widget
        </span>
        <span className="rounded-full border border-demo-border bg-white px-3 py-1.5 font-semibold text-demo-text-muted">
          SDK Sandbox
        </span>
      </div>

      <div className="min-h-[560px] rounded-2xl border border-demo-border bg-[length:14px_14px] bg-demo-surface bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] p-8">
        <PhoneFrame>
          {surface === 'pay' && (
            <PaySurface
              apiBaseUrl={apiBaseUrl}
              log={log}
              onOpenWidget={onOpenWidget}
              scenarioId={payScenarioId}
              hideScenarioGrid
              hideEventLog
            />
          )}
          {surface === 'earn' && <EarnSurface apiBaseUrl={apiBaseUrl} onOpenWidget={onOpenWidget} />}
          {surface === 'swap' && <SwapSurface apiBaseUrl={apiBaseUrl} onOpenWidget={onOpenWidget} />}
        </PhoneFrame>
      </div>
    </section>
  );
}
