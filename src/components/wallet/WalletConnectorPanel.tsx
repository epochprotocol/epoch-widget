import { useState } from 'react';
import { useConnect } from 'wagmi';
import { s } from '../../styles';
import { t } from '../../theme';
import type { EpochClassNames, EpochTheme } from '../../types';

export interface WalletConnectorPanelProps {
  theme?: 'light' | 'dark' | EpochTheme;
  classNames?: EpochClassNames;
}

/**
 * Lists all Wagmi-configured connectors so the user can pick one to connect.
 * Render only when no account is connected (parent handles gating).
 */
export function WalletConnectorPanel({ classNames: cn }: WalletConnectorPanelProps) {
  const { connectors, connect, isPending, error, reset } = useConnect();
  const [lastId, setLastId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={{ margin: 0, fontSize: '13px', color: t.textMuted, lineHeight: 1.5 }}>
        Choose a wallet to connect. Your app must wrap the widget in <code style={{ fontSize: '12px' }}>WagmiProvider</code>{' '}
        with connectors configured (e.g. RainbowKit).
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {connectors.map((connector) => {
          const busy = isPending && lastId === connector.id;
          return (
            <li key={connector.id}>
              <button
                type="button"
                className={cn?.button}
                style={
                  cn?.button
                    ? undefined
                    : {
                        ...s.button,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        justifyContent: 'flex-start',
                        padding: '12px 14px',
                        fontSize: '14px',
                        fontWeight: 600,
                      }
                }
                disabled={isPending}
                onClick={() => {
                  setLastId(connector.id);
                  reset();
                  connect({ connector });
                }}
              >
                {connector.icon ? (
                  <img
                    src={connector.icon}
                    alt=""
                    width={28}
                    height={28}
                    style={{ borderRadius: '8px', flexShrink: 0 }}
                  />
                ) : (
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: t.surface,
                      flexShrink: 0,
                    }}
                  />
                )}
                <span style={{ flex: 1, textAlign: 'left' }}>{connector.name}</span>
                {busy && <span style={{ ...s.spinner, color: '#ffffff' }} />}
              </button>
            </li>
          );
        })}
      </ul>
      {error && (
        <div
          role="alert"
          style={{
            fontSize: '13px',
            color: t.error,
            padding: '8px 10px',
            borderRadius: t.radiusSm,
            backgroundColor: t.surface,
            border: `1px solid ${t.border}`,
          }}
        >
          {error.message}
        </div>
      )}
    </div>
  );
}
