import type { DemoSurface } from '../types/surface';
import { Accordion } from './Accordion';

export interface BuilderState {
  surface: DemoSurface;
  payScenarioId: string;
}

export function SettingsPanel({
  state,
  onChange,
  onReset,
}: {
  state: BuilderState;
  onChange: (next: BuilderState) => void;
  onReset: () => void;
}) {
  const setSurface = (surface: DemoSurface) => onChange({ ...state, surface });

  return (
    <aside className="h-[calc(100vh-73px)] w-[360px] shrink-0 overflow-y-auto border-r border-demo-border bg-demo-surface p-5">
      <div className="mb-5">
        <div className="mb-2 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-demo-text-faint">Mode</div>
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-demo-border bg-demo-bg p-2">
          <button
            type="button"
            className={[
              'cursor-pointer rounded-lg px-2 py-1.5 text-center text-[0.8125rem] font-semibold transition-colors',
              state.surface === 'pay' ? 'bg-demo-accent text-white' : 'bg-transparent text-demo-text-muted',
            ].join(' ')}
            onClick={() => setSurface('pay')}
          >
            Pay
          </button>
          <button
            type="button"
            className={[
              'cursor-pointer rounded-lg px-2 py-1.5 text-center text-[0.8125rem] font-semibold transition-colors',
              state.surface === 'swap' ? 'bg-demo-accent text-white' : 'bg-transparent text-demo-text-muted',
            ].join(' ')}
            onClick={() => setSurface('swap')}
          >
            Swap
          </button>
          <button
            type="button"
            className={[
              'cursor-pointer rounded-lg px-2 py-1.5 text-center text-[0.8125rem] font-semibold transition-colors',
              state.surface === 'earn' ? 'bg-demo-accent text-white' : 'bg-transparent text-demo-text-muted',
            ].join(' ')}
            onClick={() => setSurface('earn')}
          >
            Earn
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Accordion title="Edit Fields" defaultOpen={false}>
          <div className="text-[0.8125rem] leading-relaxed text-demo-text-muted">
            Coming next: tweak widget props (title, button text, fixed/variable output, destination chain).
          </div>
        </Accordion>
        <Accordion title="Origin Token Preselection" defaultOpen={false}>
          <div className="text-[0.8125rem] leading-relaxed text-demo-text-muted">
            Coming next: pick default source chain/token for the widget preview.
          </div>
        </Accordion>
        <Accordion title="Gas & Wallet Settings" defaultOpen={false}>
          <div className="text-[0.8125rem] leading-relaxed text-demo-text-muted">
            Coming next: simulate wrong-network states and balance edge cases.
          </div>
        </Accordion>
        <Accordion title="UI & Interaction Settings" defaultOpen={false}>
          <div className="text-[0.8125rem] leading-relaxed text-demo-text-muted">
            Coming next: override widget <code className="font-mono">classNames</code> and interaction toggles.
          </div>
        </Accordion>
        <Accordion title="Custom Theme" defaultOpen={false}>
          <div className="text-[0.8125rem] leading-relaxed text-demo-text-muted">
            Coming next: live-edit theme tokens and see the widget update.
          </div>
        </Accordion>
        <Accordion title="Advanced Settings" defaultOpen={false}>
          <div className="text-[0.8125rem] leading-relaxed text-demo-text-muted">
            Coming next: experimental flags and debug options.
          </div>
        </Accordion>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 w-full cursor-pointer rounded-xl border border-demo-border bg-white px-3 py-2.5 font-semibold text-demo-text"
      >
        Reset all settings
      </button>
    </aside>
  );
}
