import { useState, type CSSProperties, type ReactNode } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { EpochIntentWidget } from 'epoch-intent-widget';
import type { EpochIntentWidgetProps } from 'epoch-intent-widget';

// ---------------------------------------------------------------------------
// Demo scenarios
// ---------------------------------------------------------------------------

type ScenarioProps = Omit<EpochIntentWidgetProps, 'isOpen' | 'onClose' | 'api'>;

interface Scenario {
  id: string;
  name: string;
  tagline: string;
  props: ScenarioProps;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'raffle-mainnet',
    name: 'Raffle Ticket',
    tagline: 'Fixed-output intent on Base mainnet',
    props: {
      title: 'Buy Raffle Ticket',
      submitButtonText: 'Buy Ticket',
      intent: {
        requiredToken: {
          address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          symbol: 'USDC',
          decimals: 6,
        },
        requiredAmount: BigInt(5_000_000),
        destinationChainName: 'Base',
        config: {
          protocol: 'raffles',
          action: 'buyTicket',
          extraDataTypestring: 'address raffleAddress,uint256 numberOfTickets',
          extraData: {
            raffleAddress: '0x0000000000000000000000000000000000000001',
            numberOfTickets: '1',
          },
          fixedOutput: true,
          destinationChainId: 8453,
        },
      },
    },
  },
  {
    id: 'vault-deposit',
    name: 'Vault Deposit',
    tagline: 'Variable-input swap into a vault',
    props: {
      title: 'Deposit to Vault',
      submitButtonText: 'Deposit',
      intent: {
        requiredToken: {
          address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          symbol: 'USDC',
          decimals: 6,
        },
        requiredAmount: BigInt(10_000_000),
        destinationChainName: 'Base',
        config: {
          protocol: 'my-dapp',
          action: 'deposit',
          extraDataTypestring: 'address vault',
          extraData: { vault: '0x0000000000000000000000000000000000000002' },
          fixedOutput: false,
          destinationChainId: 8453,
        },
      },
    },
  },
  {
    id: 'testnet-locked',
    name: 'Testnet (locked)',
    tagline: 'Forced testnet, hide toggle',
    props: {
      title: 'Testnet Raffle',
      submitButtonText: 'Buy Ticket',
      network: 'testnet',
      allowNetworkToggle: false,
      intent: {
        requiredToken: {
          address: '0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69',
          symbol: 'USDC',
          decimals: 18,
        },
        requiredAmount: BigInt('1000000000000000000'),
        destinationChainName: 'Base Sepolia',
        config: {
          protocol: 'raffles',
          action: 'buyTicket',
          extraDataTypestring: 'address raffleAddress,uint256 numberOfTickets',
          extraData: {
            raffleAddress: '0x0000000000000000000000000000000000000001',
            numberOfTickets: '1',
          },
          fixedOutput: true,
          destinationTestnetChainId: 84532,
        },
      },
    },
  },
  {
    id: 'testnet-toggle',
    name: 'Testnet (toggleable)',
    tagline: 'Starts on testnet, user can switch',
    props: {
      title: 'Raffle (toggleable)',
      submitButtonText: 'Buy Ticket',
      network: 'testnet',
      allowNetworkToggle: true,
      intent: {
        requiredToken: {
          address: '0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69',
          symbol: 'USDC',
          decimals: 18,
        },
        requiredAmount: BigInt('1000000000000000000'),
        destinationChainName: 'Base Sepolia',
        config: {
          protocol: 'raffles',
          action: 'buyTicket',
          extraDataTypestring: 'address raffleAddress,uint256 numberOfTickets',
          extraData: {
            raffleAddress: '0x0000000000000000000000000000000000000001',
            numberOfTickets: '1',
          },
          fixedOutput: true,
          destinationTestnetChainId: 84532,
        },
      },
    },
  },
];

const API_BASE_URL =
  (import.meta as unknown as { env?: { VITE_EPOCH_API_BASE_URL?: string } }).env
    ?.VITE_EPOCH_API_BASE_URL ?? 'http://0.0.0.0:3000';

// ---------------------------------------------------------------------------
// Page palette (demo shell only — widget has its own theming)
// ---------------------------------------------------------------------------

