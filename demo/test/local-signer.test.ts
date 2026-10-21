import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createConfig, createStorage } from 'wagmi';
import { connect, disconnect, getAccount, getWalletClient, reconnect, switchChain } from 'wagmi/actions';
import { custom, recoverMessageAddress, recoverTransactionAddress, recoverTypedDataAddress } from 'viem';
import { recoverAuthorizationAddress } from 'viem/utils';
import { base, baseSepolia } from 'viem/chains';
import { localSigner, isLocalSignerConnector } from '../src/wallet/local-signer.js';

// Public test fixture only; never fund this account.
const TEST_KEY = `0x${'0'.repeat(63)}1`;
const ADDRESS = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';

function setup(stored = new Map<string, string>()) {
  const rpcRequests: unknown[] = [];
  const transport = custom({ request: async (request) => {
    rpcRequests.push(request);
    throw new Error('Signing must happen locally');
  } });
  const config = createConfig({
    chains: [base, baseSepolia],
    connectors: [localSigner()],
    transports: { [base.id]: transport, [baseSepolia.id]: transport },
    storage: createStorage({ storage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => { stored.set(key, value); },
      removeItem: (key) => { stored.delete(key); },
    } }),
  });
  const connector = config.connectors[0];
  assert.ok(isLocalSignerConnector(connector));
  return { config, connector, stored, rpcRequests };
}

describe('local EVM signer', () => {
  it('validates keys without including them in errors', () => {
    const { connector } = setup();
    for (const key of ['', 'private-secret', '0x1234', '0x' + '0'.repeat(64), '0x' + 'f'.repeat(64)]) {
      assert.throws(() => connector.setPrivateKey(key), (error: Error) => {
        assert.match(error.message, /valid.*private key/i);
        if (key) assert.ok(!error.message.includes(key));
        return true;
      });
    }
  });

  it('connects and signs messages and typed data locally through Wagmi', async () => {
    const { config, connector, rpcRequests, stored } = setup();
    connector.setPrivateKey(`  ${TEST_KEY.slice(2)}  `);
    await connect(config, { connector, chainId: base.id });
    assert.equal(getAccount(config).address, ADDRESS);
    const client = await getWalletClient(config);
    assert.equal(client.account.type, 'local');
    assert.equal(typeof client.account.signAuthorization, 'function');
    const signature = await client.signMessage({ message: 'Epoch local signer' });
    assert.equal(await recoverMessageAddress({ message: 'Epoch local signer', signature }), ADDRESS);
    const data = {
      domain: { name: 'Epoch', version: '1', chainId: base.id },
      types: { Intent: [{ name: 'amount', type: 'uint256' }] },
      primaryType: 'Intent',
      message: { amount: 100n },
    } as const;
    const typedSignature = await client.signTypedData(data);
    assert.equal(await recoverTypedDataAddress({ ...data, signature: typedSignature }), ADDRESS);
    const authorization = await client.account.signAuthorization!({ address: ADDRESS, chainId: base.id, nonce: 0 });
    assert.equal(await recoverAuthorizationAddress({ authorization }), ADDRESS);
    const serializedTransaction = await client.account.signTransaction!({
      chainId: base.id, type: 'legacy', to: ADDRESS, nonce: 0,
      gas: 21000n, gasPrice: 1n, value: 0n,
    });
    assert.equal(await recoverTransactionAddress({ serializedTransaction }), ADDRESS);
    assert.deepEqual(rpcRequests, []);
    assert.ok(!JSON.stringify([...stored]).includes(TEST_KEY.slice(2)));
    await disconnect(config);
  });

  it('switches configured chains while retaining the local account', async () => {
    const { config, connector } = setup();
    connector.setPrivateKey(TEST_KEY);
    await connect(config, { connector, chainId: base.id });
    await switchChain(config, { chainId: baseSepolia.id });
    const client = await getWalletClient(config);
    assert.equal(client.chain.id, baseSepolia.id);
    assert.equal(client.account.address, ADDRESS);
    assert.equal(client.account.type, 'local');
    await assert.rejects(connector.switchChain!({ chainId: 999 }), /not configured/i);
    assert.equal(await connector.getChainId(), baseSepolia.id);
    assert.throws(() => connector.setPrivateKey(TEST_KEY), /disconnect/i);
    await disconnect(config);
  });

  it('forgets the account on disconnect and cannot reconnect without a key', async () => {
    const { config, connector } = setup();
    await assert.rejects(connect(config, { connector }), /private key/i);
    connector.setPrivateKey(TEST_KEY);
    await connect(config, { connector });
    const previousClient = await getWalletClient(config);
    await disconnect(config);
    await assert.rejects(previousClient.signMessage({ message: 'Must not sign after disconnect' }), /disconnect/i);
    assert.throws(() => previousClient.account.signAuthorization!({ address: ADDRESS, chainId: base.id, nonce: 0 }), /disconnect/i);
    assert.equal(await connector.isAuthorized(), false);
    assert.deepEqual(await connector.getAccounts(), []);
    await assert.rejects(connector.getClient!(), /private key/i);
    assert.deepEqual(await reconnect(config), []);
    await assert.rejects(connect(config, { connector }), /private key/i);
    connector.setPrivateKey(TEST_KEY);
    await connect(config, { connector });
    await assert.rejects(previousClient.signMessage({ message: 'Must not use a new session' }), /disconnect/i);
    await disconnect(config);
  });

  it('does not restore a signer in a fresh connector from persisted public state', async () => {
    const { config, connector, stored } = setup();
    connector.setPrivateKey(TEST_KEY);
    await connect(config, { connector });
    const fresh = setup(stored);
    assert.equal(await fresh.connector.isAuthorized(), false);
    assert.deepEqual(await fresh.connector.getAccounts(), []);
    assert.deepEqual(await reconnect(fresh.config), []);
    await disconnect(config);
    connector.setPrivateKey(TEST_KEY);
    await assert.rejects(connector.connect({ chainId: 999 }), /not configured/i);
    assert.equal(await connector.isAuthorized(), false);
    await connector.disconnect();
  });
});
