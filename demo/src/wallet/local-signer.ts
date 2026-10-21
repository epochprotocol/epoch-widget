import { createConnector, type Connector } from 'wagmi';
import { createClient, http, numberToHex, type EIP1193RequestFn } from 'viem';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';

const LOCAL_SIGNER_ID = 'epoch-local-signer';

export type LocalSignerConnector = Connector & {
  setPrivateKey(privateKey: string): void;
};

export function isLocalSignerConnector(connector: Connector | undefined): connector is LocalSignerConnector {
  return connector?.id === LOCAL_SIGNER_ID && typeof connector.setPrivateKey === 'function';
}

/**
 * Opt-in, memory-only EVM signer. Set the key on the configured connector
 * before calling Wagmi's connect; never put it in mutation/query parameters.
 */
export function localSigner() {
  return createConnector<{ request: EIP1193RequestFn }, { setPrivateKey(privateKey: string): void }>((config) => {
    let account: PrivateKeyAccount | undefined;
    let connected = false;
    let chainId = config.chains[0].id;
    let signingSession = Symbol();

    function signingAccount(session: symbol) {
      if (!connected || !account || session !== signingSession) {
        throw new Error('Local signer disconnected. Connect again to sign.');
      }
      return account;
    }

    function getChain(id = chainId) {
      const chain = config.chains.find((chain) => chain.id === id);
      if (!chain) throw new Error('Local signer chain is not configured.');
      return chain;
    }

    function getClient(id = chainId) {
      if (!account || !connected) throw new Error('Enter a private key to connect the local signer.');
      const chain = getChain(id);
      const session = signingSession;
      // Cached clients hold delegates, never the key-bearing account. Once
      // disconnected, even a previously captured client can no longer sign.
      const clientAccount: PrivateKeyAccount = {
        address: account.address,
        publicKey: account.publicKey,
        source: 'privateKey',
        type: 'local',
        sign: (parameters) => signingAccount(session).sign!(parameters),
        signAuthorization: (parameters) => signingAccount(session).signAuthorization!(parameters),
        signMessage: (parameters) => signingAccount(session).signMessage(parameters),
        signTransaction: (transaction, options) => signingAccount(session).signTransaction(transaction, options),
        signTypedData: (parameters) => signingAccount(session).signTypedData(parameters),
      };
      return createClient({
        account: clientAccount,
        chain,
        transport: config.transports?.[chain.id] ?? http(),
      });
    }

    function clear() {
      account = undefined;
      connected = false;
      signingSession = Symbol();
    }

    return {
      id: LOCAL_SIGNER_ID,
      name: 'Local signer',
      type: 'localSigner',
      setPrivateKey(privateKey) {
        if (connected) throw new Error('Disconnect the local signer before changing its private key.');
        account = undefined;
        signingSession = Symbol();
        const normalized = privateKey.trim().replace(/^0x/i, '');
        try {
          if (!/^[a-fA-F0-9]{64}$/.test(normalized)) throw new Error();
          account = privateKeyToAccount(`0x${normalized}`);
        } catch {
          // Do not expose Viem's error: it may contain the supplied key.
          throw new Error('Enter a valid EVM private key (64 hexadecimal characters).');
        }
      },
      async connect({ chainId: requestedChainId, withCapabilities } = {}) {
        if (!account) throw new Error('Enter a private key to connect the local signer.');
        chainId = getChain(requestedChainId).id;
        connected = true;
        return {
          accounts: (withCapabilities
            ? [{ address: account.address, capabilities: {} }]
            : [account.address]) as never,
          chainId,
        };
      },
      async disconnect() { clear(); },
      async getAccounts() { return connected && account ? [account.address] : []; },
      async getChainId() { return chainId; },
      async getClient({ chainId: requestedChainId } = {}) { return getClient(requestedChainId); },
      async getProvider() {
        const request = async (args: { method: string; params?: unknown }) => {
          if (args.method === 'eth_accounts' || args.method === 'eth_requestAccounts') {
            return connected && account ? [account.address] : [];
          }
          if (args.method === 'eth_chainId') return numberToHex(chainId);
          return getClient().transport.request(args);
        };
        return { request: request as EIP1193RequestFn };
      },
      async isAuthorized() { return connected && account != null; },
      async switchChain({ chainId: requestedChainId }) {
        const chain = getChain(requestedChainId);
        chainId = chain.id;
        config.emitter.emit('change', { chainId });
        return chain;
      },
      onAccountsChanged(accounts) {
        if (accounts.length === 0) this.onDisconnect();
      },
      onChainChanged(id) {
        chainId = getChain(Number(id)).id;
        config.emitter.emit('change', { chainId });
      },
      onDisconnect() {
        clear();
        config.emitter.emit('disconnect');
      },
    };
  });
}
