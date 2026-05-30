import { useEffect, useState } from 'react';
import type { ScenarioProps } from '../pay/scenarios';
import { SWAP_SCENARIOS, SWAP_TESTNET_SCENARIOS } from '../pay/scenarios';
import { EditableField } from '../components/EditableField';
import { SectionLabel } from '../components/SectionLabel';
import { Row } from '../components/Row';
import type { DemoNetwork } from '../app/AppShell';

interface Props {
  apiBaseUrl: string;
  onOpenWidget: (props: ScenarioProps) => void;
  network: DemoNetwork;
}

interface IntentEdits {
  requiredAmount: string;
  destinationChainId: string;
  destinationChainName: string;
  requiredTokenAddress: string;
  requiredTokenSymbol: string;
  requiredTokenDecimals: string;
}

function editsFromScenario(props: ScenarioProps): IntentEdits {
  const intent = props.intent;
  if (!intent) {
    return {
      requiredAmount: '',
      destinationChainId: '',
      destinationChainName: '',
      requiredTokenAddress: '',
      requiredTokenSymbol: '',
      requiredTokenDecimals: '',
    };
  }
  return {
    requiredAmount: intent.requiredAmount.toString(),
    destinationChainId: String(intent.config.destinationChainId ?? ''),
    destinationChainName: intent.destinationChainName ?? '',
    requiredTokenAddress: intent.requiredToken.address,
    requiredTokenSymbol: intent.requiredToken.symbol,
    requiredTokenDecimals: String(intent.requiredToken.decimals),
  };
}

function applyEdits(props: ScenarioProps, edits: IntentEdits): ScenarioProps {
  if (!props.intent) return props;
  const t = props.intent.requiredToken;
  let nextAmount = props.intent.requiredAmount;
  const trimmed = edits.requiredAmount.trim();
  if (trimmed) {
    try {
      nextAmount = BigInt(trimmed);
    } catch {
      // keep default
    }
  }
  return {
    ...props,
    intent: {
      ...props.intent,
      requiredAmount: nextAmount,
      destinationChainName:
        edits.destinationChainName.trim() || props.intent.destinationChainName,
      requiredToken: {
        ...t,
        address: edits.requiredTokenAddress.trim()
          ? (edits.requiredTokenAddress.trim() as `0x${string}`)
          : t.address,
        symbol: edits.requiredTokenSymbol.trim() || t.symbol,
        decimals: edits.requiredTokenDecimals.trim()
          ? Number(edits.requiredTokenDecimals)
          : t.decimals,
      },
      config: {
        ...props.intent.config,
        destinationChainId: edits.destinationChainId.trim()
          ? Number(edits.destinationChainId)
          : props.intent.config.destinationChainId,
      },
    },
  };
}

export function SwapSurface({ onOpenWidget, network }: Props) {
  const scenarios = network === 'testnet' ? SWAP_TESTNET_SCENARIOS : SWAP_SCENARIOS;
  const scenario = scenarios[0];
  const [edits, setEdits] = useState<IntentEdits>(() => editsFromScenario(scenario.props));

  useEffect(() => {
    setEdits(editsFromScenario(scenario.props));
  }, [scenario.id, scenario.props]);

  const setField = <K extends keyof IntentEdits>(key: K, value: string) => {
    setEdits((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpen = () => onOpenWidget(applyEdits(scenario.props, edits));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="m-0 text-3xl font-[650] -tracking-tight text-fg">Swap</h1>
      </header>

      <section className="flex flex-col rounded-md border border-line bg-surface p-5 shadow-sm">
        <Row className="justify-between">
          <div>
            <SectionLabel className="mb-0.5">Customize {scenario.name}</SectionLabel>
            <p className="m-0 mt-1 text-[12px] leading-relaxed text-fg-muted">
              {scenario.tagline}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpen}
            className="cursor-pointer rounded-md border-0 bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Open widget →
          </button>
        </Row>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <EditableField
            label="Required amount (raw)"
            value={edits.requiredAmount}
            placeholder="1000000"
            inputMode="numeric"
            hint="Atomic units, not decimal"
            onChange={(v) => setField('requiredAmount', v)}
          />
          <EditableField
            label="Destination chain ID"
            value={edits.destinationChainId}
            placeholder="8453"
            inputMode="numeric"
            onChange={(v) => setField('destinationChainId', v)}
          />
          <EditableField
            label="Destination chain name"
            value={edits.destinationChainName}
            placeholder="Base"
            onChange={(v) => setField('destinationChainName', v)}
          />
          <EditableField
            label="Required token address"
            value={edits.requiredTokenAddress}
            placeholder="0x…"
            onChange={(v) => setField('requiredTokenAddress', v)}
          />
          <EditableField
            label="Required token symbol"
            value={edits.requiredTokenSymbol}
            placeholder="USDC"
            onChange={(v) => setField('requiredTokenSymbol', v)}
          />
          <EditableField
            label="Required token decimals"
            value={edits.requiredTokenDecimals}
            placeholder="6"
            inputMode="numeric"
            onChange={(v) => setField('requiredTokenDecimals', v)}
          />
        </div>
      </section>
    </div>
  );
}
