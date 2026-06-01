# Recipes — copy-paste integrations

All examples assume the providers + CSS from [setup.md](./setup.md) are in place and `baseUrl` is your allocator URL.

## Pay — flat props (simplest)

Plain "send token to address". Registry tokens need no symbol/decimals.

```tsx
<EpochIntentWidget
  isOpen={open}
  onClose={close}
  api={{ baseUrl }}
  mode="pay"
  title="Send USDC"
  submitButtonText="Send"
  toAddress="0x4235215114484bACDfF0071dB54Dc9faaD3489a9"
  toAmount="0.15"                                       // decimal string
  toChainId={8453}
  toToken="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  // toTokenSymbol="USDC" toTokenDecimals={6}           // only for non-registry tokens
/>
```

## Pay — nested intent (custom protocol interaction)

For mint / buy-ticket / vault-deposit etc. `requiredAmount` is a **bigint, atomic units**.

```tsx
<EpochIntentWidget
  isOpen={open}
  onClose={close}
  api={{ baseUrl }}
  title="Buy raffle ticket"
  submitButtonText="Buy ticket"
  intent={{
    requiredToken: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', decimals: 6 },
    requiredAmount: 5_000_000n,           // 5 USDC
    destinationChainName: 'Base',
    positionLabel: '1 Raffle Ticket',     // shown in the summary
    config: {
      protocol: 'raffles',                // non-simple protocol → protocol interaction
      action: 'buyTicket',
      fixedOutput: true,                  // deliver exactly requiredAmount; user pays quoted input
      destinationChainId: 8453,
      extraDataTypestring: 'address raffleAddress,uint256 numberOfTickets',
      extraData: { raffleAddress: '0x0000000000000000000000000000000000000001', numberOfTickets: '1' },
    },
  }}
/>
```

Source-side scoping (optional): `sourceChainIds={[8453,42161]}`, `defaultSourceChainId={8453}`, `defaultSourceTokenAddress="0x…"`, `sourceTokenFilter={(t) => t.symbol !== 'DAI'}`.
Let user re-pick the destination: `lockDestinationToken={false}` (pay only; forced off in swap).

## Swap — both sides pickable

```tsx
<EpochIntentWidget
  isOpen={open}
  onClose={close}
  api={{ baseUrl }}
  mode="swap"
  title="Swap"
  usdPriceFor={({ symbol }) => (symbol === 'USDC' ? 1 : null)}  // optional "≈ $…" line
  intent={{
    requiredToken: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', decimals: 6 },
    requiredAmount: 1_000_000n,
    destinationChainName: 'Base',
    config: { protocol: 'swap', action: 'swap', fixedOutput: true, destinationChainId: 8453 },
  }}
/>
```

> `protocol: 'swap'` (or `'transfer'`/`'bridge'`) routes through the solver's simple token-in→token-out path. Any other string = custom protocol interaction.

## Earn — static configs (zero backend)

```tsx
import { EpochIntentWidget, HARDCODED_ONEDELTA_CONFIGS } from '@epoch-protocol/epoch-intent-widget';

<EpochIntentWidget
  isOpen={open}
  onClose={close}
  api={{ baseUrl }}
  mode="earn"
  earnDefaultTab="deposit"
  earnMarketsSource={HARDCODED_ONEDELTA_CONFIGS}
  title="Earn"
/>
```

## Earn — live data

```tsx
<EpochIntentWidget
  isOpen={open}
  onClose={close}
  api={{ baseUrl, positionsBaseUrl: 'https://positions.example.com' }}
  mode="earn"
  earnChainIds={[1, 8453, 42161]}        // fan /pools over these (default [1,8453,42161,10,137])
  earnLenderFilter="AAVE_V3,MORPHO"      // CSV of 1delta lender keys
  earnPoolsSortBy="totalDepositsUsd"     // default
  earnPoolsSortDir="DESC"                // default
/>
```

Earn is mainnet-only — hide it when `network === 'testnet'`.

## Theming

```tsx
// Preset
theme="dark"

// Token overrides (rest fall back to light defaults)
theme={{ colorPrimary: '#16a34a', colorPrimaryHover: '#15803d', radiusLg: '16px', fontFamily: "'Inter', sans-serif" }}

// Per-slot class overrides (Tailwind / vanilla / modules) — providing a class skips that slot's default styles
classNames={{
  container: 'bg-white shadow-2xl rounded-2xl max-w-md',
  button: 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold',
  overlay: 'backdrop-blur-sm',
}}
```

Slots: `overlay, container, header, body, footer, receiveCard, receiveAmount, receiveLabel, payCard, payAmount, payLabel, button, chainSelector, tokenSelector, banner, progress`.

## CTA copy

```tsx
ctaLabels={{ submit: 'Confirm swap', quoting: 'Pricing…', signing: 'Approve in wallet', submitting: 'Sending intent…', polling: 'Settling on-chain…', complete: 'All done' }}
```

## Callbacks

```tsx
<EpochIntentWidget
  /* … */
  onStart={({ sessionId, mode }) => {}}
  onSign={({ sessionId }) => {}}
  onSuccess={({ nonce, status }) => {}}        // settled on-chain
  onError={({ error }) => {}}
  onStatus={({ status, progress, activeStep }) => {}}  // every transition
  onIntentSent={({ nonce }) => {}}             // submitted, pre-settle
  onIntentComplete={({ nonce, status }) => {}}
  onQuote={({ payAmount, payAmountRaw, error }) => {}}  // fixedOutput intents
  onSourceTokenChange={({ chainId, tokenAddress }) => {}}
/>
```

Lifecycle: `idle → submitting → sent → polling → complete` (or `error`). Modal auto-closes shortly after success; `onSuccess` fires first.

## Testnet

```tsx
network="testnet"
allowNetworkToggle   // optional in-widget toggle
// in the intent config use destinationTestnetChainId instead of destinationChainId
```

## Headless SDK

No widget UI — drive the flow yourself. Re-exported from the widget package, or install `@epoch-protocol/epoch-flows-sdk` directly.

```tsx
import { EpochFlowsSDK } from '@epoch-protocol/epoch-intent-widget'; // or '@epoch-protocol/epoch-flows-sdk'
import { useWalletClient, useAccount } from 'wagmi';

const sdk = new EpochFlowsSDK({ apiBaseUrl: baseUrl });

const { address } = useAccount();
const { data: walletClient } = useWalletClient();

const session = sdk.createPaySession({
  walletClient, address, sessionId: crypto.randomUUID(),
  mode: 'pay',
  requiredToken: { address: '0x8335…2913', symbol: 'USDC', decimals: 6 },
  requiredAmount: 5_000_000n,
  isTestnet: false,
  intentConfig: { protocol: 'transfer', action: 'pay', fixedOutput: true, destinationChainId: 8453 },
});

const unsub = session.on('statusChange', (s) => console.log(s)); // .on() returns an unsubscribe fn
session.on('success', ({ nonce }) => {});
await session.submit({ sourceChainId: 42161, sourceToken });
// cleanup: unsub(); session.dispose();
```

`EarnSession` is analogous (`createEarnSession` + `quote()`/`submit()`). Always `dispose()` on teardown — sessions hold polling intervals. Full SDK docs: `@epoch-protocol/epoch-flows-sdk` README.
