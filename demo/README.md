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
| `VITE_EPOCH_API_BASE_URL`       | Local allocator: `http://localhost:3000`; forwards to SIO on port 8080 |
| `VITE_EARN_SOLVER_URL`          | Local 1delta adapter: `http://localhost:3011` |
| `VITE_POSITIONS_API_BASE_URL`   | Local 1delta positions API: `http://localhost:4023` |
| `VITE_TESTNET_API_BASE_URL`     | Local testnet allocator: `http://localhost:3000` |
| `VITE_TESTNET_POSITIONS_API_BASE_URL` | Local dummy-lending positions API: `http://localhost:4024` |
| `VITE_MIDEN_RPC_URL`            | Optional Miden mainnet RPC override (default Cedar from Flows SDK) |
| `VITE_MIDEN_NOTE_TRANSPORT_URL` | Mainnet note transport (default `https://transport.cedar.miden.io`) |
| `VITE_ANKR_API_KEY`            | Optional Ankr Base RPC key; without it, Base uses public `https://mainnet.base.org` |
| `INFURA_API_KEY`              | Server-only base64 `key:secret` credential in ignored `.env.local`; enables Infura for all configured EVM chains |
| Miden explorer                  | Midenscan mainnet from Flows SDK                                   |

Open `http://localhost:5175/widget/` for the local demo. The service URLs above target local processes; the blockchain RPC and note transport URLs still target Cedar/Base so mainnet asset and position data remain available. Start the local backend services before requesting an Earn quote. Testing a mainnet deposit still requires an explicit wallet transaction.

## Where to copy from

With `INFURA_API_KEY` set, Wagmi, wallet chain metadata, and widget balance reads
share `/widget/rpc/*` endpoints for Ethereum, Base, Optimism, Polygon, Arbitrum,
and the configured Sepolia networks. The Vite dev/preview server adds Infura
authentication; the browser receives only relative paths. Static hosting needs
an equivalent server proxy. Miden keeps its native RPC, and Robinhood requires
its own public RPCs (mainnet `4663`, testnet `46630`) because this Infura
configuration does not support it. Set `VITE_ROBINHOOD_RPC_URL` or
`VITE_ROBINHOOD_TESTNET_RPC_URL` to override them. Both networks are available
in wallet switching and the local signer, and in the widget's chain/token pickers.
Mainnet offers USDG, USDe and WETH; testnet offers the graph's test tokens.

Miden mainnet includes USDG (6 decimals), faucet
`mm1ar7rgznnerajt52p9ul6rltd8g039qsa`, in the Pay/Swap and Earn token pickers.
The Advanced bridge remains the Base USDC/USDCX example.

| Path                                           | Use                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| [`src/pay/scenarios.ts`](src/pay/scenarios.ts) | Example `intent` payloads for Pay                                |
| [`src/earn/`](src/earn/)                       | Market list, search filter, APR preview, `buildEarnDepositProps` |
| [`src/app/App.tsx`](src/app/App.tsx)           | Wiring `EpochIntentWidget` + `api.baseUrl` + callbacks           |

Earn markets are **static demo data** in [`src/earn/earnMarkets.ts`](src/earn/earnMarkets.ts). Replace with your allocator when you have a real endpoint.
