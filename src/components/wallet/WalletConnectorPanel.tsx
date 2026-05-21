import { useState } from 'react';
import { useConnect } from 'wagmi';
import { cn } from '../../lib/cn';
import type { EpochClassNames, EpochTheme } from '../../types';

export interface WalletConnectorPanelProps {
  theme?: 'light' | 'dark' | EpochTheme;
  classNames?: EpochClassNames;
}

/**
 * Lists all Wagmi-configured connectors so the user can pick one to connect.
 * Render only when no account is connected (parent handles gating).
 */
export function WalletConnectorPanel({ classNames: cs }: WalletConnectorPanelProps) {
  const { connectors, connect, isPending, error, reset } = useConnect();
  const [lastId, setLastId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2.5">
      <p className="m-0 text-[13px] leading-relaxed text-fg-muted">
        Choose a wallet to connect. Your app must wrap the widget in{' '}
        <code className="text-xs">WagmiProvider</code> with connectors configured (e.g. RainbowKit).
      </p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {connectors.map((connector) => {
          const busy = isPending && lastId === connector.id;
          return (
            <li key={connector.id}>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setLastId(connector.id);
                  reset();
                  connect({ connector });
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-sm border-0 bg-primary px-3.5 py-3 text-sm font-semibold text-white shadow-md transition-[background-color] duration-150 hover:bg-primary-hover',
                  'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary',
                  cs?.button,
                )}
              >
                {connector.icon ? (
                  <img
                    src={connector.icon}
                    alt=""
                    width={28}
                    height={28}
                    className="shrink-0 rounded-lg"
                  />
                ) : (
                  <span className="h-7 w-7 shrink-0 rounded-lg bg-surface" />
                )}
                <span className="flex-1 text-left">{connector.name}</span>
                {busy && (
                  <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin-epoch rounded-full border-2 border-white border-t-transparent" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {error && (
        <div
          role="alert"
          className="rounded-sm border border-line bg-surface px-2.5 py-2 text-[13px] text-error"
        >
          {error.message}
        </div>
      )}
    </div>
  );
}
