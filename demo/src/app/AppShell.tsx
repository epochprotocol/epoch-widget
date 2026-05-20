import type { ReactNode } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Row } from '../components/Row';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-demo-bg text-demo-text text-sm font-demo">
      <header className="sticky top-0 z-10 border-b border-demo-border bg-white/80 backdrop-blur-md">
        <Row className="mx-auto max-w-5xl justify-between px-6 py-4">
          <Row className="gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.625rem] bg-demo-accent text-[0.9375rem] font-bold text-white">
              E
            </div>
            <div>
              <div className="text-sm font-semibold">Epoch Intent Widget</div>
              <div className="text-xs text-demo-text-muted">Integration playground</div>
            </div>
          </Row>
          <ConnectButton />
        </Row>
      </header>
      {children}
    </div>
  );
}
