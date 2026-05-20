import { PAY_SCENARIOS } from '../pay/scenarios';
import type { ScenarioProps } from '../pay/scenarios';
import { fmtAmount } from '../lib/format';

export function PayPreview({
  scenarioId,
  onOpenWidget,
}: {
  scenarioId: string;
  onOpenWidget: (props: ScenarioProps, label: string) => void;
}) {
  const scenario = PAY_SCENARIOS.find((s) => s.id === scenarioId) ?? PAY_SCENARIOS[0];
  const intent = scenario.props.intent;
  const required = intent
    ? `${fmtAmount(intent.requiredAmount, intent.requiredToken.decimals)} ${intent.requiredToken.symbol}`
    : `${scenario.props.toAmount ?? '—'} ${scenario.props.toTokenSymbol ?? ''}`;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="m-0 text-base font-bold tracking-tight text-demo-text">Pay</h2>
        <button
          type="button"
          className="cursor-pointer rounded-xl bg-demo-accent px-[0.9rem] py-2 text-sm font-[650] text-white"
          onClick={() => onOpenWidget(scenario.props, scenario.name)}
        >
          Open →
        </button>
      </div>

      <div className="rounded-2xl border border-demo-border bg-white px-3.5 py-3.5">
        <div className="font-bold text-demo-text">{scenario.name}</div>
        <div className="mt-1 text-xs leading-normal text-demo-text-muted">{scenario.tagline}</div>

        <div className="mt-3 grid gap-2">
          <PreviewRow label="You receive" value={required} />
          {intent ? (
            <>
              <PreviewRow label="Destination" value={intent.destinationChainName ?? '—'} />
              <PreviewRow label="Protocol" value={intent.config.protocol} />
              <PreviewRow label="Action" value={intent.config.action} />
            </>
          ) : (
            <>
              <PreviewRow label="To address" value={scenario.props.toAddress ?? '—'} />
              <PreviewRow label="Chain ID" value={String(scenario.props.toChainId ?? '—')} />
              <PreviewRow label="Token" value={scenario.props.toToken ?? '—'} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <div className="text-[11px] font-bold uppercase text-demo-text-faint">{label}</div>
      <div className="text-right text-xs font-semibold text-demo-text">{value}</div>
    </div>
  );
}
