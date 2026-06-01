# Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| Widget renders unstyled / no layout | Missing `import '@epoch-protocol/epoch-intent-widget/styles.css'` at the app root. |
| "must wrap … in WagmiProvider" or no connectors listed | No `WagmiProvider`, or zero connectors configured in the wagmi config. Add at least one (`injected()` or RainbowKit/Web3Modal). |
| React Query / `QueryClient` error on mount | Missing `QueryClientProvider`. wagmi v2 requires it. |
| "Unknown destination token. Pass `toTokenDecimals`…" | Flat-pay token isn't in the built-in registry. Pass `toTokenDecimals` and `toTokenSymbol`. |
| Earn picker empty or shows only static rows | Live markets need `api.positionsBaseUrl`. Without it Earn uses bundled `HARDCODED_ONEDELTA_CONFIGS`. |
| Earn tab missing on testnet | Expected — Earn is mainnet-only (1delta doesn't index testnet pools). |
| Quote returns below the displayed amount | Normal for cross-chain/cross-token routes. Tune `intent.config.slippageBps` (default `100` = 1%; `0` = strict pinning). |
| Theme tokens missing inside the modal | Modal is portalled. Project tokens onto `:root` via `themeToCssVars` (see [setup.md](./setup.md#theming-portals)). |
| Amount is wildly wrong (e.g. 1000000 USDC) | Mixed unit conventions. Flat `toAmount` = decimal string; `intent.requiredAmount` = bigint atomic units. |
| Wrong chain in testnet | Use `network="testnet"` AND `destinationTestnetChainId` in the intent config (not `destinationChainId`). |
| Destination token can't be changed in pay | By design (`lockDestinationToken` defaults `true`). Set `false` to allow re-pick. |
| Custom protocol routed as a plain swap | `protocol` is `'transfer'/'swap'/'bridge'` (simple route). Use a different protocol string for a protocol interaction. |
| Headless session keeps polling after unmount | Call `session.dispose()` on teardown — sessions hold polling/progress intervals. |