const C = {
  bg: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  borderActive: '#3b82f6',
  ringActive: 'rgba(59, 130, 246, 0.15)',
  text: '#0f172a',
  textMuted: '#64748b',
  textFaint: '#94a3b8',
  accent: '#0f172a',
  accentHover: '#1e293b',
  badgeBg: '#f1f5f9',
  badgeText: '#475569',
  badgeAmberBg: '#fef3c7',
  badgeAmberText: '#92400e',
  badgeVioletBg: '#ede9fe',
  badgeVioletText: '#5b21b6',
  logBg: '#0f172a',
  logSlate: '#cbd5e1',
  logMuted: '#64748b',
  logOk: '#6ee7b7',
  logErr: '#fca5a5',
};

const FONT =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

interface LogEntry {
  ts: Date;
  level: 'info' | 'success' | 'error';
  msg: string;
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState(SCENARIOS[0].id);
  const [log, setLog] = useState<LogEntry[]>([]);

  const scenario = SCENARIOS.find((s) => s.id === activeId) ?? SCENARIOS[0];

  const addLog = (level: LogEntry['level'], msg: string) =>
    setLog((prev) => [{ ts: new Date(), level, msg }, ...prev].slice(0, 30));

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: C.bg,
        color: C.text,
        fontFamily: FONT,
        fontSize: '14px',
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Row
          style={{
            maxWidth: '64rem',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            justifyContent: 'space-between',
          }}
        >
          <Row style={{ gap: '0.75rem' }}>
            <div
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '0.625rem',
                backgroundColor: C.accent,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9375rem',
              }}
            >
              E
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Epoch Intent Widget
              </div>
              <div style={{ fontSize: '0.75rem', color: C.textMuted }}>
                Integration playground
              </div>
            </div>
          </Row>
          <ConnectButton />
        </Row>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '64rem', margin: '0 auto', padding: '2.5rem 1.5rem 3rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '1.875rem',
              fontWeight: 650,
              letterSpacing: '-0.02em',
            }}
          >
            Try the widget in isolation
          </h1>
          <p
            style={{
              marginTop: '0.5rem',
              maxWidth: '42rem',
              fontSize: '0.875rem',
              color: C.textMuted,
              lineHeight: 1.6,
            }}
          >
            Pick a scenario and open the dialog to see how consumers integrate
            the <Code>EpochIntentWidget</Code> component. API:&nbsp;
            <Code>{API_BASE_URL}</Code>
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'minmax(0, 1fr) 20rem',
          }}
        >
          {/* Scenario column */}
          <section>
            <SectionLabel>Scenarios</SectionLabel>
            <div
              style={{
                display: 'grid',
                gap: '0.75rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
              }}
            >
              {SCENARIOS.map((sc) => (
                <ScenarioCard
                  key={sc.id}
                  scenario={sc}
                  active={activeId === sc.id}
                  onSelect={() => setActiveId(sc.id)}
                />
              ))}
            </div>

            {/* Selected scenario detail */}
            <div
              style={{
                marginTop: '1.5rem',
                borderRadius: '0.875rem',
                border: `1px solid ${C.border}`,
                backgroundColor: C.surface,
                padding: '1.25rem 1.375rem',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
              }}
            >
              <Row style={{ justifyContent: 'space-between' }}>
                <div>
                  <SectionLabel style={{ marginBottom: '0.125rem' }}>Selected</SectionLabel>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{scenario.name}</div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(true);
                    addLog('info', `Opened widget: ${scenario.name}`);
                  }}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    padding: '0.625rem 1.125rem',
                    borderRadius: '0.5rem',
                    backgroundColor: C.accent,
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    boxShadow: '0 1px 2px rgba(15,23,42,0.1)',
                    transition: 'background 0.15s, transform 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = C.accentHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = C.accent;
                  }}
                >
                  Open widget →
                </button>
              </Row>

              <div
                style={{
                  marginTop: '1rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                }}
              >
                <Detail
                  label="Required"
                  value={`${fmtAmount(
                    scenario.props.intent.requiredAmount,
                    scenario.props.intent.requiredToken.decimals,
                  )} ${scenario.props.intent.requiredToken.symbol}`}
                />
                <Detail label="Destination" value={scenario.props.intent.destinationChainName ?? '—'} />
                <Detail label="Protocol" value={scenario.props.intent.config.protocol} />
                <Detail label="Action" value={scenario.props.intent.config.action} />
              </div>
            </div>
          </section>

          {/* Event log */}
          <aside>
            <SectionLabel>Event Log</SectionLabel>
            <div
              style={{
                borderRadius: '0.875rem',
                border: `1px solid ${C.border}`,
                backgroundColor: C.logBg,
                padding: '1rem 1.125rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.75rem',
                minHeight: '16rem',
                maxHeight: '28rem',
                overflowY: 'auto',
              }}
            >
              {log.length === 0 ? (
                <div style={{ padding: '1.5rem 0', textAlign: 'center', color: C.logMuted }}>
                  Events will appear here once you interact with the widget.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {log.map((entry, i) => (
                    <LogLine key={i} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* The widget under test */}
      <EpochIntentWidget
        {...scenario.props}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          addLog('info', 'Widget closed');
        }}
        api={{ baseUrl: API_BASE_URL }}
        onIntentSent={({ nonce }) => addLog('info', `Intent sent — nonce ${shorten(nonce)}`)}
        onIntentComplete={({ nonce }) =>
          addLog('success', `Intent complete — nonce ${shorten(nonce)}`)
        }
        onError={(err) => addLog('error', err.message)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function ScenarioCard({
  scenario,
  active,
  onSelect,
}: {
  scenario: Scenario;
  active: boolean;
  onSelect: () => void;
}) {
  const baseStyle: CSSProperties = {
    all: 'unset',
    display: 'block',
    cursor: 'pointer',
    padding: '1rem 1.125rem',
    borderRadius: '0.875rem',
    border: `1px solid ${active ? C.borderActive : C.border}`,
    backgroundColor: C.surface,
    boxShadow: active
      ? `0 0 0 3px ${C.ringActive}, 0 1px 2px rgba(15,23,42,0.04)`
      : '0 1px 2px rgba(15,23,42,0.04)',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <button style={baseStyle} onClick={onSelect}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{scenario.name}</div>
        {active && (
          <span
            style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              fontSize: '0.625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Active
          </span>
        )}
      </Row>
      <div
        style={{
          marginTop: '0.25rem',
          fontSize: '0.75rem',
          color: C.textMuted,
          lineHeight: 1.5,
        }}
      >
        {scenario.tagline}
      </div>
      <Row style={{ marginTop: '0.75rem', gap: '0.375rem', flexWrap: 'wrap' }}>
        <Badge>{scenario.props.intent.config.protocol}</Badge>
        <Badge>{scenario.props.intent.config.action}</Badge>
        {scenario.props.network === 'testnet' && <Badge tone="amber">testnet</Badge>}
        {scenario.props.intent.config.fixedOutput && <Badge tone="violet">fixed-output</Badge>}
      </Row>
    </button>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  const color =
    entry.level === 'success' ? C.logOk : entry.level === 'error' ? C.logErr : C.logSlate;
  return (
    <div style={{ display: 'flex', gap: '0.5rem', lineHeight: 1.5 }}>
      <span style={{ flexShrink: 0, color: C.logMuted }}>
        {entry.ts.toLocaleTimeString([], { hour12: false })}
      </span>
      <span style={{ color, wordBreak: 'break-word' }}>{entry.msg}</span>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: '0.625rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: C.textFaint,
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: '0.125rem', fontWeight: 500, color: C.text }}>{value}</div>
    </div>
  );
}

function Badge({
  children,
  tone = 'slate',
}: {
  children: ReactNode;
  tone?: 'slate' | 'amber' | 'violet';
}) {
  const palette =
    tone === 'amber'
      ? { bg: C.badgeAmberBg, fg: C.badgeAmberText }
      : tone === 'violet'
        ? { bg: C.badgeVioletBg, fg: C.badgeVioletText }
        : { bg: C.badgeBg, fg: C.badgeText };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.125rem 0.4375rem',
        borderRadius: '0.375rem',
        fontSize: '0.6875rem',
        fontWeight: 500,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        backgroundColor: palette.bg,
        color: palette.fg,
      }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <h2
      style={{
        margin: 0,
        marginBottom: '0.75rem',
        fontSize: '0.6875rem',
        fontWeight: 700,
        color: C.textFaint,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '0.8125rem',
        padding: '0.0625rem 0.3125rem',
        borderRadius: '0.25rem',
        backgroundColor: '#e2e8f0',
        color: '#0f172a',
      }}
    >
      {children}
    </code>
  );
}

function Row({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', ...style }}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtAmount(amount: bigint, decimals: number): string {
  return (Number(amount) / 10 ** decimals).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });
}

function shorten(s: string): string {
  if (s.length <= 12) return s;
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}
