import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { isLocalSignerConnector } from '../../wallet/local-signer';
import { cn, truncateAddress } from '@epoch-protocol/epoch-intent-widget';
import { LocalSignerDialog } from './LocalSignerDialog';
import { LocalSignerForm } from './LocalSignerForm';

interface Props {
  network?: 'mainnet' | 'testnet';
  className?: string;
}

/** Connection control for hosts that also offer an injected-wallet button. */
export function LocalSignerButton({ network, className }: Props) {
  const { connectors } = useConnect();
  const { connector: activeConnector, address, chain, isConnected } = useAccount();
  const { disconnectAsync, isPending } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>();
  const connector = connectors.find(isLocalSignerConnector);
  const isLocal = isLocalSignerConnector(activeConnector);

  if (!connector) return null;

  async function disconnect() {
    setError(undefined);
    try {
      await disconnectAsync({ connector: activeConnector });
      setIsOpen(false);
    } catch {
      setError('Unable to disconnect the local signer. Try again.');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setError(undefined); setIsOpen(true); }}
        disabled={isConnected && !isLocal}
        title={isConnected && !isLocal ? 'Disconnect your wallet before using a local signer' : undefined}
        className={cn('cursor-pointer whitespace-nowrap rounded-md border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-fg shadow-sm hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50', className)}
      >
        {isLocal && address ? `Local · ${truncateAddress(address)}` : 'Local signer'}
      </button>
      {isOpen && (
        <LocalSignerDialog onClose={() => setIsOpen(false)} title="Local EVM signer">
          {isLocal ? (
            <div className="flex flex-col gap-3">
              <p className="m-0 break-all font-mono text-sm">{address}</p>
              <p className="m-0 text-sm text-fg-muted">{chain?.name} · Signs locally</p>
              {error && <p role="alert" className="m-0 text-sm text-error">{error}</p>}
              <button type="button" onClick={disconnect} disabled={isPending} className="cursor-pointer rounded-sm border-0 bg-primary px-3.5 py-3 text-sm font-semibold text-white disabled:opacity-50">
                {isPending ? 'Disconnecting…' : 'Disconnect local signer'}
              </button>
            </div>
          ) : (
            <LocalSignerForm connector={connector} network={network} onConnected={() => setIsOpen(false)} />
          )}
        </LocalSignerDialog>
      )}
    </>
  );
}
