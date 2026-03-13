import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { EpochIntentWidget } from 'epoch-intent-widget';

// ---- Demo scenarios --------------------------------------------------------
// Edit these to try different intent configurations without touching the widget.

const SCENARIOS = {
  'Raffle – Buy Ticket (fixed output)': {
    requiredToken: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      decimals: 6,
    },
    requiredAmount: BigInt(5_000_000), // 5 USDC
    intentConfig: {
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
    title: 'Buy Raffle Ticket',
    description: 'Pay from any supported chain to buy 1 raffle ticket worth 5 USDC on Base.',
    submitButtonText: 'Buy Ticket',
  },
  'Generic Swap (variable input)': {
    requiredToken: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      decimals: 6,
    },
    requiredAmount: BigInt(10_000_000), // 10 USDC
    intentConfig: {
      protocol: 'my-dapp',
      action: 'deposit',
      extraDataTypestring: 'address vault',
      extraData: { vault: '0x0000000000000000000000000000000000000002' },
      fixedOutput: false,
      destinationChainId: 8453,
    },
    title: 'Deposit to Vault',
    description: 'Deposit 10 USDC into the vault from any supported chain.',
    submitButtonText: 'Deposit',
  },
  'Testnet (forced, no toggle)': {
    requiredToken: {
      address: '0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69',
      symbol: 'USDC',
      decimals: 18,
    },
    requiredAmount: BigInt('1000000000000000000'), // 1 USDC (18 dec)
    intentConfig: {
      protocol: 'test-protocol',
      action: 'test-action',
      fixedOutput: true,
      destinationTestnetChainId: 84532,
    },
    title: 'Testnet Intent',
    description: 'Always runs on testnet — no toggle shown.',
    submitButtonText: 'Send Test Intent',
    // testnet=true forces testnet mode and hides the toggle
    testnet: true,
    // Optional: override testnet RPC endpoints
    // testnetRpcUrls: { 84532: 'https://base-sepolia.g.alchemy.com/v2/YOUR_KEY' },
  },
  'Testnet (with toggle)': {
    requiredToken: {
      address: '0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69',
      symbol: 'USDC',
      decimals: 18,
    },
    requiredAmount: BigInt('1000000000000000000'),
    intentConfig: {
      protocol: 'test-protocol',
      action: 'test-action',
      fixedOutput: true,
      destinationTestnetChainId: 84532,
    },
    title: 'Testnet Intent (toggleable)',
    description: 'Starts on testnet but the user can switch to mainnet.',
    submitButtonText: 'Send Intent',
    enableTestnet: true,
    defaultTestnet: true,
  },
} as const;

type ScenarioKey = keyof typeof SCENARIOS;

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>(
    'Raffle – Buy Ticket (fixed output)',
  );
  const [log, setLog] = useState<string[]>([]);

  const scenario = SCENARIOS[activeScenario];

  const addLog = (msg: string) =>
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f3f4f6' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
            EpochIntentWidget Demo
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Testing the widget in isolation — no separate project needed.
          </p>
        </div>
        <ConnectButton />
      </div>

      {/* Scenario picker */}
      <div
        style={{
          background: '#fff',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>
          Choose a scenario
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveScenario(key)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1.5px solid',
                borderColor: activeScenario === key ? '#3b82f6' : '#d1d5db',
                backgroundColor: activeScenario === key ? '#eff6ff' : '#fff',
                color: activeScenario === key ? '#1d4ed8' : '#374151',
                fontWeight: activeScenario === key ? 600 : 400,
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Active scenario details */}
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            fontSize: '0.8125rem',
            color: '#374151',
          }}
        >
          <strong>Title:</strong> {scenario.title} &nbsp;·&nbsp;
          <strong>Token:</strong> {scenario.requiredToken.symbol} &nbsp;·&nbsp;
          <strong>Amount:</strong>{' '}
          {(Number(scenario.requiredAmount) / 10 ** scenario.requiredToken.decimals).toFixed(2)}{' '}
          {scenario.requiredToken.symbol} &nbsp;·&nbsp;
          <strong>Protocol:</strong> {scenario.intentConfig.protocol} /&nbsp;
          {scenario.intentConfig.action}
        </div>
      </div>

      {/* Open widget button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => {
            setIsOpen(true);
            addLog(`Opened widget: "${activeScenario}"`);
          }}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Open Widget
        </button>
      </div>

      {/* Event log */}
      {log.length > 0 && (
        <div
          style={{
            background: '#111827',
            borderRadius: '0.75rem',
            padding: '1rem 1.25rem',
            maxHeight: '16rem',
            overflowY: 'auto',
          }}
        >
          <p
            style={{
              color: '#9ca3af',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Event Log
          </p>
          {log.map((entry, i) => (
            <p key={i} style={{ color: '#d1fae5', fontSize: '0.8125rem', lineHeight: 1.6, fontFamily: 'monospace' }}>
              {entry}
            </p>
          ))}
        </div>
      )}

      {/* The widget */}
      <EpochIntentWidget
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          addLog('Widget closed');
        }}
        apiBaseUrl="http://0.0.0.0:3000"
        requiredToken={scenario.requiredToken}
        requiredAmount={scenario.requiredAmount}
        intentConfig={scenario.intentConfig}
        title={scenario.title}
        description={scenario.description}
        submitButtonText={scenario.submitButtonText}
        destinationChainName="Base"
        testnet={'testnet' in scenario ? (scenario as any).testnet : false}
        enableTestnet={'enableTestnet' in scenario ? (scenario as any).enableTestnet : false}
        defaultTestnet={'defaultTestnet' in scenario ? (scenario as any).defaultTestnet : false}
        testnetRpcUrls={'testnetRpcUrls' in scenario ? (scenario as any).testnetRpcUrls : undefined}
        onIntentSent={({ nonce }) => addLog(`Intent sent — nonce: ${nonce}`)}
        onIntentComplete={({ nonce, status }) =>
          addLog(`Intent complete — nonce: ${nonce}, status: ${JSON.stringify(status)}`)
        }
        onError={(err) => addLog(`Error: ${err.message}`)}
      />
    </div>
  );
}
