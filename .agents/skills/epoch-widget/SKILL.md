---
name: epoch-widget
description: Integrates the Epoch Intent Widget (@epoch-protocol/epoch-intent-widget) into a React app — a drop-in component for cross-chain Pay, Swap, and Earn (lending deposit/withdraw) intents on Epoch Protocol. Applies when adding a payment/checkout, in-app swap, or yield/earn flow with EpochIntentWidget; wiring its wagmi + react-query providers; theming it; handling its callbacks; or using the headless @epoch-protocol/epoch-flows-sdk. Also triggers for "add Epoch pay/swap/earn", "EpochIntentWidget", "epoch intent widget", or "epoch-flows-sdk".
user-invocable: false
---

# Epoch Intent Widget

`@epoch-protocol/epoch-intent-widget` is a drop-in React component for sending **cross-chain intents** through Epoch Protocol. Render one component (`<EpochIntentWidget />`) and get a full flow: wallet connect → token picker → live quote → sign → on-chain settlement polling → progress UI. Everything is themeable.

The integration is intentionally small. In most cases it is: install peers, wrap the app in two providers, import one CSS file, render the component controlled by `isOpen`/`onClose`, and point `api.baseUrl` at the Epoch allocator. **Do not hand-roll wallet connect, quoting, signing, or polling — the widget owns all of it.**

## Three modes

| `mode` | User experience | Use for |
|--------|-----------------|---------|
| `pay` (default) | Pays a fixed amount **you** specify, from any token they hold on any supported chain | Checkout, top-ups, donations, "buy this" |
| `swap` | Picks both source and destination token — exchange UX | In-app swaps / bridging |
| `earn` | Deposits into / withdraws from a 1delta lending market | Yield / lending |

## Principles

1. **The component is the integration.** Render `<EpochIntentWidget />`; don't reimplement the flow. If you need custom UI, use the headless SDK (see [headless](#headless-escape-hatch)) — still don't reimplement quoting/polling.
2. **Two amount conventions — never mix them.** Flat-pay `toAmount` is a **decimal string** (`"0.15"`). `intent.requiredAmount` is a **`bigint` in atomic units** (`5_000_000n` = 5 USDC).
3. **Pick the prop shape by need.** Flat props (`toAddress`/`toAmount`/`toChainId`/`toToken`) for plain sends; nested `intent={{…}}` for custom protocol interactions (mint, buy ticket, vault deposit).
4. **Theme, don't fork.** Use the `theme` prop (preset or token overrides) and `classNames` slot overrides. Don't patch the package.
5. **Earn is mainnet-only.** 1delta doesn't index testnet pools — hide Earn entry points in testnet mode.

## Required setup (always enforced)

These three are mandatory. Missing any one is the most common failure.

1. **Wrap the app in `WagmiProvider` + `QueryClientProvider`.** wagmi v2 requires react-query. Configure at least one connector — the widget renders its own connector picker from your wagmi config when no wallet is connected (RainbowKit/Web3Modal optional).
2. **Import the stylesheet once** at the app root: `import '@epoch-protocol/epoch-intent-widget/styles.css';`. Without it the widget renders unstyled.
3. **Pass `api={{ baseUrl }}`** — the Epoch allocator endpoint. For Earn live data also pass `api.positionsBaseUrl`.

```bash
# peers (install if missing)
pnpm add @epoch-protocol/epoch-intent-widget
pnpm add react react-dom wagmi viem @tanstack/react-query lucide-react
```

Minimal working integration:

```tsx
import { useState } from 'react';
import { EpochIntentWidget } from '@epoch-protocol/epoch-intent-widget';

function PayButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Pay 0.15 USDC</button>
      <EpochIntentWidget
        isOpen={open}
        onClose={() => setOpen(false)}
        api={{ baseUrl: 'https://allocator.example.com' }}
        mode="pay"
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

Provider setup and per-mode examples (pay/swap/earn), theming, and headless usage are in the references below. **Read the relevant reference file before writing integration code** — don't guess prop names.

## References

- **[reference/setup.md](./reference/setup.md)** — full provider wiring (wagmi config, CSS, theme-on-`:root` for portals), supported chains/tokens, the `api` prop.
- **[reference/recipes.md](./reference/recipes.md)** — copy-paste recipes: flat pay, nested intent, swap, earn (static + live), theming, CTA copy, callbacks, headless SDK.
- **[reference/props.md](./reference/props.md)** — complete `EpochIntentWidgetProps` table, `IntentConfig` / `IntentProps` shapes, callback payloads, lifecycle states, exports.
- **[reference/troubleshooting.md](./reference/troubleshooting.md)** — symptom → fix table.

## Headless escape hatch

For a fully custom UI, use `@epoch-protocol/epoch-flows-sdk` (re-exported from the widget package too): `EpochFlowsSDK`, `PaySession`, `EarnSession`. It exposes the same quote/submit/poll state machine as event emitters. See [reference/recipes.md](./reference/recipes.md#headless-sdk).
