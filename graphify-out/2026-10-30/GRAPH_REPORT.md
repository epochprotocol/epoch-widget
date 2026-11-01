# Graph Report - epoch-widget  (2026-10-30)

## Corpus Check
- 227 files · ~113,180 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1280 nodes · 2328 edges · 106 communities (81 shown, 25 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f89e2b81`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EpochClassNames
- Modal.tsx
- PaySwapIntentWidget.tsx
- compilerOptions
- use-earn-market-picker.ts
- MarketPickerPage.tsx
- cn
- wagmi
- api.ts
- dependencies
- SwapIntentSummary.tsx
- devDependencies
- localSigner
- useMidenWalletAdapter.ts
- use-earn-intent-flow.ts
- package.json
- devDependencies
- useEarnMidenAdapter.ts
- scripts
- @epoch-protocol/epoch-intent-widget
- Recipes — copy-paste integrations
- main.tsx
- EarnSurface.tsx
- scenarios.ts
- SwapSurface.tsx
- dependencies
- AdvancedSurface.tsx
- MarketSelectButton.tsx
- peerDependencies
- earn/miden.ts
- Icons.tsx
- demo/package.json
- MidenBridgePanel.tsx
- App.tsx
- RuntimeApp.tsx
- rpc.ts
- What You Must Do When Invoked
- MidenBridgeFields.tsx
- What You Must Do When Invoked
- What You Must Do When Invoked
- vite-env.d.ts
- repository
- What You Must Do When Invoked
- SmartWithdrawDestination.tsx
- keywords
- react
- PaySurface.tsx
- EarnIntentWidget.tsx
- compilerOptions
- Explaining and configuring rules
- src/index.ts
- TokenSelector.tsx
- @miden-sdk/react
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
- WithdrawPanel.tsx
- agent/skills/graphify/references/extraction-spec.md
- @rainbow-me/rainbowkit
- sonner
- EpochIntentWidget.tsx
- viem
- wagmi
- Native ETH across Pay, Swap, and Earn
- @epoch-protocol/epoch-flows-sdk

## God Nodes (most connected - your core abstractions)
1. `react` - 81 edges
2. `cn()` - 65 edges
3. `useEarnEngine()` - 25 edges
4. `EpochClassNames` - 20 edges
5. `@epoch-protocol/epoch-intent-widget` - 19 edges
6. `compilerOptions` - 17 edges
7. `scripts` - 16 edges
8. `usePaySwapEngine()` - 16 edges
9. `wagmi` - 15 edges
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
- `ChainSelector()` --calls--> `cn()`  [EXTRACTED]
  src/components/ChainSelector.tsx → src/lib/cn.ts

## Import Cycles
- None detected.

## Communities (106 total, 25 thin omitted)

### Community 0 - "EpochClassNames"
Cohesion: 0.23
Nodes (11): Banner(), GaslessSection(), GaslessSectionProps, IntentProgress(), IntentProgressProps, PAY_SWAP_PROGRESS_STATUSES, ModalProps, PaySwapMainView() (+3 more)

### Community 1 - "Modal.tsx"
Cohesion: 0.27
Nodes (8): Modal(), DARK_THEME, DEFAULT_THEME, LIGHT_THEME, resolveTheme(), t, themeToCssVars(), VAR_MAP

### Community 2 - "PaySwapIntentWidget.tsx"
Cohesion: 0.06
Nodes (35): EarnCtaButton(), EarnCtaButtonProps, RetryIcon, NetworkBadge(), NetworkToggle(), NetworkToggleProps, segmentClasses(), PayIntentWidget() (+27 more)

### Community 3 - "compilerOptions"
Cohesion: 0.08
Nodes (25): ES2020, node_modules, compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules (+17 more)

### Community 4 - "use-earn-market-picker.ts"
Cohesion: 0.09
Nodes (30): useEarnConfigs(), useLendingPoolsPage(), buildConfigForChain(), buildMarket(), DEPRECATED_DUMMY_LENDING_USDC_ADDRESS, DUMMY_LENDING_CHAIN_IDS, DUMMY_LENDING_CONFIGS, DUMMY_LENDING_DESTINATION_CHAIN_IDS (+22 more)

### Community 5 - "MarketPickerPage.tsx"
Cohesion: 0.11
Nodes (23): ALL_CHAINS, ALL_LENDERS, DEFAULT_CHAIN_IDS, FAMILY_DISPLAY, FAMILY_DOT, familyOf(), KEEP_UPPER_LENDER_SEG, MarketPickerPage() (+15 more)

### Community 6 - "cn"
Cohesion: 0.09
Nodes (32): GaslessToggle(), GaslessToggleProps, segmentClasses(), ChevronDownIcon, SearchIcon, Card(), CardTone, Props (+24 more)

### Community 7 - "wagmi"
Cohesion: 0.27
Nodes (7): Props, LocalSignerDialog(), Props, LocalSignerForm(), Props, LocalSignerConnector, wagmi

### Community 8 - "api.ts"
Cohesion: 0.20
Nodes (11): ConfigsState, DEFAULT_EARN_CONFIGS, DEFAULT_POOL_CHAIN_IDS, filterConfigsByNetwork(), MarketsState, PoolsPageState, PositionsState, useEarnMarkets() (+3 more)

### Community 9 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-intent-widget, @epoch-protocol/epoch-intents-sdk, @miden-sdk/miden-sdk, @miden-sdk/miden-wallet-adapter-react, react, react-dom (+9 more)

### Community 10 - "SwapIntentSummary.tsx"
Cohesion: 0.11
Nodes (19): ArrowDownIcon, ArrowDownUpIcon, ChevronRightIcon, WalletIcon, CardData, IntentSummary(), IntentSummaryProps, PayIntentSummary() (+11 more)

### Community 11 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom (+13 more)

### Community 12 - "localSigner"
Cohesion: 0.25
Nodes (8): AppShell(), LocalSignerButton(), isLocalSignerConnector(), localSigner(), getChain(), getClient(), signingAccount(), setup()

### Community 13 - "useMidenWalletAdapter.ts"
Cohesion: 0.23
Nodes (10): NormalizedMidenAccountId, resolveAccountId(), stripMidenIdDecorators(), useMidenWalletAdapter(), UseMidenWalletAdapterResult, MIDEN_MAINNET_WALLET_NETWORK, MIDEN_TESTNET_WALLET_NETWORK, MidenAccountId (+2 more)

### Community 14 - "use-earn-intent-flow.ts"
Cohesion: 0.16
Nodes (20): EARN_MIDEN_EXTRA_FIELDS, buildSwapLegTaskInput(), createEarnIntentSdk(), EarnIntentFlowStatus, earnProtocolName(), EarnQuote, EarnQuoteInput, EarnSubmitInput (+12 more)

### Community 15 - "package.json"
Cohesion: 0.11
Nodes (18): bugs, description, exports, ./styles.css, files, homepage, dist, license (+10 more)

### Community 16 - "devDependencies"
Cohesion: 0.12
Nodes (17): npm-run-all, devDependencies, npm-run-all, tailwindcss, @tailwindcss/cli, tsup, tsx, @types/react (+9 more)

### Community 17 - "useEarnMidenAdapter.ts"
Cohesion: 0.48
Nodes (5): useEarnMidenAdapter(), createFeeConversionSalt(), Options, toAccountId(), useMidenP2IDNoteFactory()

### Community 18 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, build:css, build:js, demo, demo:dev, dev, dev:css (+8 more)

### Community 19 - "@epoch-protocol/epoch-intent-widget"
Cohesion: 0.04
Nodes (47): Bundler notes, Checklists, Contents, Earn, Integration Guide, Packaging notes, Pay, Prerequisites (+39 more)

### Community 20 - "Recipes — copy-paste integrations"
Cohesion: 0.06
Nodes (29): Callback payloads, EpochIntentWidgetProps, IntentConfig, IntentProps, Notable exports, Props reference, Callbacks, CTA copy (+21 more)

### Community 21 - "main.tsx"
Cohesion: 0.39
Nodes (5): bootScreenStyle, Bootstrap(), DEFAULT_MIDEN_MAINNET_RPC_URL, ensurePragmaMidenMainnetOracle(), MainnetOracleGraph

### Community 22 - "EarnSurface.tsx"
Cohesion: 0.17
Nodes (14): MultiSelectDropdown(), MultiSelectOption, Props, EARN_DEPOSIT_PROPS, EARN_WITHDRAW_PROPS, ScenarioProps, CHAIN_OPTIONS, EarnSurface() (+6 more)

### Community 23 - "scenarios.ts"
Cohesion: 0.16
Nodes (11): Badge(), toneClass, Props, ScenarioCard(), BASE_SEPOLIA_USDC, OP_SEPOLIA_USDC, PAY_SCENARIOS, Scenario (+3 more)

### Community 24 - "SwapSurface.tsx"
Cohesion: 0.23
Nodes (9): EditableField(), Props, SectionLabel(), SWAP_SCENARIOS, SWAP_TESTNET_SCENARIOS, applyEdits(), editsFromScenario(), IntentEdits (+1 more)

### Community 25 - "dependencies"
Cohesion: 0.18
Nodes (11): clsx, dependencies, clsx, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intents-sdk, tailwind-merge, @epoch-protocol/epoch-commons-sdk (+3 more)

### Community 26 - "AdvancedSurface.tsx"
Cohesion: 0.40
Nodes (4): Code(), Props, AdvancedSurface(), Props

### Community 27 - "MarketSelectButton.tsx"
Cohesion: 0.17
Nodes (11): FAMILY_LABELS, fmtUsd(), LENDER_DOT, MarketRowCard(), Props, TrendingUpIcon, Props, ACCENT_PALETTE (+3 more)

### Community 28 - "peerDependencies"
Cohesion: 0.12
Nodes (16): lucide-react, lucide-react, react, react-dom, @tanstack/react-query, wagmi, react, react-dom (+8 more)

### Community 29 - "earn/miden.ts"
Cohesion: 0.21
Nodes (13): MidenAssetPicker(), MidenAssetPickerProps, getMidenGraphTokens(), isDefaultMidenFaucet(), midenFaucetKey(), MidenGraphToken, EarnMiden, MidenAsset (+5 more)

### Community 30 - "Icons.tsx"
Cohesion: 0.10
Nodes (20): BannerProps, BannerVariant, VARIANT_CLASSES, ChainSelector(), ChainSelectorProps, GaslessEnableButton(), GaslessEnableButtonProps, AlertIcon (+12 more)

### Community 31 - "demo/package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, typecheck, type, version

### Community 32 - "MidenBridgePanel.tsx"
Cohesion: 0.06
Nodes (51): BASE_MAINNET_USDC, baseUsdc, MIDEN_MAINNET, midenUsdcx, midenUsdg, resolveEpochApiBaseUrl(), ViteApiEnvironment, getApiBaseUrl() (+43 more)

### Community 33 - "App.tsx"
Cohesion: 0.18
Nodes (12): ADVANCED_TAB, App(), AppProps, EARN_TAB, PAY_TAB, rpcUrls, SWAP_TAB, useAdvancedFlag() (+4 more)

### Community 34 - "RuntimeApp.tsx"
Cohesion: 0.29
Nodes (5): MIDEN_TESTNET, config, { connectors }, queryClient, rpcUrls

### Community 35 - "rpc.ts"
Cohesion: 0.21
Nodes (9): DEMO_RPC_PATHS, getBaseRpcUrl(), getDemoChains(), getDemoRpcUrls(), INFURA_NETWORKS, demoRequire, intentsMidenAssets, intentsRequire (+1 more)

### Community 36 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 37 - "MidenBridgeFields.tsx"
Cohesion: 0.50
Nodes (4): MidenBridgeFields(), MidenBridgeFieldsProps, OutputToken, MidenWalletAsset

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

### Community 43 - "SmartWithdrawDestination.tsx"
Cohesion: 0.28
Nodes (6): CSS_VARS_TO_MIRROR, Dropdown(), DropdownOption, DropdownProps, SmartWithdrawDestination(), SmartWithdrawDestinationProps

### Community 48 - "keywords"
Cohesion: 0.40
Nodes (5): keywords, cross-chain, epoch, intent, widget

### Community 49 - "react"
Cohesion: 0.06
Nodes (61): react, TokenWithChain, exceedsBalance(), positionWithdrawableRaw(), EarnCtaAction, EarnCtaState, isEarnCtaEnabled(), resolveEarnCta() (+53 more)

### Community 50 - "PaySurface.tsx"
Cohesion: 0.22
Nodes (10): NETWORK_TABS, Props, Row(), PAY_TESTNET_SCENARIOS, applyEdits(), Edits, editsFromScenario(), FlatEdits (+2 more)

### Community 51 - "EarnIntentWidget.tsx"
Cohesion: 0.27
Nodes (9): EarnMainView(), EarnMainViewProps, EarnWithdrawDetailView(), EarnWithdrawDetailViewProps, EARN_PROGRESS_STATUSES, WithdrawDetailPanel(), WithdrawPanel(), DEFAULT_MIDEN_FAUCET (+1 more)

### Community 52 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 53 - "Explaining and configuring rules"
Cohesion: 0.14
Nodes (12): Commands, Config shape, Decision guide, Educating the user, Explaining and configuring rules, Workflow, After making React code changes:, Command (+4 more)

### Community 54 - "src/index.ts"
Cohesion: 0.16
Nodes (12): EarnIntentWidgetProps, EarnQuoteTarget, useEarnQuoteTarget(), UseEarnQuoteTargetOptions, DEFAULT_TESTNET_API_BASE_URL, DEFAULT_TESTNET_POSITIONS_BASE_URL, ApiConfig, EarnMidenAsset (+4 more)

### Community 55 - "TokenSelector.tsx"
Cohesion: 0.14
Nodes (15): CHAIN_DOT, chainDotColor(), Avatar(), AvatarProps, EarnFlowPanel(), Props, CloseIcon, LockIcon (+7 more)

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

### Community 97 - "WithdrawPanel.tsx"
Cohesion: 0.18
Nodes (11): PositionRow(), Props, FRACTIONS, WithdrawAmountCard(), WithdrawAmountCardProps, POSITIONS_LENDER_OPTIONS, POSITIONS_MAINNET_CHAIN_OPTIONS, POSITIONS_TESTNET_CHAIN_OPTIONS (+3 more)

### Community 101 - "EpochIntentWidget.tsx"
Cohesion: 0.21
Nodes (10): EarnIntentWidget(), SwapIntentWidget(), SwapIntentWidgetProps, WalletConnectorPanel(), WalletConnectorPanelProps, EpochIntentWidget(), UsePaySwapCallbacksOptions, UseSourceSelectionOptions (+2 more)

### Community 104 - "Native ETH across Pay, Swap, and Earn"
Cohesion: 0.33
Nodes (5): Approach, Behavior, Intent and scope, Native ETH across Pay, Swap, and Earn, Validation and limits

## Knowledge Gaps
- **553 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+548 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `EpochClassNames`, `Modal.tsx`, `PaySwapIntentWidget.tsx`, `use-earn-market-picker.ts`, `MarketPickerPage.tsx`, `cn`, `wagmi`, `api.ts`, `SwapIntentSummary.tsx`, `useMidenWalletAdapter.ts`, `use-earn-intent-flow.ts`, `useEarnMidenAdapter.ts`, `main.tsx`, `EarnSurface.tsx`, `scenarios.ts`, `SwapSurface.tsx`, `AdvancedSurface.tsx`, `MarketSelectButton.tsx`, `earn/miden.ts`, `Icons.tsx`, `MidenBridgePanel.tsx`, `App.tsx`, `RuntimeApp.tsx`, `MidenBridgeFields.tsx`, `SmartWithdrawDestination.tsx`, `keywords`, `PaySurface.tsx`, `src/index.ts`, `TokenSelector.tsx`, `EpochIntentWidget.tsx`?**
  _High betweenness centrality (0.246) - this node is a cross-community bridge._
- **Why does `keywords` connect `keywords` to `react`, `rpc.ts`, `wagmi`, `package.json`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `wagmi` connect `wagmi` to `MidenBridgePanel.tsx`, `RuntimeApp.tsx`, `EpochIntentWidget.tsx`, `localSigner`, `keywords`, `react`, `PaySurface.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _553 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PaySwapIntentWidget.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06280193236714976 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `use-earn-market-picker.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08912655971479501 - nodes in this community are weakly interconnected._