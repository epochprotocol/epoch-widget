# Native ETH Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Support native ETH as a source and destination across widget Pay, Swap, Earn deposits, and Earn Smart Withdraw when routes allow it.

**Architecture:** Add native ETH entries to the shared `epoch-flows-sdk` token registry and branch on the zero-address sentinel for balance reads and flow submission. Build task data with explicit source/destination token addresses, and pass native collateral state independently to quote and solve. The widget consumes the same registry and balance API, preserving WETH and Miden behavior.

**Tech Stack:** TypeScript, React, viem, Epoch Flows SDK, Epoch Intents SDK.

**Spec:** `docs/superpowers/specs/2026-10-29-native-eth-design.md`

## Global Constraints

- Native ETH uses the zero-address sentinel and 18 decimals.
- WETH remains a separate ERC-20 asset; Polygon native currency and Miden ETH are not reclassified as EVM ETH.
- Native EVM balance reads use `eth_getBalance`; ERC-20 reads retain `balanceOf`.
- Native source submits value-bearing Compact deposits with no ERC-20 approvals.
- Destination token choice remains independent of whether the source collateral is native.

## Review Focus

- ETH source to ERC-20 destination: quote and signed mandate must retain the ERC-20 output address.
- ERC-20 source to ETH destination: destination remains zero-address while ERC-20 approvals continue.
- ETH-to-ETH: source requires native collateral and output remains native.
- Miden zero-address sentinels: Miden funding must not be mistaken for native EVM ETH.
- Native balance read failure: loading/error behavior remains the existing nullable balance behavior.

---

### Task 1: Native ETH registry and balance reading

**Files:**
- Modify: `../epoch-flows-sdk/src/config/tokens.ts`
- Modify: `../epoch-flows-sdk/src/chain/balances.ts`
- Test: `../epoch-flows-sdk/test/native-eth.test.ts`

**Interfaces:**
- Produces `NATIVE_ETH_ADDRESS = "0x0000000000000000000000000000000000000000"` exported by `config/tokens.ts`.
- Registry contains one `ETH` token per supported ETH-native EVM chain/testnet; Polygon and Miden excluded.

- [ ] Write registry and native-balance tests; assert ETH metadata and `getBalance` path, with ERC-20 still using `readContract`.
- [ ] Run the focused SDK test and confirm it fails.
- [ ] Add ETH registry entries and branch `fetchTokenBalanceOnChain` on the zero-address sentinel.
- [ ] Run the focused SDK test and SDK typecheck.

### Task 2: Native collateral in Pay, Swap, and Earn

**Files:**
- Modify: `../epoch-flows-sdk/src/flows/pay/session.ts`
- Modify: `../epoch-flows-sdk/src/flows/earn/session.ts`
- Test: `../epoch-flows-sdk/test/native-eth.test.ts`

**Interfaces:**
- Consumes `NATIVE_ETH_ADDRESS` from Task 1.
- `isNative` for quote/solve reflects the source deposit token; task data is built with `isNative: false` and explicit token addresses.

- [ ] Add Pay quote/task-parameter cases for native source with ERC-20 output, and ERC-20 source with native output.
- [ ] Add Earn deposit cases for native source and Smart Withdraw native output.
- [ ] Run the focused SDK tests and confirm they fail on current behavior.
- [ ] Implement source-native detection for quote and submit, and retain output token sentinels independently.
- [ ] Run the focused SDK tests and SDK typecheck.

### Task 3: Widget integration and documentation

**Files:**
- Modify: `README.md`
- Test: `test/native-eth.test.tsx`
- Existing: `src/pay/use-source-selection.ts`, `src/pay/use-destination-selection.ts`, `src/earn/use-earn-engine.ts`, `src/components/withdraw/SmartWithdrawDestination.tsx`

**Interfaces:**
- Consumes registry and balance behavior from Tasks 1–2; picker entries remain ordinary `EpochToken` values.

- [ ] Add widget tests that ETH is offered on ETH-native supported chains, WETH remains available, and Polygon/Miden are not relabeled as native ETH.
- [ ] Run the focused widget test and confirm it fails.
- [ ] Document native ETH source/destination, payable deposit, and route availability behavior.
- [ ] Run focused widget tests, SDK and widget typechecks/builds, and demo production build.

## Verification

- SDK: `pnpm --dir ../epoch-flows-sdk test` and `pnpm --dir ../epoch-flows-sdk typecheck`.
- Widget: `pnpm test`, `pnpm typecheck`, `pnpm build`, and `pnpm --dir demo build`.
- The linked SDK must be rebuilt before the widget consumes it.

