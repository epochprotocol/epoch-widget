import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createWalletClient, custom } from 'viem';
import { arbitrum } from 'viem/chains';
import { EpochIntentSDK } from '@epoch-protocol/epoch-intents-sdk';
import {
  useEarnIntentFlow,
  type EarnQuoteInput,
} from '../src/earn/use-earn-intent-flow';

const address = '0x050134E8Ff88f79F422EF33CD5c0FaC93f709566';
const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const walletClient = createWalletClient({
  account: address,
  chain: arbitrum,
  transport: custom({
    request: async () => {
      throw new Error('Unexpected wallet request');
    },
  }),
});
const input: EarnQuoteInput = {
  tab: 'withdraw',
  amount: '0.000513',
  sourceChainId: 1,
  sourceToken: {
    address: usdc,
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
    chainId: 1,
  },
  network: 'mainnet',
  market: {
    id: 'ethereum-usdc',
    displayName: 'USDC',
    chainLabel: 'Ethereum',
    aprDecimal: 0,
    vaultAddress: usdc,
    destinationChainName: 'Ethereum',
    chainId: 1,
    oneDeltaMarketUid: `AAVE_V3:1:${usdc}`,
    token: { address: usdc, symbol: 'USDC', decimals: 6 },
  },
};

for (const destination of ['miden', 'evm', 'underlying'] as const) {
  test(`${destination} withdrawal preview quotes Ethereum USDC on Ethereum while wallet is on Arbitrum`, async (t) => {
    const quotedChains: number[] = [];
    t.mock.method(EpochIntentSDK.prototype, 'getTaskData', async (params) => ({
      taskTypeString: 'test',
      intentData: params.intentData,
    }));
    t.mock.method(
      EpochIntentSDK.prototype,
      'getIntentQuote',
      async function (this: EpochIntentSDK) {
        quotedChains.push(Reflect.get(this, 'config').walletClient.chain.id);
        return {
          success: true,
          tokenOut: '500',
          transactions: [],
          resourceLockRequired: true,
        };
      },
    );
    let flow!: ReturnType<typeof useEarnIntentFlow>;
    function Probe() {
      flow = useEarnIntentFlow({
        address,
        walletClient,
        apiBaseUrl: 'http://localhost:3000',
        sessionId: 'origin-test',
      });
      return null;
    }
    renderToStaticMarkup(createElement(Probe));
    await flow.fetchQuote({
      ...input,
      smartWithdraw: destination !== 'underlying',
      smartDestChainId: destination === 'miden' ? 999999999 : 8453,
      smartDestTokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      ...(destination === 'miden'
        ? {
            midenDest: {
              recipientAccount: '0xc8f8016eff9bbf516610db9b34751c',
              faucetId: '0xe69e6ca6e39df1b10c1e5399399feb',
              decimals: 6,
            },
          }
        : {}),
    });
    assert.deepEqual(quotedChains, [1]);
    assert.equal(
      walletClient.chain.id,
      42161,
      'Preview must not switch the wallet',
    );
  });
}

for (const smartWithdraw of [false, true]) {
  test(`${smartWithdraw ? 'smart' : 'plain'} withdrawal refuses execution on the wrong wallet chain`, async (t) => {
    let taskCalls = 0;
    let errorMessage: string | undefined;
    t.mock.method(EpochIntentSDK.prototype, 'getTaskData', async () => {
      taskCalls++;
      throw new Error('Should reject before building an execution');
    });
    let flow!: ReturnType<typeof useEarnIntentFlow>;
    function Probe() {
      flow = useEarnIntentFlow({
        address,
        walletClient,
        apiBaseUrl: 'http://localhost:3000',
        sessionId: 'origin-test',
        onError: ({ error }) => {
          errorMessage = error.message;
        },
      });
      return null;
    }
    renderToStaticMarkup(createElement(Probe));
    await flow.submit({
      ...input,
      quote: null,
      smartWithdraw,
      smartDestChainId: 8453,
      smartDestTokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    });
    assert.equal(
      errorMessage,
      'Switch your wallet to chain 1 before withdrawing',
    );
    assert.equal(taskCalls, 0);
  });
}
