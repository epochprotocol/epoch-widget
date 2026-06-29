# @epoch-protocol/epoch-intent-widget

A drop-in React widget for sending **cross-chain intents** through the Epoch Protocol. Render one component, get a full payment / swap / yield UX: wallet connect, token picker, live quoting, signing, on-chain settlement polling, and progress UI — all themeable to match your app.

The widget covers three flows out of the box:

| Mode   | What the user does                                                                 | Typical use                              |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------- |
| `pay`  | Pays a fixed amount **you** specify, in any token they hold on any supported chain | Checkout, top-ups, "buy this", donations |
| `swap` | Picks both the source and destination token — classic exchange UX                  | In-app swaps / bridging                  |
| `earn` | Deposits into (or withdraws from) a lending market, sourced from 1delta            | Yield / lending integrations             |

Under the hood the widget consumes the headless [`@epoch-protocol/epoch-flows-sdk`](../epoch-flows-sdk). If you want the business logic without the React UI, use that package directly — see [Headless escape hatch](#headless-escape-hatch).

> **Deeper docs:**
>
> - [`docs/INTEGRATION.md`](docs/INTEGRATION.md) — step-by-step guide to embedding the widget in your own app.

---

## Contents

- [Install](#install)
- [Prerequisites](#prerequisites-providers--css)
- [Quick start](#quick-start)
- [The `api` prop](#the-api-prop)
- [Mode: Pay](#mode-pay)
- [Mode: Swap](#mode-swap)
- [Mode: Earn](#mode-earn)
- [Amounts, tokens & chains](#amounts-tokens--chains)
- [Theming](#theming)
- [Callbacks & lifecycle](#callbacks--lifecycle)
- [Testnet](#testnet)
- [Full props reference](#full-props-reference)
- [Exports](#exports)
- [Headless escape hatch](#headless-escape-hatch)
- [Demo app](#demo-app)
- [Troubleshooting](#troubleshooting)

---

## Install

```bash
pnpm add @epoch-protocol/epoch-intent-widget
```

This package ships with **peer dependencies** you must already have (or install):

```bash
pnpm add react react-dom wagmi viem @tanstack/react-query lucide-react
```

| Peer                    | Range   | Why                                         |
| ----------------------- | ------- | ------------------------------------------- |
| `react`, `react-dom`    | `^18`   | The widget is a React component             |
| `wagmi`                 | `^2`    | Wallet account + wallet client + connectors |
| `viem`                  | `^2`    | Signing, RPC reads, unit math               |
| `@tanstack/react-query` | `^5`    | Required by wagmi v2                        |
| `lucide-react`          | `^1.14` | Icons used inside the widget                |

---

## Prerequisites: providers & CSS

The widget assumes your app is already a wagmi app. You need **three** things in place before rendering it:

1. A `WagmiProvider` with at least one connector configured (the widget shows its own connector picker when no wallet is connected — it reads whatever connectors you registered).
2. A `QueryClientProvider` (wagmi v2 requires it).
3. The widget stylesheet imported **once** at your app root.

```tsx
// main.tsx
import ReactDOM from "react-dom/client";
import { WagmiProvider, http, createConfig } from "wagmi";
import { base, optimism, arbitrum, polygon, mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 👇 Import the widget styles once. Without this the widget renders unstyled.
import "@epoch-protocol/epoch-intent-widget/styles.css";

import App from "./App";

const config = createConfig({
  chains: [mainnet, base, optimism, arbitrum, polygon],
  connectors: [injected()], // or RainbowKit / Web3Modal connectors
  transports: {
    [mainnet.id]: http(),
    [base.id]: http("https://mainnet.base.org"),
    [optimism.id]: http("https://mainnet.optimism.io"),
    [arbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
    [polygon.id]: http("https://polygon.lava.build"),
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>,
);
```

> **Wallet connect is built in.** When the widget opens and no account is connected, it renders a connector list from your wagmi config. You don't need RainbowKit — but if you already use it, the widget will list those connectors too.

> **Theming portals:** the widget renders its modal into a portal. If you theme via the `theme` prop you're covered automatically. If you build the surrounding UI against the same design tokens, project them onto `:root` with [`themeToCssVars`](#advanced-css-variables--portals).

---

## Quick start

The simplest integration — send a fixed amount of USDC to an address. The user pays in whatever token they hold; Epoch routes it to the destination.

```tsx
import { useState } from "react";
import { EpochIntentWidget } from "@epoch-protocol/epoch-intent-widget";

export default function PayButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Pay 0.15 USDC</button>

      <EpochIntentWidget
        isOpen={open}
        onClose={() => setOpen(false)}
        api={{ baseUrl: "https://your-allocator.example.com" }}
        mode="pay"
        title="Send USDC"
        submitButtonText="Send"
        toAddress="0x4235215114484bACDfF0071dB54Dc9faaD3489a9"
        toAmount="0.15"
        toChainId={8453}
        toToken="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
        onSuccess={({ nonce }) => console.log("settled", nonce)}
      />
    </>
  );
}
```

That's the whole integration: render the component, control `isOpen`/`onClose`, point `api.baseUrl` at your Epoch allocator. The widget owns connect → balance → quote → sign → settle.

---

## The `api` prop

`api` is the **only required prop besides `isOpen`/`onClose`**. It tells the widget where to talk to the network.

```ts
interface ApiConfig {
  /** Epoch allocator (smallocator) base URL. Required. */
  baseUrl: string;
  /** Per-chain RPC overrides for on-chain reads (balances, etc). Optional. */
  rpcUrls?: Record<number, string>;
  /** 1delta pools/positions proxy base URL. Required for live Earn data. */
  positionsBaseUrl?: string;
}
```

- **`baseUrl`** — your Epoch allocator endpoint. All quote / solve / status calls go here.
- **`rpcUrls`** — optional. By default the widget uses built-in public RPCs to read token balances; override per chain if you have your own nodes.
- **`positionsBaseUrl`** — only needed for **Earn**. Points at the proxy that serves 1delta `/pools` and user-positions data. Omit it and Earn falls back to the bundled static market configs (good for demos).

```tsx
api={{
  baseUrl: 'https://allocator.example.com',
  rpcUrls: { 8453: 'https://base-mainnet.my-node.com' },
  positionsBaseUrl: 'https://positions.example.com', // earn only
}}
```

---

## Mode: Pay

`mode="pay"` (the default). You fix **what** is received and **where**; the user pays from any token/chain they hold. There are two ways to describe the payment.

### Flat props (simplest)

Good for plain "send X token to an address" flows. The widget looks up token metadata from its built-in registry; pass `toTokenDecimals` / `toTokenSymbol` for tokens outside it.

```tsx
<EpochIntentWidget
  isOpen={open}
  onClose={close}
  api={{ baseUrl }}
  mode="pay"
  toAddress="0x4235…89a9"
  toAmount="0.15" // decimal string (human units)
  toChainId={8453}
  toToken="0x8335…2913" // destination token address
  // toTokenSymbol="USDC"  // needed only for unknown tokens
  // toTokenDecimals={6}
/>
```

### Nested `intent` (full control)

Use this when you need a custom protocol interaction (buy a raffle ticket, mint, deposit to a contract, etc.) rather than a plain transfer. `requiredAmount` is a **bigint in atomic units**.

```tsx
<EpochIntentWidget
  isOpen={open}
  onClose={close}
  api={{ baseUrl }}
  title="Buy raffle ticket"
  submitButtonText="Buy ticket"
  intent={{
    requiredToken: {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      symbol: "USDC",
      decimals: 6,
    },
    requiredAmount: 5_000_000n, // 5 USDC, atomic units
    destinationChainName: "Base",
    positionLabel: "1 Raffle Ticket", // shown in the summary
    config: {
      protocol: "raffles",
      action: "buyTicket",
      fixedOutput: true, // user pays whatever it costs to deliver exactly this
      destinationChainId: 8453,
      extraDataTypestring: "address raffleAddress,uint256 numberOfTickets",
      extraData: {
        raffleAddress: "0x0000000000000000000000000000000000000001",
        numberOfTickets: "1",
      },
    },
  }}
/>
```

See [`IntentConfig`](#intentconfig) for every field. The demo's [`pay/scenarios.ts`](demo/src/pay/scenarios.ts) has copy-paste examples for both shapes.

### Pinning vs. picking the destination

By default the destination token is **pinned** to what you passed. Set `lockDestinationToken={false}` to let the user re-pick the destination token/chain (the widget then overrides `requiredToken` + `destinationChainId` on submit).

### Scoping the source side

```tsx
sourceChainIds={[8453, 42161]}                     // restrict the source chain picker
defaultSourceChainId={8453}                         // pre-select a chain
defaultSourceTokenAddress="0x8335…2913"             // pre-select a token (needs defaultSourceChainId)
sourceTokenFilter={(t) => t.symbol !== 'DAI'}       // hide candidates by predicate
```

---

## Mode: Swap

`mode="swap"` is a classic exchange UX — the user picks **both** sides. You provide an initial destination intent; `lockDestinationToken` is forced off internally so the user can always change what they receive.

```tsx
<EpochIntentWidget
  isOpen={open}
  onClose={close}
  api={{ baseUrl }}
  mode="swap"
  title="Swap"
  usdPriceFor={({ symbol }) => (symbol === "USDC" ? 1 : null)} // optional "≈ $…" line
  intent={{
    requiredToken: {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      symbol: "USDC",
      decimals: 6,
    },
    requiredAmount: 1_000_000n,
    destinationChainName: "Base",
    config: {
      protocol: "swap", // routes through DEX/bridge solvers, not a protocol interaction
      action: "swap",
      fixedOutput: true,
      destinationChainId: 8453,
    },
  }}
/>
```

> Setting `protocol: 'swap'` (or `'transfer'` / `'bridge'`) makes the solver treat it as a pure token-in → token-out route. Any other protocol string is treated as a custom protocol interaction.

---

## Mode: Earn

`mode="earn"` renders a deposit/withdraw surface over lending markets. Markets come from 1delta. You have two data sources:

**A. Static / bundled configs (zero backend).** Forward the bundled 1delta configs and the picker works immediately — ideal for demos and getting started.

```tsx
import {
  EpochIntentWidget,
  HARDCODED_ONEDELTA_CONFIGS,
} from "@epoch-protocol/epoch-intent-widget";

<EpochIntentWidget
  isOpen={open}
  onClose={close}
  api={{ baseUrl }}
  mode="earn"
  earnDefaultTab="deposit"
  earnMarketsSource={HARDCODED_ONEDELTA_CONFIGS}
  title="Earn"
/>;
```

**B. Live data.** Set `api.positionsBaseUrl` to your 1delta pools/positions proxy. The widget fetches `/pools` (one request per chain, in parallel) and the user's open positions for withdraw.

```tsx
<EpochIntentWidget
  isOpen={open}
  onClose={close}
  api={{ baseUrl, positionsBaseUrl: "https://positions.example.com" }}
  mode="earn"
  earnChainIds={[1, 8453, 42161]} // chains to fan /pools over
  earnLenderFilter="AAVE_V3,MORPHO" // CSV of 1delta lender keys
  earnPoolsSortBy="totalDepositsUsd" // default
  earnPoolsSortDir="DESC" // default
  earnPoolsPerChain={100} // max rows per chain
/>
```

Useful Earn props: `earnDefaultTab` (`'deposit'`|`'withdraw'`), `earnHideTabs`, `earnDepositDefaults` / `earnWithdrawDefaults` (override the intent `protocol`/`action`/`extraDataTypestring`), `earnSolverUrl`.

> **Earn is mainnet-only** — the 1delta upstream doesn't index testnet pools. Hide the Earn entry point when your app is in testnet mode.

---

## Amounts, tokens & chains

**Two amount conventions — don't mix them up:**

| Prop                    | Type     | Units                  | Example               |
| ----------------------- | -------- | ---------------------- | --------------------- |
| `toAmount` (flat pay)   | `string` | Human / decimal        | `"0.15"`              |
| `intent.requiredAmount` | `bigint` | Atomic (smallest unit) | `5_000_000n` (5 USDC) |

**Built-in registry.** The widget bundles common stablecoins + WETH across Ethereum, Base, Optimism, Polygon, Arbitrum (and Sepolia testnets). For flat-pay with a registry token you can omit `toTokenSymbol`/`toTokenDecimals`. For anything else, pass them.

Supported mainnet chains: **Ethereum (1), Polygon (137), Optimism (10), Base (8453), Arbitrum (42161)**. Testnet: **Base Sepolia (84532), Ethereum Sepolia (11155111), Optimism Sepolia (11155420), Polygon Amoy (80002)**.

You can read the registries yourself:

```ts
import {
  EPOCH_SUPPORTED_CHAINS,
  EPOCH_SUPPORTED_TOKENS,
  getEpochTokensByChainEnv,
  getChainName,
} from "@epoch-protocol/epoch-intent-widget";
```

### IntentConfig

```ts
interface IntentConfig {
  protocol: string; // 'transfer' | 'swap' | 'bridge' → simple route; else protocol interaction
  action: string; // e.g. 'pay', 'swap', 'buyTicket', 'deposit'
  protocolHashIdentifier?: string; // override the keccak256(protocol) hash
  extraDataTypestring?: string; // ABI-style typestring for extraData fields
  extraData?: Record<string, string | boolean | number | bigint>;
  fixedOutput?: boolean; // true → "deliver exactly requiredAmount", user pays the quoted input
  destinationChainId?: number; // mainnet destination
  destinationTestnetChainId?: number; // testnet destination (used when network === 'testnet')
  slippageBps?: number; // output slippage tolerance, default 100 (1%); 0 = strict
}
```

---

## Theming

Three layers, smallest-to-largest effort:

### 1. Preset

```tsx
theme = "light"; // or "dark"
```

### 2. Token overrides (`EpochTheme`)

Override only the tokens you care about; the rest fall back to the light defaults. Tokens are projected onto `--epoch-*` CSS variables.

```tsx
theme={{
  colorPrimary: '#16a34a',
  colorPrimaryHover: '#15803d',
  radiusLg: '16px',
  fontFamily: "'Inter', sans-serif",
}}
```

Common tokens: `colorPrimary`, `colorPrimaryHover`, `colorBackground`, `colorSurface`, `colorBorder`, `colorTextPrimary`, `colorTextSecondary`, `colorTextMuted`, `colorSuccess`, `colorError`, `radiusSm`/`radiusMd`/`radiusLg`, `shadowMd`, `fontFamily`. (See `EpochTheme` for the full list.)

### 3. Per-slot class names (`classNames`)

Take full CSS control of individual elements. Providing a className for a slot skips the widget's default inline styles for it — works with vanilla CSS, Tailwind, or CSS modules.

```tsx
classNames={{
  container: 'bg-white shadow-2xl rounded-2xl max-w-md',
  button: 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold',
  overlay: 'backdrop-blur-sm',
}}
```

Slots: `overlay`, `container`, `header`, `body`, `footer`, `receiveCard`, `receiveAmount`, `receiveLabel`, `payCard`, `payAmount`, `payLabel`, `button`, `chainSelector`, `tokenSelector`, `banner`, `progress`.

### Advanced: CSS variables & portals

If you build surrounding UI against the same tokens and need them on `:root` (so portalled modal children resolve them), project the theme yourself:

```ts
import {
  themeToCssVars,
  LIGHT_THEME,
} from "@epoch-protocol/epoch-intent-widget";

const vars = themeToCssVars(LIGHT_THEME) as Record<string, string>;
for (const [k, v] of Object.entries(vars)) {
  document.documentElement.style.setProperty(k, v);
}
```

### CTA copy

Override button labels per state without touching styles:

```tsx
ctaLabels={{
  submit: 'Confirm swap',
  quoting: 'Pricing…',
  signing: 'Approve in wallet',
  submitting: 'Sending intent…',
  polling: 'Settling on-chain…',
  complete: 'All done',
}}
```

---

## Callbacks & lifecycle

The widget drives the whole flow and reports progress through callbacks.

```tsx
<EpochIntentWidget
  // …
  onOpen={() => {}}
  onStart={({ sessionId, mode }) => {}} // user hit submit
  onSign={({ sessionId }) => {}} // signature requested
  onSuccess={({ sessionId, nonce, status }) => {}} // settled on-chain
  onError={({ sessionId, error }) => {}}
  onStatus={({ status, progress, activeStep }) => {}} // every transition
  onIntentSent={({ nonce }) => {}} // intent submitted, before settle
  onIntentComplete={({ nonce, status }) => {}} // settle finished
  onSourceTokenChange={({ chainId, tokenAddress }) => {}}
  onQuote={({ payAmount, payAmountRaw, error }) => {}} // fires on each quote (fixedOutput intents)
/>
```

**Lifecycle status** (`onStatus.status`):

```
idle → submitting → sent → polling → complete
                                  ↘ error
```

`progress` is `0–100`; `activeStep` is the index into the widget's progress stepper. A successful flow auto-closes the modal after a short delay (`onSuccess` fires first).

---

## Testnet

```tsx
network = "testnet"; // default 'mainnet'
allowNetworkToggle; // optionally let the user flip in-widget
```

In testnet mode the widget uses the Sepolia chain/token registries and reads `intent.config.destinationTestnetChainId`. Base Sepolia USDC for testing: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`. Note Earn has no testnet (see [Mode: Earn](#mode-earn)).

---

## Full props reference

`EpochIntentWidgetProps` — only `isOpen`, `onClose`, and `api` are required.

| Prop                                                                                     | Type                                  | Default                 | Notes                                                                    |
| ---------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------- | ------------------------------------------------------------------------ |
| `isOpen`                                                                                 | `boolean`                             | —                       | **Required.** Controls visibility.                                       |
| `onClose`                                                                                | `() => void`                          | —                       | **Required.** Dismiss handler.                                           |
| `api`                                                                                    | `ApiConfig`                           | —                       | **Required.** See [The `api` prop](#the-api-prop).                       |
| `mode`                                                                                   | `'pay' \| 'swap' \| 'earn'`           | `'pay'`                 | Flow selector.                                                           |
| `flow`                                                                                   | same                                  | —                       | Legacy alias for `mode`.                                                 |
| `intent`                                                                                 | `IntentProps`                         | —                       | Nested pay/swap intent.                                                  |
| `toAddress` / `toAmount` / `toChainId` / `toToken` / `toTokenDecimals` / `toTokenSymbol` | flat                                  | —                       | Flat-pay shorthand (alternative to `intent`).                            |
| `sourceChainIds`                                                                         | `number[]`                            | all                     | Restrict source chain picker.                                            |
| `sourceTokenFilter`                                                                      | `(t) => boolean`                      | —                       | Hide source (chain, token) candidates.                                   |
| `defaultSourceChainId`                                                                   | `number`                              | —                       | Pre-select a source chain.                                               |
| `defaultSourceTokenAddress`                                                              | `` `0x${string}` ``                   | —                       | Pre-select a source token (needs `defaultSourceChainId`).                |
| `lockDestinationToken`                                                                   | `boolean`                             | `true`                  | Pay-only; `false` lets the user re-pick destination. Forced off in Swap. |
| `usdPriceFor`                                                                            | `(t) => number \| null \| Promise<…>` | —                       | Resolver for the "≈ $…" line.                                            |
| `ctaLabels`                                                                              | `Partial<{…}>`                        | —                       | Per-state button copy.                                                   |
| `earnDefaultTab`                                                                         | `'deposit' \| 'withdraw'`             | `'deposit'`             | Earn starting tab.                                                       |
| `earnHideTabs`                                                                           | `boolean`                             | `false`                 | Hide deposit/withdraw tabs.                                              |
| `earnMarketsSource`                                                                      | `OneDeltaConfig[]`                    | —                       | Bundled/static market configs.                                           |
| `earnDepositDefaults` / `earnWithdrawDefaults`                                           | defaults                              | —                       | Override earn intent protocol/action/typestring.                         |
| `earnChainIds`                                                                           | `number[]`                            | `[1,8453,42161,10,137]` | Chains to fetch pools for (live mode).                                   |
| `earnLenderFilter`                                                                       | `string`                              | —                       | CSV of 1delta lender keys.                                               |
| `earnPoolsPerChain`                                                                      | `number`                              | `100`                   | Max rows per chain.                                                      |
| `earnPoolsSortBy`                                                                        | enum                                  | `totalDepositsUsd`      | Pool sort field.                                                         |
| `earnPoolsSortDir`                                                                       | `'ASC' \| 'DESC'`                     | `DESC`                  | Pool sort direction.                                                     |
| `earnSolverUrl`                                                                          | `string`                              | —                       | Earn solver override.                                                    |
| `network`                                                                                | `'mainnet' \| 'testnet'`              | `'mainnet'`             | Active network env.                                                      |
| `allowNetworkToggle`                                                                     | `boolean`                             | `false`                 | Show in-widget network toggle.                                           |
| `renderInline`                                                                           | `boolean`                             | `false`                 | Render inline instead of a modal overlay.                                |
| `theme`                                                                                  | `'light' \| 'dark' \| EpochTheme`     | `'light'`               | See [Theming](#theming).                                                 |
| `classNames`                                                                             | `EpochClassNames`                     | —                       | Per-slot class overrides.                                                |
| `title` / `submitButtonText`                                                             | `string`                              | —                       | Header + CTA copy.                                                       |
| `onOpen`/`onStart`/`onSign`/`onSuccess`/`onError`/`onStatus`                             | callbacks                             | —                       | See [Callbacks & lifecycle](#callbacks--lifecycle).                      |
| `onIntentSent`/`onIntentComplete`                                                        | callbacks                             | —                       | Submit / settle payloads.                                                |
| `onSourceTokenChange`/`onQuote`                                                          | callbacks                             | —                       | Source selection + quote results.                                        |

> Deprecated: `earnMarkets` (use `earnMarketsSource`), `earnUseMockData` (no-op).

---

## Exports

Beyond the widget itself, the package re-exports config, helpers, and design-system primitives:

```ts
import {
  EpochIntentWidget, // the component

  // Theme
  DEFAULT_THEME,
  LIGHT_THEME,
  DARK_THEME,
  resolveTheme,
  themeToCssVars,

  // Registries + helpers
  EPOCH_SUPPORTED_CHAINS,
  EPOCH_TESTNET_CHAINS,
  EPOCH_SUPPORTED_TOKENS,
  EPOCH_TESTNET_TOKENS,
  getEpochChains,
  getEpochChainById,
  getChainName,
  getEpochTokensByChainEnv,
  getEpochTokensBySymbol,

  // Earn data
  useEarnMarkets,
  useUserPositions,
  useEarnConfigs,
  useLendingPools,
  HARDCODED_ONEDELTA_CONFIGS,
  chainLabelFor,
  toEpochEarnMarket,
  flattenConfigsToMarkets,

  // Pure intent builders
  buildPayIntentFromFlatProps,
  buildEarnDepositIntent,
  buildEarnWithdrawIntent,

  // Utils
  formatAmount,
  truncateAddress,
  cn,

  // UI primitives (same design system)
  Card,
  Pill,
  TokenAvatar,
  Skeleton,
  Stat,
  SegmentedTabs,
  RowAccordion,
  SearchInput,
  FilterDropdown,
  TokenAmountCard,
} from "@epoch-protocol/epoch-intent-widget";
```

It also pass-through re-exports the headless SDK — see below.

---

## Headless escape hatch

The widget is a UI layer over [`@epoch-protocol/epoch-flows-sdk`](../epoch-flows-sdk). If you want to build your **own** UI but keep Epoch's intent-building, quoting, and settlement-polling logic, you don't need a separate install — the SDK is re-exported here:

```ts
import {
  EpochFlowsSDK,
  PaySession,
  EarnSession,
} from "@epoch-protocol/epoch-intent-widget";
```

…or depend on `@epoch-protocol/epoch-flows-sdk` directly. See that package's README for the full headless API.

---

## Demo app

A runnable reference integration lives in [`demo/`](demo). It wires the widget into a Vite + wagmi + RainbowKit app with Pay / Swap / Earn surfaces and editable scenarios.

```bash
cd demo
pnpm install
pnpm dev
```

Best files to copy from:

| Path                                                           | Shows                                          |
| -------------------------------------------------------------- | ---------------------------------------------- |
| [`demo/src/main.tsx`](demo/src/main.tsx)                       | Provider setup + CSS import + theme projection |
| [`demo/src/app/App.tsx`](demo/src/app/App.tsx)                 | Rendering the widget + wiring `api` per mode   |
| [`demo/src/pay/scenarios.ts`](demo/src/pay/scenarios.ts)       | Flat-pay & nested-intent prop examples         |
| [`demo/src/earn/earnMarkets.ts`](demo/src/earn/earnMarkets.ts) | Earn props with bundled configs                |

Demo env vars: `VITE_EPOCH_API_BASE_URL` (allocator), `VITE_POSITIONS_API_BASE_URL` (1delta proxy), `VITE_EARN_SOLVER_URL`.

---

## Troubleshooting

| Symptom                                               | Cause / fix                                                                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Widget renders unstyled                               | You didn't `import '@epoch-protocol/epoch-intent-widget/styles.css'` at your app root.                             |
| "must wrap … in WagmiProvider" / no connectors listed | Missing `WagmiProvider`, or no connectors configured in your wagmi config.                                         |
| React Query errors on mount                           | Missing `QueryClientProvider` (wagmi v2 requires it).                                                              |
| "Unknown destination token" on flat pay               | Token isn't in the built-in registry — pass `toTokenDecimals` and `toTokenSymbol`.                                 |
| Earn picker is empty / shows static rows              | Set `api.positionsBaseUrl` for live data; without it Earn uses bundled configs only.                               |
| Quote comes back below the displayed amount           | Expected for cross-chain/cross-token routes — tune `intent.config.slippageBps` (default `100` = 1%; `0` = strict). |
| Modal theme tokens missing in portal                  | Project tokens onto `:root` with `themeToCssVars` (see [Advanced](#advanced-css-variables--portals)).              |
| Wrong network / testnet tokens                        | Set `network="testnet"` and use `destinationTestnetChainId` in your intent config.                                 |

---

## License

MIT
