import type { ReactNode } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SegmentedTabs } from '@epoch-protocol/epoch-intent-widget';
import { Row } from '../components/Row';

export type DemoNetwork = 'mainnet' | 'testnet';

const NETWORK_TABS = [
  { value: 'mainnet' as const, label: 'Mainnet' },
  { value: 'testnet' as const, label: 'Testnet' },
];

interface Props {
  children: ReactNode;
  network: DemoNetwork;
  onNetworkChange: (n: DemoNetwork) => void;
}

export function AppShell({ children, network, onNetworkChange }: Props) {
  return (
    <div className="min-h-screen bg-canvas text-fg text-sm font-sans">
      <header className="sticky top-0 z-10 border-b border-line bg-canvas/85 backdrop-blur-md">
        <Row className="mx-auto max-w-6xl justify-between px-6 py-4">
          <Row className="gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-[0.9375rem] font-bold text-white">
              E
            </div>
            <div>
              <div className="text-sm font-semibold text-fg">Epoch Intent Widget</div>
              <div className="text-xs text-fg-muted">Integration playground</div>
            </div>
          </Row>
          <Row className="gap-3">
            <SegmentedTabs<DemoNetwork>
              tabs={NETWORK_TABS}
              value={network}
              onChange={onNetworkChange}
              size="sm"
            />
            <ConnectButton />
          </Row>
        </Row>
      </header>
      {children}
    </div>
  );
}
