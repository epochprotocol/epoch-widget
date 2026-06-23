# Integration Guide

How to embed `EpochIntentWidget` in your React app. You render one component and it owns the full flow: wallet-connect → token pick → quote → sign → settle.

- For runtime behavior, states, and caveats, see [BEHAVIOR.md](./BEHAVIOR.md).
- For the full prop table, see [the README](../README.md).

---

## Contents

- [Prerequisites](#prerequisites)
- [Step 1 — Install](#step-1--install)
- [Step 2 — Providers & CSS](#step-2--providers--css)
- [Step 3 — Mount the widget](#step-3--mount-the-widget)
- [Step 4 — The `api` prop](#step-4--the-api-prop)
- [Step 5 — Pick a mode](#step-5--pick-a-mode)
  - [Pay](#pay)
  - [Swap](#swap)
  - [Earn](#earn)
- [Theming](#theming)
- [Wiring callbacks](#wiring-callbacks)
- [Testnet](#testnet)
- [Packaging notes](#packaging-notes)
- [Bundler notes](#bundler-notes)
- [Checklists](#checklists)

---

## Prerequisites

Your app must be a **wagmi v2** app (or become one). The widget ships these as peer dependencies — you install them:

| Peer dependency             | Range     | Why                                  |
|-----------------------------|-----------|--------------------------------------|
| `react`, `react-dom`        | `^18`     | It's a React component               |
| `wagmi`                     | `^2`      | Account, wallet client, connectors   |
| `viem`                      | `^2`      | Signing, RPC reads, unit math        |
| `@tanstack/react-query`     | `^5`      | Required by wagmi v2                  |
| `lucide-react`              | `^1.14`   | Icons inside the widget              |

You also need an **Epoch allocator endpoint** for `api.baseUrl`, and — for live Earn data only — a **1delta positions proxy** for `api.positionsBaseUrl`.

---

## Step 1 — Install

```bash
pnpm add @epoch-protocol/epoch-intent-widget
pnpm add react react-dom wagmi viem @tanstack/react-query lucide-react
```

A wallet-connect UI library (RainbowKit / Web3Modal) is **optional**. The widget renders its own connector list from whatever connectors your wagmi config registers; if you already use RainbowKit, those connectors show up automatically.

---

## Step 2 — Providers & CSS

Three things must be in place before you render the widget:

1. A `WagmiProvider` with at least one connector.
2. A `QueryClientProvider` (wagmi v2 requires it).
3. The widget stylesheet imported **once** at your app root — without it the widget renders unstyled.

```tsx
// main.tsx (or your root)
import ReactDOM from 'react-dom/client';
import { WagmiProvider, http, createConfig } from 'wagmi';
import { base, optimism, arbitrum, polygon, mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 👇 Import the widget styles once.
import '@epoch-protocol/epoch-intent-widget/styles.css';

import App from './App';

const config = createConfig({
  chains: [mainnet, base, optimism, arbitrum, polygon],
  connectors: [injected()], // or RainbowKit / Web3Modal connectors
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

### Theme tokens & portals

The widget renders its modal into a `document.body` portal. If you only style the widget via the `theme` prop, you're covered. If you build chrome **around** the widget against the same `--epoch-*` design tokens, project them onto `:root` so portalled modal children resolve the variables:

```tsx
import { themeToCssVars, LIGHT_THEME } from '@epoch-protocol/epoch-intent-widget';

const vars = themeToCssVars(LIGHT_THEME) as Record<string, string>;
for (const [key, value] of Object.entries(vars)) {
  document.documentElement.style.setProperty(key, value);
}
```

---

## Step 3 — Mount the widget

The whole integration: render the component, control `isOpen`/`onClose`, pass `api`.

```tsx
import { useState } from 'react';
import { EpochIntentWidget } from '@epoch-protocol/epoch-intent-widget';

export default function PayButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Pay 0.15 USDC</button>

      <EpochIntentWidget
        isOpen={open}
        onClose={() => setOpen(false)}
        api={{ baseUrl: 'https://your-allocator.example.com' }}
        mode="pay"
        title="Send USDC"
        submitButtonText="Send"
        toAddress="0x4235215114484bACDfF0071dB54Dc9faaD3489a9"
        toAmount="0.15"
        toChainId={8453}
        toToken="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
        onSuccess={({ nonce }) => console.log('settled', nonce)}
      />
    </>
  );
}
```

The widget returns `null` when `isOpen` is false, so keeping it mounted is cheap. Each `closed → open` starts a fresh session — state does not carry across opens.

If you drive several configurations from one place, keep a single instance and swap the props you pass it:

```tsx
const [open, setOpen] = useState(false);
const [props, setProps] = useState(payProps);

const launch = (next) => { setProps(next); setOpen(true); };

<EpochIntentWidget {...props} isOpen={open} onClose={() => setOpen(false)} api={api} />
```

---

## Step 4 — The `api` prop

`api` is the only required prop besides `isOpen`/`onClose`.

```ts
interface ApiConfig {
  baseUrl: string;                       // Epoch allocator — required; all quote/solve/status calls go here
  rpcUrls?: Record<number, string>;      // per-chain RPC overrides for balance reads
  positionsBaseUrl?: string;             // 1delta proxy — required only for live Earn data
  testnetBaseUrl?: string;               // allocator when network="testnet" (default http://localhost:3000)
  testnetPositionsBaseUrl?: string;      // positions when network="testnet" (default http://localhost:4024)
}
```

- **`baseUrl`** — your allocator endpoint.
- **`rpcUrls`** — optional. Defaults to built-in public RPCs for balance reads. Override per chain where the public RPC is flaky (a flaky read shows balance as `—`, not an error).
- **`positionsBaseUrl`** — Earn live data only. Omit → Earn uses bundled static configs.
- **`testnetBaseUrl` / `testnetPositionsBaseUrl`** — used only when `network="testnet"`; default to localhost.

Earn needs the positions URL; pay/swap don't:

```tsx
// pay / swap
api={{ baseUrl: 'https://allocator.example.com' }}

// earn (live data)
api={{ baseUrl: 'https://allocator.example.com', positionsBaseUrl: 'https://positions.example.com' }}
```

---

## Step 5 — Pick a mode

### Pay

`mode="pay"` (default). You fix what's received and where; the user pays from any token they hold. Two ways to describe it.

**Flat props** — simplest "send X to an address":

```tsx
<EpochIntentWidget
  isOpen={open} onClose={close}
  api={{ baseUrl }}
  mode="pay"
  toAddress="0x4235215114484bACDfF0071dB54Dc9faaD3489a9"
  toAmount="0.15"                                        // decimal string (human units)
  toChainId={8453}
  toToken="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"   // destination token
  // toTokenSymbol / toTokenDecimals — needed only for tokens outside the built-in registry
/>
```

**Nested `intent`** — full control for protocol interactions (mint, buy ticket, deposit, etc.). `requiredAmount` is a **bigint in atomic units**:

```tsx
<EpochIntentWidget
  isOpen={open} onClose={close}
  api={{ baseUrl }}
  title="Buy raffle ticket"
  submitButtonText="Buy ticket"
  intent={{
    requiredToken: { address: '0x8335…2913', symbol: 'USDC', decimals: 6 },
    requiredAmount: 5_000_000n,                  // 5 USDC, atomic
    destinationChainName: 'Base',
    positionLabel: '1 Raffle Ticket',            // shown in the summary
    config: {
      protocol: 'raffles',
      action: 'buyTicket',
      fixedOutput: true,                         // deliver exactly this; user pays the quote
      destinationChainId: 8453,
      extraDataTypestring: 'address raffleAddress,uint256 numberOfTickets',
      extraData: { raffleAddress: '0x…0001', numberOfTickets: '1' },
    },
  }}
/>
```

By default the destination is **pinned**. Set `lockDestinationToken={false}` to let the user re-pick it. Scope the source side with `sourceChainIds`, `defaultSourceChainId`, `defaultSourceTokenAddress`, `sourceTokenFilter`.

### Swap

`mode="swap"` — classic exchange UX; the user picks **both** sides. Provide an initial destination intent (`lockDestinationToken` is forced off internally so the user can always change what they receive):

```tsx
<EpochIntentWidget
  isOpen={open} onClose={close}
  api={{ baseUrl }}
  mode="swap"
  title="Swap"
  usdPriceFor={({ symbol }) =>                        // optional "≈ $…" line
    symbol === 'USDC' ? 1 : symbol === 'WETH' ? 3500 : null
  }
  ctaLabels={{ submit: 'Confirm swap', signing: 'Approve in wallet', polling: 'Settling on-chain…' }}
  intent={{
    requiredToken: { address: '0x8335…2913', symbol: 'USDC', decimals: 6 },
    requiredAmount: 1_000_000n,
    destinationChainName: 'Base',
    config: { protocol: 'swap', action: 'swap', fixedOutput: true, destinationChainId: 8453 },
  }}
/>
```

`protocol: 'swap'` (or `'transfer'`/`'bridge'`) routes a pure token-in → token-out path; any other protocol string is treated as a custom protocol interaction.

### Earn

`mode="earn"` renders deposit/withdraw over lending markets (1delta). Two data sources.

**A — Static (zero backend), good for getting started:**

```tsx
import { EpochIntentWidget, HARDCODED_ONEDELTA_CONFIGS } from '@epoch-protocol/epoch-intent-widget';

<EpochIntentWidget
  isOpen={open} onClose={close}
  api={{ baseUrl }}
  mode="earn"
  earnDefaultTab="deposit"
  earnMarketsSource={HARDCODED_ONEDELTA_CONFIGS}
  title="Earn"
/>
```

**B — Live data:** set `api.positionsBaseUrl` and scope with the earn props:

```tsx
<EpochIntentWidget
  isOpen={open} onClose={close}
  api={{ baseUrl, positionsBaseUrl: 'https://positions.example.com' }}
  mode="earn"
  earnChainIds={[1, 8453, 42161]}        // chains to fan /pools over
  earnLenderFilter="AAVE_V3,MORPHO"      // CSV of 1delta lender keys
  earnPoolsSortBy="totalDepositsUsd"     // default
  earnPoolsSortDir="DESC"                // default
  earnPoolsPerChain={100}                // default
/>
```

Earn-specific notes:

- **Earn is mainnet-only** — the 1delta upstream doesn't index testnet pools. Hide the Earn entry point when your app is in testnet mode.
- The live routes need `ONEDELTA_API_KEY` on the positions service, or they return `503`.
- Earn defaults `allowNetworkToggle` to `true` (pay/swap default to `false`).
- **Miden funding** (testnet, optional): pass an `earnMiden` adapter to add an EVM/Miden source toggle. Keep `@miden-sdk/*` in your app — the widget only consumes the adapter shape (`connect`, `createP2IDNote`, asset list, `reclaimHeight`).

See [BEHAVIOR.md → Earn](./BEHAVIOR.md#earn) for every earn case and caveat.

---

## Theming

Three layers, least to most effort:

```tsx
// 1. Preset
theme="light"   // or "dark"

// 2. Token overrides (rest fall back to defaults)
theme={{ colorPrimary: '#16a34a', radiusLg: '16px', fontFamily: "'Inter', sans-serif" }}

// 3. Per-slot class names (full CSS control; skips the widget's inline styles for that slot)
classNames={{
  container: 'bg-white shadow-2xl rounded-2xl max-w-md',
  button: 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold',
  overlay: 'backdrop-blur-sm',
}}
```

Slots: `overlay`, `container`, `header`, `body`, `footer`, `receiveCard`, `receiveAmount`, `receiveLabel`, `payCard`, `payAmount`, `payLabel`, `button`, `chainSelector`, `tokenSelector`, `banner`, `progress`.

Override CTA copy without touching styles via `ctaLabels` — see [BEHAVIOR.md → CTA labels](./BEHAVIOR.md#cta-button-what-each-label-means).

---

## Wiring callbacks

None are required — the widget works with none wired. Wire the ones your app reacts to:

```tsx
<EpochIntentWidget
  // …
  onSuccess={({ sessionId, nonce, status }) => unlockFeature(nonce)}   // do your unlock/redirect HERE
  onError={({ sessionId, error }) => logError(error)}                  // log; widget already shows the banner
  onIntentSent={({ nonce }) => persistPendingIntent(nonce)}            // record the nonce before settlement
  onStatus={({ status, progress, activeStep }) => track(status)}       // every transition
  onQuote={({ payAmount, error }) => showPrice(payAmount, error)}      // fixedOutput intents only
/>
```

Rules of thumb (full detail in [BEHAVIOR.md](./BEHAVIOR.md#events--callbacks)):

- Put user-facing success work in **`onSuccess`** — the modal auto-closes shortly after, so don't depend on it staying open.
- Treat **`onClose` without a preceding `onSuccess`** as "outcome unknown," not "failed" — an issued intent can still settle server-side. Persist the nonce from `onIntentSent` to reconcile.
- There is **no settlement timeout**; add your own if your UX needs a ceiling.

---

## Testnet

```tsx
network="testnet"          // default 'mainnet'
allowNetworkToggle         // optionally let the user flip mainnet/testnet in-widget
```

In testnet mode the widget uses the Sepolia chain/token registries, reads `intent.config.destinationTestnetChainId`, and resolves `api.testnetBaseUrl` / `api.testnetPositionsBaseUrl` (both default to localhost). Base Sepolia USDC for testing: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`.

Caveats: **Earn has no real testnet** (1delta doesn't index testnet pools — dummy-lending markets only), and **Miden funding is testnet-only**. See [BEHAVIOR.md → Caveats](./BEHAVIOR.md#caveats--current-limitations).

---

## Packaging notes

- The published package ships `dist/` only. The CSS at `@epoch-protocol/epoch-intent-widget/styles.css` is a **separate export** — importing the JS does not pull in styles. Import the CSS explicitly (Step 2).
- The package is dual-format (ESM + CJS) with bundled `.d.ts` types.
- React, wagmi, viem, and the Epoch SDKs are externalized — your app provides them.

---

## Bundler notes

- **Dedupe singletons.** Ensure a single copy of `react`, `react-dom`, `wagmi`, `viem`, `@tanstack/react-query`. Duplicate copies break wagmi's hooks/context once the widget and your wallet UI both pull them in. In Vite: `resolve.dedupe: ['react','react-dom','wagmi','viem','@tanstack/react-query']`.
- **Portalled modal + theme.** The modal mounts into `document.body`; project `--epoch-*` onto `:root` (Step 2) if your own chrome shares those tokens.
- **Miden earn only.** Miden funding needs WASM + top-level-await support from your bundler (e.g. `vite-plugin-wasm` + `vite-plugin-top-level-await`) and the Miden SDK excluded from dep pre-bundling. Skip all of it unless you integrate Miden — it's not needed for EVM pay/swap/earn.

---

## Checklists

**Minimal Pay:**

1. `pnpm add` the widget + peers (`wagmi`, `viem`, `@tanstack/react-query`, `lucide-react`).
2. Wrap your app: `WagmiProvider` → `QueryClientProvider` (→ RainbowKit, optional).
3. Import `@epoch-protocol/epoch-intent-widget/styles.css` once at root.
4. Render `EpochIntentWidget` with `isOpen`/`onClose` + `api.baseUrl` + flat pay props.
5. React in `onSuccess`.

**Earn:**

1. Set `api.positionsBaseUrl` for live data (else pass `earnMarketsSource`).
2. Ensure `ONEDELTA_API_KEY` is set on the positions service.
3. Scope with `earnChainIds` / `earnLenderFilter` as needed.
4. Hide the Earn entry point on testnet.
5. (Optional) Pass an `earnMiden` adapter for Miden-funded testnet deposits.

**Theming chrome on the same tokens:**

1. Project your theme to `:root` with `themeToCssVars`.
2. Alias `--epoch-*` into your CSS framework's color tokens.
3. Pass the same `theme` prop to the widget for consistency.
