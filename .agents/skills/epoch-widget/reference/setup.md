# Setup — providers, CSS, `api`, chains/tokens

## Providers (mandatory)

The widget is a wagmi app component. Wrap the app once:

```tsx
// main.tsx
import ReactDOM from 'react-dom/client';
import { WagmiProvider, http, createConfig } from 'wagmi';
import { mainnet, base, optimism, arbitrum, polygon } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mandatory: import widget styles ONCE. Without this the widget is unstyled.
import '@epoch-protocol/epoch-intent-widget/styles.css';

import App from './App';

const config = createConfig({
  chains: [mainnet, base, optimism, arbitrum, polygon],
  connectors: [injected()], // or RainbowKit / Web3Modal connectors — widget lists whatever you register
  transports: {
    [mainnet.id]:  http(),
    [base.id]:     http('https://mainnet.base.org'),
    [optimism.id]: http('https://mainnet.optimism.io'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
    [polygon.id]:  http('https://polygon.lava.build'),
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>,
);
```

Notes:
- **Wallet connect is built in.** When the widget opens with no connected account, it renders a connector list from the wagmi config. No RainbowKit required (but its connectors will show if present).
- `QueryClientProvider` is required by wagmi v2 — omitting it throws on mount.

## The `api` prop (required)

```ts
interface ApiConfig {
  baseUrl: string;                  // Epoch allocator (smallocator). REQUIRED. All quote/solve/status calls.
  rpcUrls?: Record<number, string>; // optional per-chain RPC overrides for balance reads
  positionsBaseUrl?: string;        // 1delta pools/positions proxy. REQUIRED for live Earn data.
}
```

```tsx
api={{
  baseUrl: 'https://allocator.example.com',
  rpcUrls: { 8453: 'https://base-mainnet.my-node.com' },
  positionsBaseUrl: 'https://positions.example.com', // earn only
}}
```

Without `positionsBaseUrl`, Earn falls back to bundled static market configs (`HARDCODED_ONEDELTA_CONFIGS`) — fine for demos, not for production markets.

## Theming portals

The modal renders into a portal. The `theme` prop covers it automatically. If you also build surrounding UI against the same `--epoch-*` tokens, project them onto `:root` so portalled children resolve them:

```ts
import { themeToCssVars, LIGHT_THEME } from '@epoch-protocol/epoch-intent-widget';

const vars = themeToCssVars(LIGHT_THEME) as Record<string, string>;
for (const [k, v] of Object.entries(vars)) {
  document.documentElement.style.setProperty(k, v);
}
```

## Supported chains & tokens

Built-in registry (flat-pay can omit `toTokenSymbol`/`toTokenDecimals` for these):

| Env | Chains (id) | Tokens |
|-----|-------------|--------|
| mainnet | Ethereum (1), Polygon (137), Optimism (10), Base (8453), Arbitrum (42161) | USDC, USDT, DAI, WETH |
| testnet | Base Sepolia (84532), Ethereum Sepolia (11155111), Optimism Sepolia (11155420) | USDC, USDT, DAI, WETH |

Read them programmatically:

```ts
import {
  EPOCH_SUPPORTED_CHAINS, EPOCH_TESTNET_CHAINS,
  EPOCH_SUPPORTED_TOKENS, getEpochTokensByChainEnv,
  getEpochChainById, getChainName,
} from '@epoch-protocol/epoch-intent-widget';
```

For tokens **outside** the registry, pass `toTokenDecimals` + `toTokenSymbol` (flat pay) or full `requiredToken` metadata (nested intent).

Base Sepolia test USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`. Optimism Sepolia test USDC: `0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69`.
