# Graph Report - epoch-widget  (2026-10-29)

## Corpus Check
- 226 files · ~112,869 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1276 nodes · 2311 edges · 106 communities (80 shown, 26 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f89e2b81`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- use-pay-swap-engine.ts
- src/index.ts
- PaySwapIntentWidget.tsx
- compilerOptions
- api.ts
- MarketPickerPage.tsx
- cn
- miden-mainnet.ts
- cn.ts
- dependencies
- SwapIntentSummary.tsx
- devDependencies
- DemoNetwork
- useMidenWalletAdapter.ts
- use-earn-intent-flow.ts
- package.json
- devDependencies
- useMidenBridgeIntent.ts
- scripts
- @epoch-protocol/epoch-intent-widget
- Recipes — copy-paste integrations
- WithdrawPanel.tsx
- EarnSurface.tsx
- SwapSurface.tsx
- PaySurface.tsx
- dependencies
- MidenExecutionStatus.tsx
- MarketSelectButton.tsx
- peerDependencies
- use-source-selection.ts
- Icons.tsx
- demo/package.json
- useEpochIntent.ts
- App.tsx
- EarnFlowPanel.tsx
- RuntimeApp.tsx
- What You Must Do When Invoked
- MidenBridgePanel.tsx
- What You Must Do When Invoked
- What You Must Do When Invoked
- vite-env.d.ts
- repository
- What You Must Do When Invoked
- WithdrawDetailPanel.tsx
- useIntentFlowStatus.ts
- use-earn-engine.ts
- AppShell.tsx
- AdvancedSurface.tsx
- compilerOptions
- Explaining and configuring rules
- earn/miden.ts
- use-earn-quote-target.ts
- use-gasless-wallet-check.ts
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- Epoch Intent Widget — demo app
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- viem
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- Native ETH Implementation Plan
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify.js
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- .claude/skills/graphify/references/extraction-spec.md
- .codex/skills/graphify/references/extraction-spec.md
- chains.ts
- .opencode/skills/graphify/references/extraction-spec.md
- @miden-sdk/miden-wallet-adapter-base
- @miden-sdk/react
- agent/skills/graphify/references/extraction-spec.md
- @rainbow-me/rainbowkit
- sonner
- react
- viem
- wagmi
- Native ETH across Pay, Swap, and Earn
- @epoch-protocol/epoch-commons-sdk

## God Nodes (most connected - your core abstractions)
1. `react` - 80 edges
2. `cn()` - 65 edges
3. `useEarnEngine()` - 25 edges
4. `EpochClassNames` - 20 edges
5. `@epoch-protocol/epoch-intent-widget` - 19 edges
6. `compilerOptions` - 17 edges
7. `scripts` - 16 edges
8. `wagmi` - 15 edges
9. `usePaySwapEngine()` - 15 edges
10. `compilerOptions` - 14 edges

## Surprising Connections (you probably didn't know these)
- `MainnetMidenProbe()` --calls--> `useEarnEngine()`  [EXTRACTED]
  test/earn-miden-mainnet.test.tsx → src/earn/use-earn-engine.ts
- `Probe()` --calls--> `useEarnEngine()`  [EXTRACTED]
  test/earn-miden-mainnet.test.tsx → src/earn/use-earn-engine.ts
- `Probe()` --calls--> `useEarnIntentFlow()`  [EXTRACTED]
  test/earn-withdraw-origin.test.tsx → src/earn/use-earn-intent-flow.ts
- `PrivateMidenDestinationProbe()` --calls--> `useEarnMiden()`  [EXTRACTED]
  test/earn-miden-mainnet.test.tsx → src/earn/use-earn-miden.ts
- `UseMidenBridgeIntentOptions` --references--> `CrossChainIntentParams`  [EXTRACTED]
  demo/src/miden/hooks/useMidenBridgeIntent.ts → demo/src/miden/types/miden.ts

## Import Cycles
- None detected.

## Communities (106 total, 26 thin omitted)

### Community 0 - "use-pay-swap-engine.ts"
Cohesion: 0.26
Nodes (14): UseGaslessWalletResult, PaySwapVariantSpec, DestinationSelection, PaySwapEngine, PLACEHOLDER_INTENT, PaySwapMiden, PaySwapMidenDest, PaySwapMidenSource (+6 more)

### Community 1 - "src/index.ts"
Cohesion: 0.06
Nodes (50): Banner(), EarnMainView(), EarnMainViewProps, EarnWithdrawDetailView(), EarnWithdrawDetailViewProps, EarnFlowPanel(), EarnIntentWidget(), GaslessSection() (+42 more)

### Community 2 - "PaySwapIntentWidget.tsx"
Cohesion: 0.06
Nodes (35): EarnCtaButton(), EarnCtaButtonProps, RetryIcon, NetworkBadge(), NetworkToggle(), NetworkToggleProps, segmentClasses(), CTA_TONE_CLASSES (+27 more)

### Community 3 - "compilerOptions"
Cohesion: 0.08
Nodes (25): ES2020, node_modules, compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules (+17 more)

### Community 4 - "api.ts"
Cohesion: 0.07
Nodes (40): ConfigsState, DEFAULT_EARN_CONFIGS, DEFAULT_POOL_CHAIN_IDS, filterConfigsByNetwork(), MarketsState, PoolsPageState, PositionsState, useEarnConfigs() (+32 more)

### Community 5 - "MarketPickerPage.tsx"
Cohesion: 0.14
Nodes (16): ALL_CHAINS, ALL_LENDERS, DEFAULT_CHAIN_IDS, FAMILY_DISPLAY, FAMILY_DOT, familyOf(), KEEP_UPPER_LENDER_SEG, MarketPickerPage() (+8 more)

### Community 6 - "cn"
Cohesion: 0.12
Nodes (19): CSS_VARS_TO_MIRROR, Dropdown(), DropdownOption, DropdownProps, GaslessToggle(), GaslessToggleProps, segmentClasses(), CheckIcon (+11 more)

### Community 7 - "miden-mainnet.ts"
Cohesion: 0.18
Nodes (9): BASE_MAINNET_USDC, baseUsdc, MIDEN_MAINNET, midenUsdcx, midenUsdg, resolveEpochApiBaseUrl(), ViteApiEnvironment, getApiBaseUrl() (+1 more)

### Community 8 - "cn.ts"
Cohesion: 0.11
Nodes (19): ChevronDownIcon, Card(), CardTone, Props, TONE_CLASSES, Pill(), PillSize, PillVariant (+11 more)

### Community 9 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intent-widget, @epoch-protocol/epoch-intents-sdk, @miden-sdk/miden-sdk, @miden-sdk/miden-wallet-adapter-react, react, react-dom (+9 more)

### Community 10 - "SwapIntentSummary.tsx"
Cohesion: 0.14
Nodes (14): ArrowDownIcon, ArrowDownUpIcon, ChevronRightIcon, WalletIcon, CardData, IntentSummary(), IntentSummaryProps, PayIntentSummaryProps (+6 more)

### Community 11 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom (+13 more)

### Community 12 - "DemoNetwork"
Cohesion: 0.67
Nodes (3): DemoNetwork, Props, Props

### Community 13 - "useMidenWalletAdapter.ts"
Cohesion: 0.17
Nodes (12): MidenBridgeFields(), MidenBridgeFieldsProps, OutputToken, MidenWalletAsset, NormalizedMidenAccountId, resolveAccountId(), stripMidenIdDecorators(), UseMidenWalletAdapterOptions (+4 more)

### Community 14 - "use-earn-intent-flow.ts"
Cohesion: 0.16
Nodes (20): EARN_MIDEN_EXTRA_FIELDS, buildSwapLegTaskInput(), createEarnIntentSdk(), EarnIntentFlowStatus, earnProtocolName(), EarnQuote, EarnQuoteInput, EarnSubmitInput (+12 more)

### Community 15 - "package.json"
Cohesion: 0.11
Nodes (18): bugs, description, exports, ./styles.css, files, homepage, dist, license (+10 more)

### Community 16 - "devDependencies"
Cohesion: 0.12
Nodes (17): npm-run-all, devDependencies, npm-run-all, tailwindcss, @tailwindcss/cli, tsup, tsx, @types/react (+9 more)

### Community 17 - "useMidenBridgeIntent.ts"
Cohesion: 0.24
Nodes (11): useEarnMidenAdapter(), isNonceLike(), MidenBridgeIntent, readNonce(), useMidenBridgeIntent(), UseMidenBridgeIntentOptions, createFeeConversionSalt(), Options (+3 more)

### Community 18 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, build:css, build:js, demo, demo:dev, dev, dev:css (+8 more)

### Community 19 - "@epoch-protocol/epoch-intent-widget"
Cohesion: 0.04
Nodes (47): Bundler notes, Checklists, Contents, Earn, Integration Guide, Packaging notes, Pay, Prerequisites (+39 more)

### Community 20 - "Recipes — copy-paste integrations"
Cohesion: 0.06
Nodes (29): Callback payloads, EpochIntentWidgetProps, IntentConfig, IntentProps, Notable exports, Props reference, Callbacks, CTA copy (+21 more)

### Community 21 - "WithdrawPanel.tsx"
Cohesion: 0.20
Nodes (12): DOT_SIZE, dotStyle(), FilterDropdown(), FilterOption, Props, renderItem(), TRIGGER_SIZE, POSITIONS_LENDER_OPTIONS (+4 more)

### Community 22 - "EarnSurface.tsx"
Cohesion: 0.20
Nodes (12): MultiSelectDropdown(), MultiSelectOption, Props, EARN_DEPOSIT_PROPS, EARN_WITHDRAW_PROPS, ScenarioProps, CHAIN_OPTIONS, KEEP_UPPER (+4 more)

### Community 23 - "SwapSurface.tsx"
Cohesion: 0.17
Nodes (12): BASE_SEPOLIA_USDC, OP_SEPOLIA_USDC, PAY_SCENARIOS, SHARED_CTA_LABELS, SWAP_INITIAL_INTENT, SWAP_SCENARIOS, SWAP_TESTNET_INITIAL_INTENT, SWAP_TESTNET_SCENARIOS (+4 more)

### Community 24 - "PaySurface.tsx"
Cohesion: 0.21
Nodes (10): EditableField(), Props, SectionLabel(), PAY_TESTNET_SCENARIOS, applyEdits(), Edits, editsFromScenario(), FlatEdits (+2 more)

### Community 25 - "dependencies"
Cohesion: 0.18
Nodes (11): clsx, dependencies, clsx, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intents-sdk, tailwind-merge, @epoch-protocol/epoch-commons-sdk (+3 more)

### Community 26 - "MidenExecutionStatus.tsx"
Cohesion: 0.29
Nodes (9): MidenExecutionStatus(), MidenExecutionStatusProps, EVM_EXPLORERS, explorerTxUrl(), MIDEN_CHAIN_ID, MIDENSCAN_BASE, midenscanNoteUrl(), truncateHash() (+1 more)

### Community 27 - "MarketSelectButton.tsx"
Cohesion: 0.16
Nodes (14): CHAIN_DOT, chainDotColor(), FAMILY_LABELS, fmtUsd(), LENDER_DOT, MarketRowCard(), Props, TrendingUpIcon (+6 more)

### Community 28 - "peerDependencies"
Cohesion: 0.12
Nodes (16): lucide-react, lucide-react, react, react-dom, @tanstack/react-query, wagmi, react, react-dom (+8 more)

### Community 29 - "use-source-selection.ts"
Cohesion: 0.14
Nodes (14): TokenWithChain, getMidenChainTokens(), MIDEN_CHAIN, TokenPick, useTokenPick(), resolveDefaultSource(), TokenOnChain, DEFAULT_DEST_CHAIN_ID (+6 more)

### Community 30 - "Icons.tsx"
Cohesion: 0.11
Nodes (16): BannerProps, BannerVariant, VARIANT_CLASSES, GaslessEnableButton(), GaslessEnableButtonProps, AlertIcon, CloseIcon, HistoryToolbarIcon (+8 more)

### Community 31 - "demo/package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, typecheck, type, version

### Community 32 - "useEpochIntent.ts"
Cohesion: 0.30
Nodes (11): useEpochIntent(), buildCrossChainIntent(), buildEpochTaskDataParams(), CrossChainQuote, getCrossChainQuote(), normalizeMidenIdToHex(), IMPORTANT: integer strings (e.g. "1099993") are base units and must use, CrossChainIntentParams (+3 more)

### Community 33 - "App.tsx"
Cohesion: 0.22
Nodes (9): ADVANCED_TAB, App(), EARN_TAB, PAY_TAB, rpcUrls, SWAP_TAB, useAdvancedFlag(), EarnSurface() (+1 more)

### Community 34 - "EarnFlowPanel.tsx"
Cohesion: 0.22
Nodes (9): Avatar(), AvatarProps, ChainSelector(), ChainSelectorProps, Props, ChevronLeftIcon, LockIcon, TokenChainPill() (+1 more)

### Community 35 - "RuntimeApp.tsx"
Cohesion: 0.06
Nodes (38): LocalSignerButton(), Props, LocalSignerDialog(), Props, LocalSignerForm(), Props, DEMO_RPC_PATHS, getBaseRpcUrl() (+30 more)

### Community 36 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 37 - "MidenBridgePanel.tsx"
Cohesion: 0.19
Nodes (12): MidenQuoteCard(), MidenQuoteCardProps, MidenWalletsSection(), MidenWalletsSectionProps, getMidenFaucetDecimals(), isMidenMainnetUsdcx(), toMapKey(), BASE_TOKENS (+4 more)

### Community 38 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 39 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 41 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

### Community 42 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 43 - "WithdrawDetailPanel.tsx"
Cohesion: 0.14
Nodes (13): PositionRow(), Props, SmartWithdrawDestination(), SmartWithdrawDestinationProps, FRACTIONS, WithdrawAmountCard(), WithdrawAmountCardProps, WithdrawFromCard() (+5 more)

### Community 48 - "useIntentFlowStatus.ts"
Cohesion: 0.29
Nodes (6): TERMINAL_OK, useIntentFlowStatus(), isTerminal(), TERMINAL_STATUSES, useIntentTransactionStatus(), IntentFlowStatus

### Community 49 - "use-earn-engine.ts"
Cohesion: 0.14
Nodes (19): useUserPositions(), exceedsBalance(), positionWithdrawableRaw(), EarnCtaAction, EarnCtaState, isEarnCtaEnabled(), resolveEarnCta(), ResolveEarnCtaParams (+11 more)

### Community 50 - "AppShell.tsx"
Cohesion: 0.21
Nodes (9): AppShell(), NETWORK_TABS, Props, Badge(), toneClass, Row(), Props, ScenarioCard() (+1 more)

### Community 51 - "AdvancedSurface.tsx"
Cohesion: 0.40
Nodes (4): Code(), Props, AdvancedSurface(), Props

### Community 52 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 53 - "Explaining and configuring rules"
Cohesion: 0.14
Nodes (12): Commands, Config shape, Decision guide, Educating the user, Explaining and configuring rules, Workflow, After making React code changes:, Command (+4 more)

### Community 54 - "earn/miden.ts"
Cohesion: 0.15
Nodes (19): MidenAssetPicker(), MidenAssetPickerProps, DEFAULT_MIDEN_FAUCET, getMidenGraphTokens(), isDefaultMidenFaucet(), midenFaucetKey(), MidenGraphToken, EarnMiden (+11 more)

### Community 56 - "use-gasless-wallet-check.ts"
Cohesion: 0.67
Nodes (3): useGaslessWallet(), useGaslessWalletCheck(), UseGaslessWalletParams

### Community 57 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 58 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 59 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 60 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 61 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 62 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 63 - "Epoch Intent Widget — demo app"
Cohesion: 0.33
Nodes (5): Environment, Epoch Intent Widget — demo app, Local EVM signer, Scripts, Where to copy from

### Community 64 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 65 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 66 - "viem"
Cohesion: 0.67
Nodes (3): viem, viem, viem

### Community 67 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 68 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 69 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 70 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 71 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 72 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 73 - "Native ETH Implementation Plan"
Cohesion: 0.25
Nodes (7): Global Constraints, Native ETH Implementation Plan, Review Focus, Task 1: Native ETH registry and balance reading, Task 2: Native collateral in Pay, Swap, and Earn, Task 3: Widget integration and documentation, Verification

### Community 74 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 75 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 76 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 77 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 78 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 79 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 101 - "react"
Cohesion: 0.27
Nodes (8): react, useLatestRef(), useOnOpen(), toBigIntOrNull(), usePaySwapCallbacks(), IntentFlowStatus, UseIntentFlowParams, UseIntentFlowReturn

### Community 104 - "Native ETH across Pay, Swap, and Earn"
Cohesion: 0.33
Nodes (5): Approach, Behavior, Intent and scope, Native ETH across Pay, Swap, and Earn, Validation and limits

## Knowledge Gaps
- **555 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+550 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `use-pay-swap-engine.ts`, `src/index.ts`, `PaySwapIntentWidget.tsx`, `api.ts`, `MarketPickerPage.tsx`, `cn`, `cn.ts`, `SwapIntentSummary.tsx`, `useMidenWalletAdapter.ts`, `use-earn-intent-flow.ts`, `useMidenBridgeIntent.ts`, `WithdrawPanel.tsx`, `EarnSurface.tsx`, `SwapSurface.tsx`, `PaySurface.tsx`, `MarketSelectButton.tsx`, `use-source-selection.ts`, `Icons.tsx`, `useEpochIntent.ts`, `App.tsx`, `EarnFlowPanel.tsx`, `RuntimeApp.tsx`, `MidenBridgePanel.tsx`, `WithdrawDetailPanel.tsx`, `useIntentFlowStatus.ts`, `use-earn-engine.ts`, `AppShell.tsx`, `AdvancedSurface.tsx`, `earn/miden.ts`, `use-earn-quote-target.ts`, `use-gasless-wallet-check.ts`?**
  _High betweenness centrality (0.247) - this node is a cross-community bridge._
- **Why does `keywords` connect `RuntimeApp.tsx` to `react`, `package.json`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _555 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06252587991718427 - nodes in this community are weakly interconnected._
- **Should `PaySwapIntentWidget.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06376811594202898 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._