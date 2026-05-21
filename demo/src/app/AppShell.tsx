import type { ReactNode } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Row } from '../components/Row';

export function AppShell({ children }: { children: ReactNode }) {
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
          <ConnectButton />
        </Row>
      </header>
      {children}
    </div>
  );
}
