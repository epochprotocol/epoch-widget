import { useId, useRef, useState, type FormEvent } from 'react';
import { useAccount, useChainId, useChains, useConnect, useDisconnect } from 'wagmi';
import type { LocalSignerConnector } from '../../wallet/local-signer';

interface Props {
  connector: LocalSignerConnector;
  network?: 'mainnet' | 'testnet';
  onConnected: () => void;
  onCancel?: () => void;
}

export function LocalSignerForm({ connector, network, onConnected, onCancel }: Props) {
  const inputId = useId();
  const keyInput = useRef<HTMLInputElement>(null);
  const configuredChains = useChains();
  const currentChainId = useChainId();
  const chains = configuredChains.filter((chain) => !network || !!chain.testnet === (network === 'testnet'));
  const [selectedChainId, setSelectedChainId] = useState(currentChainId);
  const chainId = chains.find((chain) => chain.id === selectedChainId)?.id ?? chains[0]?.id;
  const { connectAsync, isPending } = useConnect();
  const { connector: activeConnector, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (isPending || chainId == null || !keyInput.current) return;
    setError(undefined);
    const privateKey = keyInput.current.value;
    keyInput.current.value = '';
    try {
      connector.setPrivateKey(privateKey);
    } catch {
      setError('Enter a valid EVM private key (64 hexadecimal characters, with or without 0x).');
      keyInput.current?.focus();
      return;
    }
    try {
      // The key never enters Wagmi/React Query mutation variables or storage.
      if (isConnected && activeConnector) {
        await disconnectAsync({ connector: activeConnector });
      }
      await connectAsync({ connector, chainId });
      onConnected();
    } catch {
      await connector.disconnect();
      setError('Unable to connect the local signer. Re-enter your key and try again.');
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <p id={`${inputId}-help`} className="m-0 text-[13px] leading-relaxed text-fg-muted">
        Use a development account. The key stays in this page’s memory until disconnect or reload.
        Signing happens locally without wallet confirmation popups.
        {isConnected && ' Connecting will disconnect the current EVM wallet.'}
      </p>
      <label htmlFor={inputId} className="text-sm font-semibold text-fg">EVM private key</label>
      <input
        ref={keyInput}
        id={inputId}
        type="password"
        required
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        aria-describedby={`${inputId}-help${error ? ` ${inputId}-error` : ''}`}
        aria-invalid={!!error}
        placeholder="0x…"
        disabled={isPending}
        className="w-full rounded-sm border border-line bg-surface px-3 py-2.5 font-mono text-sm text-fg outline-none focus:border-primary"
      />
      <label htmlFor={`${inputId}-chain`} className="text-sm font-semibold text-fg">EVM network</label>
      <select
        id={`${inputId}-chain`}
        value={chainId ?? ''}
        onChange={(event) => setSelectedChainId(Number(event.target.value))}
        disabled={isPending || chains.length === 0}
        className="w-full rounded-sm border border-line bg-surface px-3 py-2.5 text-sm text-fg"
      >
        {chains.map((chain) => <option key={chain.id} value={chain.id}>{chain.name}</option>)}
      </select>
      {chains.length === 0 && <p role="alert" className="m-0 text-sm text-error">No EVM chains configured for this network.</p>}
      {error && <p id={`${inputId}-error`} role="alert" className="m-0 text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={isPending || chainId == null}
        className="cursor-pointer rounded-sm border-0 bg-primary px-3.5 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Connecting…' : 'Connect local signer'}
      </button>
      {onCancel && <button type="button" onClick={onCancel} disabled={isPending} className="cursor-pointer border-0 bg-transparent py-2 text-sm text-fg-muted">Back to wallets</button>}
    </form>
  );
}
