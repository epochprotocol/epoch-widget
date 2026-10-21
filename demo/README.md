# Epoch Intent Widget — demo app

This directory is a **standalone reference shell** for integrators. It depends on the published **`@epoch-protocol/epoch-intent-widget`** npm package, which exports `EpochIntentWidget` and types. This Vite app shows how to:

- **Pay** — map static or dynamic “scenarios” to `intent` props and open the widget.
- **Earn** — collect amount + market selection, show an APR-only yield preview, then open the widget with a vault-style deposit intent.
- **Advanced** — Miden → EVM bridge (optional; not required for typical EVM integrations).

## Local EVM signer

The demo header offers **Local signer** beside **Connect Wallet**. Enter a development account's private key (64 hexadecimal characters, with or without `0x`) and select an EVM network. Disconnect an existing wallet first. The signer connects through the demo's Wagmi configuration, so the unchanged widget can use it in Pay, Swap, and Earn.

The masked input clears on submission. Keys stay in page memory and are forgotten on disconnect or reload; cached clients lose signing authority on disconnect. Local signing happens without extension confirmation popups. All signer code lives under `demo/` and is excluded from the published widget package.

Run the signer tests from the repository root with `node --import tsx --test demo/test/local-signer.test.ts`.

## Scripts

```bash
pnpm install
pnpm dev          # Vite dev server
pnpm run build    # Production bundle
pnpm run typecheck
```

## Environment

Copy `.env.example` to `.env`, then set the local service URLs as needed.

| Variable                        | Purpose                                                            |
| ------------------------------- | ------------------------------------------------------------------ |
| `VITE_EPOCH_API_BASE_URL`       | Epoch allocator / API base URL (default same-origin `/allocator`)  |
| `VITE_MIDEN_RPC_URL`            | Optional Miden mainnet RPC override (default Cedar from Flows SDK) |
| `VITE_MIDEN_NOTE_TRANSPORT_URL` | Optional wallet note transport override                            |
| Miden explorer                  | Midenscan mainnet from Flows SDK                                   |

## Where to copy from

| Path                                           | Use                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| [`src/pay/scenarios.ts`](src/pay/scenarios.ts) | Example `intent` payloads for Pay                                |
| [`src/earn/`](src/earn/)                       | Market list, search filter, APR preview, `buildEarnDepositProps` |
| [`src/app/App.tsx`](src/app/App.tsx)           | Wiring `EpochIntentWidget` + `api.baseUrl` + callbacks           |

Earn markets are **static demo data** in [`src/earn/earnMarkets.ts`](src/earn/earnMarkets.ts). Replace with your allocator when you have a real endpoint.
