import { useEffect, useState } from 'react';
import { PAY_SCENARIOS, PAY_TESTNET_SCENARIOS } from '../pay/scenarios';
import type { ScenarioProps } from '../pay/scenarios';
import { SectionLabel } from '../components/SectionLabel';
import { ScenarioCard } from '../components/ScenarioCard';
import { Row } from '../components/Row';
import { EditableField } from '../components/EditableField';
import type { DemoNetwork } from '../app/AppShell';

interface Props {
  apiBaseUrl: string;
  scenarioId: string;
  onChangeScenario: (id: string) => void;
  onOpenWidget: (props: ScenarioProps) => void;
  network: DemoNetwork;
}

interface FlatEdits {
  shape: 'flat';
  toAddress: string;
  toAmount: string;
  toChainId: string;
  toToken: string;
  toTokenSymbol: string;
}

interface IntentEdits {
  shape: 'intent';
  requiredAmount: string;
  destinationChainId: string;
  destinationChainName: string;
  requiredTokenAddress: string;
  requiredTokenSymbol: string;
  requiredTokenDecimals: string;
}

type Edits = FlatEdits | IntentEdits;

function editsFromScenario(props: ScenarioProps): Edits {
  if (props.intent) {
    const t = props.intent.requiredToken;
    return {
      shape: 'intent',
      requiredAmount: props.intent.requiredAmount.toString(),
      destinationChainId: String(props.intent.config.destinationChainId ?? ''),
      destinationChainName: props.intent.destinationChainName ?? '',
      requiredTokenAddress: t.address,
      requiredTokenSymbol: t.symbol,
      requiredTokenDecimals: String(t.decimals),
    };
  }
  return {
    shape: 'flat',
    toAddress: props.toAddress ?? '',
    toAmount: props.toAmount ?? '',
    toChainId: String(props.toChainId ?? ''),
    toToken: props.toToken ?? '',
    toTokenSymbol: props.toTokenSymbol ?? '',
  };
}

function applyEdits(props: ScenarioProps, edits: Edits): ScenarioProps {
  if (edits.shape === 'flat') {
    const addressTrim = edits.toAddress.trim();
    const tokenTrim = edits.toToken.trim();
    return {
      ...props,
      toAddress: addressTrim ? (addressTrim as `0x${string}`) : props.toAddress,
      toAmount: edits.toAmount.trim() || props.toAmount,
      toChainId: edits.toChainId.trim() ? Number(edits.toChainId) : props.toChainId,
      toToken: tokenTrim ? (tokenTrim as `0x${string}`) : props.toToken,
      toTokenSymbol: edits.toTokenSymbol.trim() || props.toTokenSymbol,
    };
  }
  if (!props.intent) return props;
  const t = props.intent.requiredToken;
  // Parse amount as bigint when valid; fall back to scenario default otherwise.
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
      destinationChainName: edits.destinationChainName.trim() || props.intent.destinationChainName,
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

export function PaySurface({ scenarioId, onChangeScenario, onOpenWidget, network }: Props) {
  const scenarios = network === 'testnet' ? PAY_TESTNET_SCENARIOS : PAY_SCENARIOS;
  const scenario = scenarios.find((s) => s.id === scenarioId) ?? scenarios[0];

  const [edits, setEdits] = useState<Edits>(() => editsFromScenario(scenario.props));

  useEffect(() => {
    setEdits(editsFromScenario(scenario.props));
  }, [scenario.id, scenario.props]);

  const setFlat = <K extends keyof FlatEdits>(key: K, value: string) => {
    setEdits((prev) =>
      prev.shape === 'flat' ? ({ ...prev, [key]: value } as FlatEdits) : prev,
    );
  };
  const setIntent = <K extends keyof IntentEdits>(key: K, value: string) => {
    setEdits((prev) =>
      prev.shape === 'intent' ? ({ ...prev, [key]: value } as IntentEdits) : prev,
    );
  };

  const handleOpen = () => onOpenWidget(applyEdits(scenario.props, edits));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="m-0 text-3xl font-[650] -tracking-tight text-fg">Pay</h1>
      </header>

      <section>
        <SectionLabel>Scenarios</SectionLabel>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3">
          {scenarios.map((sc) => (
            <ScenarioCard
              key={sc.id}
              scenario={sc}
              active={scenarioId === sc.id}
              onSelect={() => onChangeScenario(sc.id)}
            />
          ))}
        </div>

        <div className="mt-6 rounded-md border border-line bg-surface p-5 shadow-sm">
          <Row className="justify-between">
            <div>
              <SectionLabel className="mb-0.5">Customize {scenario.name}</SectionLabel>
              <div className="text-[12px] text-fg-muted">
                Edit any field before opening the widget. Blank fields fall back to scenario defaults.
              </div>
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
            {edits.shape === 'flat' ? (
              <>
                <EditableField
                  label="To address"
                  value={edits.toAddress}
                  placeholder="0x…"
                  onChange={(v) => setFlat('toAddress', v)}
                />
                <EditableField
                  label="Amount"
                  value={edits.toAmount}
                  placeholder="0.15"
                  onChange={(v) => setFlat('toAmount', v)}
                />
                <EditableField
                  label="Chain ID"
                  value={edits.toChainId}
                  placeholder="8453"
                  inputMode="numeric"
                  onChange={(v) => setFlat('toChainId', v)}
                />
                <EditableField
                  label="Token address"
                  value={edits.toToken}
                  placeholder="0x…"
                  onChange={(v) => setFlat('toToken', v)}
                />
                <EditableField
                  label="Token symbol"
                  value={edits.toTokenSymbol}
                  placeholder="USDC"
                  onChange={(v) => setFlat('toTokenSymbol', v)}
                />
              </>
            ) : (
              <>
                <EditableField
                  label="Required amount (raw)"
                  value={edits.requiredAmount}
                  placeholder="5000000"
                  inputMode="numeric"
                  hint="Atomic units, not decimal"
                  onChange={(v) => setIntent('requiredAmount', v)}
                />
                <EditableField
                  label="Destination chain ID"
                  value={edits.destinationChainId}
                  placeholder="8453"
                  inputMode="numeric"
                  onChange={(v) => setIntent('destinationChainId', v)}
                />
                <EditableField
                  label="Destination chain name"
                  value={edits.destinationChainName}
                  placeholder="Base"
                  onChange={(v) => setIntent('destinationChainName', v)}
                />
                <EditableField
                  label="Required token address"
                  value={edits.requiredTokenAddress}
                  placeholder="0x…"
                  onChange={(v) => setIntent('requiredTokenAddress', v)}
                />
                <EditableField
                  label="Required token symbol"
                  value={edits.requiredTokenSymbol}
                  placeholder="USDC"
                  onChange={(v) => setIntent('requiredTokenSymbol', v)}
                />
                <EditableField
                  label="Required token decimals"
                  value={edits.requiredTokenDecimals}
                  placeholder="6"
                  inputMode="numeric"
                  onChange={(v) => setIntent('requiredTokenDecimals', v)}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
