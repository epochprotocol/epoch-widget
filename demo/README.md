# Epoch Intent Widget — demo app

This directory is a **reference shell** for integrators. The product you ship to partners is the **`epoch-intent-widget`** package (`../`), which exports `EpochIntentWidget` and types. This Vite app shows how to:

- **Pay** — map static or dynamic “scenarios” to `intent` props and open the widget.
- **Earn** — collect amount + market selection, show an APR-only yield preview, then open the widget with a vault-style deposit intent.
- **Advanced** — Miden → EVM bridge (optional; not required for typical EVM integrations).

## Scripts

```bash
pnpm install
pnpm dev          # Vite dev server
pnpm run build    # Production bundle
pnpm run typecheck
```

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_EPOCH_API_BASE_URL` | Epoch allocator / API base URL (default `http://0.0.0.0:3000`) |
| `VITE_ALLOCATOR_URL` | Fallback if `VITE_EPOCH_API_BASE_URL` is unset |
| `VITE_MIDENSCAN_URL` | Optional Miden explorer base (Advanced tab) |

## Where to copy from

| Path | Use |
|------|-----|
| [`src/pay/scenarios.ts`](src/pay/scenarios.ts) | Example `intent` payloads for Pay |
| [`src/earn/`](src/earn/) | Market list, search filter, APR preview, `buildEarnDepositProps` |
| [`src/app/App.tsx`](src/app/App.tsx) | Wiring `EpochIntentWidget` + `api.baseUrl` + callbacks |

Earn markets are **static demo data** in [`src/earn/earnMarkets.ts`](src/earn/earnMarkets.ts). Replace with your allocator when you have a real endpoint.
