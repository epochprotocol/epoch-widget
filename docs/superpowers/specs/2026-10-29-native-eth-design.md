# Native ETH across Pay, Swap, and Earn

## Intent and scope

Allow users to select and spend their wallet's native ETH in Pay, Swap, and Earn deposits, and receive native ETH through Pay, Swap, and Earn Smart Withdraw when the route supports it. This covers the widget and its existing local `epoch-flows-sdk` dependency. Route availability continues to come from the allocator and solver.

## Approach

Extend the shared SDK's native-token handling and reuse the existing Intents SDK native Compact deposit implementation. A widget-only token-list change would expose ETH without making balances or submissions work. Automatically wrapping ETH into WETH would add an extra transaction and would not provide native ETH delivery. The shared SDK approach is recommended because all three flows already use it.

## Behavior

- Register ETH with 18 decimals and the zero-address sentinel on supported ETH-native EVM networks and their testnets. Keep WETH separately selectable. Polygon's native currency is not ETH; Miden's ETH faucet remains a distinct asset.
- Read native balances with `eth_getBalance`; retain ERC-20 balance reads for contract tokens.
- Preserve source and destination token identities independently in quotes and signed mandates, including ETH-to-ERC-20 and ERC-20-to-ETH routes. Build task data with `isNative: false` and explicit zero-address token sentinels, then pass the source-token native flag separately to quote and solve so native source collateral uses the payable deposit path without zeroing an ERC-20 destination.
- Send native source funds through the existing payable Compact deposit path, without ERC-20 allowance or approval calls. Retain the SDK's wallet and gasless capability handling.
- Add native ETH to Earn funding and Smart Withdraw token choices, respecting existing chain and route restrictions. Ordinary withdrawals retain the market's underlying asset.
- Document native-token configuration and add regression coverage for ETH metadata, balances, quote and submit payloads, ERC-20 destinations, and Miden isolation.

## Validation and limits

Run both SDK and widget tests and typechecks, build the SDK and widget, and verify the demo build with the refreshed local dependency. Tests must exercise native quote/submission behavior and show that ERC-20 and Miden flows retain their token identities. No live transaction, deployment, publishing, or change to solver-supported routes is part of this work. Native ETH still requires the wallet's normal gas funding rules.
