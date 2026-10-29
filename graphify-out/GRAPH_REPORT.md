# Graph Report - epoch-widget  (2026-10-29)

## Corpus Check
- 223 files · ~111,676 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1261 nodes · 2298 edges · 104 communities (79 shown, 25 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `60016d04`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- use-pay-swap-engine.ts
- src/index.ts
- PaySwapIntentWidget.tsx
- compilerOptions
- api.ts
- MarketPickerPage.tsx
- SmartWithdrawDestination.tsx
- EpochClassNames
- ui/index.ts
- dependencies
- react
- devDependencies
- SwapSurface.tsx
- useMidenWalletAdapter.ts
- use-earn-intent-flow.ts
- package.json
- devDependencies
- useMidenBridgeIntent.ts
- scripts
- @epoch-protocol/epoch-intent-widget
- Recipes — copy-paste integrations
- FilterDropdown.tsx
- EarnSurface.tsx
- scenarios.ts
- PaySurface.tsx
- dependencies
- cn
- MarketSelectButton.tsx
- peerDependencies
- use-source-selection.ts
- Icons.tsx
- demo/package.json
- useEpochIntent.ts
- App.tsx
- TokenSelector.tsx
- RuntimeApp.tsx
- What You Must Do When Invoked
- MidenBridgePanel.tsx
- What You Must Do When Invoked
- What You Must Do When Invoked
- vite-env.d.ts
- repository
- What You Must Do When Invoked
- WithdrawPanel.tsx
- miden-mainnet.ts
- use-earn-engine.ts
- ScenarioCard.tsx
- AdvancedSurface.tsx
- compilerOptions
- Explaining and configuring rules
- earn/miden.ts
- use-earn-quote-target.ts
- epoch-config.ts
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
- @epoch-protocol/epoch-flows-sdk
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
- useLatestRef
- viem
- wagmi

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
- `ChainSelector()` --calls--> `cn()`  [EXTRACTED]
  src/components/ChainSelector.tsx → src/lib/cn.ts

## Import Cycles
- None detected.

## Communities (104 total, 25 thin omitted)

### Community 0 - "use-pay-swap-engine.ts"
Cohesion: 0.18
Nodes (18): TokenWithChain, UseGaslessWalletResult, PaySwapIntentWidgetProps, PaySwapVariantSpec, DestinationSelection, PaySwapEngine, PLACEHOLDER_INTENT, usePaySwapEngine() (+10 more)

### Community 1 - "src/index.ts"
Cohesion: 0.12
Nodes (25): EarnIntentWidget(), Modal(), ModalProps, WalletConnectorPanel(), WalletConnectorPanelProps, EarnIntentWidgetProps, UseEarnMarketPickerOptions, EpochIntentWidget() (+17 more)

### Community 2 - "PaySwapIntentWidget.tsx"
Cohesion: 0.06
Nodes (40): EarnCtaButton(), EarnCtaButtonProps, MidenAssetPicker(), MidenAssetPickerProps, RetryIcon, NetworkBadge(), NetworkToggle(), NetworkToggleProps (+32 more)

### Community 3 - "compilerOptions"
Cohesion: 0.08
Nodes (25): ES2020, node_modules, compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules (+17 more)

### Community 4 - "api.ts"
Cohesion: 0.07
Nodes (39): ConfigsState, DEFAULT_EARN_CONFIGS, DEFAULT_POOL_CHAIN_IDS, filterConfigsByNetwork(), MarketsState, PoolsPageState, PositionsState, useEarnConfigs() (+31 more)

### Community 5 - "MarketPickerPage.tsx"
Cohesion: 0.12
Nodes (18): ALL_CHAINS, ALL_LENDERS, DEFAULT_CHAIN_IDS, FAMILY_DISPLAY, FAMILY_DOT, familyOf(), KEEP_UPPER_LENDER_SEG, MarketPickerPage() (+10 more)

### Community 6 - "SmartWithdrawDestination.tsx"
Cohesion: 0.18
Nodes (10): ChainSelector(), ChainSelectorProps, CSS_VARS_TO_MIRROR, Dropdown(), DropdownOption, DropdownProps, CheckIcon, SearchIcon (+2 more)

### Community 7 - "EpochClassNames"
Cohesion: 0.11
Nodes (22): EarnMainView(), EarnMainViewProps, EarnWithdrawDetailView(), EarnWithdrawDetailViewProps, GaslessSection(), GaslessSectionProps, EARN_PROGRESS_STATUSES, IntentProgress() (+14 more)

### Community 8 - "ui/index.ts"
Cohesion: 0.12
Nodes (17): ChevronDownIcon, Card(), CardTone, Props, TONE_CLASSES, Pill(), PillSize, PillVariant (+9 more)

### Community 9 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-intent-widget, @epoch-protocol/epoch-intents-sdk, @miden-sdk/miden-sdk, @miden-sdk/miden-wallet-adapter-react, react, react-dom (+9 more)

### Community 10 - "react"
Cohesion: 0.13
Nodes (17): react, ArrowDownIcon, ArrowDownUpIcon, ChevronRightIcon, WalletIcon, CardData, IntentSummary(), PayIntentSummary() (+9 more)

### Community 11 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom (+13 more)

### Community 12 - "SwapSurface.tsx"
Cohesion: 0.23
Nodes (9): EditableField(), Props, SectionLabel(), SWAP_TESTNET_SCENARIOS, applyEdits(), editsFromScenario(), IntentEdits, Props (+1 more)

### Community 13 - "useMidenWalletAdapter.ts"
Cohesion: 0.13
Nodes (14): BASE_MAINNET_USDC, MidenBridgeFields(), MidenBridgeFieldsProps, OutputToken, MidenWalletAsset, NormalizedMidenAccountId, resolveAccountId(), stripMidenIdDecorators() (+6 more)

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
Cohesion: 0.27
Nodes (10): useEarnMidenAdapter(), isNonceLike(), MidenBridgeIntent, readNonce(), useMidenBridgeIntent(), createFeeConversionSalt(), Options, toAccountId() (+2 more)

### Community 18 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, build:css, build:js, demo, demo:dev, dev, dev:css (+8 more)

### Community 19 - "@epoch-protocol/epoch-intent-widget"
Cohesion: 0.04
Nodes (47): Bundler notes, Checklists, Contents, Earn, Integration Guide, Packaging notes, Pay, Prerequisites (+39 more)

### Community 20 - "Recipes — copy-paste integrations"
Cohesion: 0.06
Nodes (29): Callback payloads, EpochIntentWidgetProps, IntentConfig, IntentProps, Notable exports, Props reference, Callbacks, CTA copy (+21 more)

### Community 21 - "FilterDropdown.tsx"
Cohesion: 0.31
Nodes (8): SparklesIcon, DOT_SIZE, dotStyle(), FilterDropdown(), FilterOption, Props, renderItem(), TRIGGER_SIZE

### Community 22 - "EarnSurface.tsx"
Cohesion: 0.20
Nodes (12): MultiSelectDropdown(), MultiSelectOption, Props, EARN_DEPOSIT_PROPS, EARN_WITHDRAW_PROPS, ScenarioProps, CHAIN_OPTIONS, KEEP_UPPER (+4 more)

### Community 23 - "scenarios.ts"
Cohesion: 0.20
Nodes (8): BASE_SEPOLIA_USDC, OP_SEPOLIA_USDC, PAY_SCENARIOS, PAY_TESTNET_SCENARIOS, SHARED_CTA_LABELS, SWAP_INITIAL_INTENT, SWAP_SCENARIOS, SWAP_TESTNET_INITIAL_INTENT

### Community 24 - "PaySurface.tsx"
Cohesion: 0.31
Nodes (8): DemoNetwork, applyEdits(), Edits, editsFromScenario(), FlatEdits, IntentEdits, PaySurface(), Props

### Community 25 - "dependencies"
Cohesion: 0.18
Nodes (11): clsx, dependencies, clsx, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intents-sdk, tailwind-merge, @epoch-protocol/epoch-commons-sdk (+3 more)

### Community 26 - "cn"
Cohesion: 0.17
Nodes (14): GaslessEnableButton(), GaslessEnableButtonProps, GaslessToggle(), GaslessToggleProps, segmentClasses(), Props, Stat(), SmartWithdrawToggle() (+6 more)

### Community 27 - "MarketSelectButton.tsx"
Cohesion: 0.20
Nodes (11): FAMILY_LABELS, fmtUsd(), LENDER_DOT, MarketRowCard(), Props, TrendingUpIcon, Props, ACCENT_PALETTE (+3 more)

### Community 28 - "peerDependencies"
Cohesion: 0.12
Nodes (16): lucide-react, lucide-react, react, react-dom, @tanstack/react-query, wagmi, react, react-dom (+8 more)

### Community 29 - "use-source-selection.ts"
Cohesion: 0.27
Nodes (8): TokenPick, useTokenPick(), resolveDefaultSource(), TokenOnChain, UsePaySwapCallbacksOptions, useSourceSelection(), UseSourceSelectionOptions, EpochIntentWidgetProps

### Community 30 - "Icons.tsx"
Cohesion: 0.15
Nodes (13): Banner(), BannerProps, BannerVariant, VARIANT_CLASSES, AlertIcon, ChevronLeftIcon, CloseIcon, HistoryToolbarIcon (+5 more)

### Community 31 - "demo/package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, typecheck, type, version

### Community 32 - "useEpochIntent.ts"
Cohesion: 0.18
Nodes (17): MidenExecutionStatusProps, MidenQuoteCard(), MidenQuoteCardProps, useEpochIntent(), UseMidenBridgeIntentOptions, buildCrossChainIntent(), buildEpochTaskDataParams(), CrossChainQuote (+9 more)

### Community 33 - "App.tsx"
Cohesion: 0.21
Nodes (10): ADVANCED_TAB, App(), EARN_TAB, PAY_TAB, rpcUrls, SWAP_TAB, useAdvancedFlag(), getApiBaseUrl() (+2 more)

### Community 34 - "TokenSelector.tsx"
Cohesion: 0.15
Nodes (14): CHAIN_DOT, chainDotColor(), Avatar(), AvatarProps, EarnFlowPanel(), Props, LockIcon, MarketSelectButton() (+6 more)

### Community 35 - "RuntimeApp.tsx"
Cohesion: 0.06
Nodes (41): AppShell(), NETWORK_TABS, Props, LocalSignerButton(), Props, LocalSignerDialog(), Props, LocalSignerForm() (+33 more)

### Community 36 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 37 - "MidenBridgePanel.tsx"
Cohesion: 0.16
Nodes (18): MIDEN_MAINNET, MidenExecutionStatus(), MidenWalletsSection(), MidenWalletsSectionProps, getMidenFaucetDecimals(), isMidenMainnetUsdcx(), toMapKey(), useIntentFlowStatus() (+10 more)

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

### Community 43 - "WithdrawPanel.tsx"
Cohesion: 0.16
Nodes (11): PositionRow(), Props, FRACTIONS, WithdrawAmountCardProps, WithdrawFromCardProps, POSITIONS_LENDER_OPTIONS, POSITIONS_MAINNET_CHAIN_OPTIONS, POSITIONS_TESTNET_CHAIN_OPTIONS (+3 more)

### Community 48 - "miden-mainnet.ts"
Cohesion: 0.17
Nodes (10): baseUsdc, midenUsdcx, midenUsdg, resolveEpochApiBaseUrl(), ViteApiEnvironment, TERMINAL_OK, isTerminal(), TERMINAL_STATUSES (+2 more)

### Community 49 - "use-earn-engine.ts"
Cohesion: 0.12
Nodes (22): useUserPositions(), exceedsBalance(), positionWithdrawableRaw(), EarnCtaAction, EarnCtaState, isEarnCtaEnabled(), resolveEarnCta(), ResolveEarnCtaParams (+14 more)

### Community 50 - "ScenarioCard.tsx"
Cohesion: 0.31
Nodes (6): Badge(), toneClass, Row(), Props, ScenarioCard(), Scenario

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
Cohesion: 0.17
Nodes (16): DEFAULT_MIDEN_FAUCET, getMidenChainTokens(), getMidenGraphTokens(), isDefaultMidenFaucet(), MIDEN_CHAIN, midenFaucetKey(), MidenGraphToken, EarnMiden (+8 more)

### Community 55 - "use-earn-quote-target.ts"
Cohesion: 0.33
Nodes (3): EarnQuoteTarget, useEarnQuoteTarget(), UseEarnQuoteTargetOptions

### Community 56 - "epoch-config.ts"
Cohesion: 0.50
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

### Community 101 - "useLatestRef"
Cohesion: 0.29
Nodes (7): useLatestRef(), useOnOpen(), toBigIntOrNull(), usePaySwapCallbacks(), IntentFlowStatus, UseIntentFlowParams, UseIntentFlowReturn

## Knowledge Gaps
- **546 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+541 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `use-pay-swap-engine.ts`, `src/index.ts`, `PaySwapIntentWidget.tsx`, `api.ts`, `MarketPickerPage.tsx`, `SmartWithdrawDestination.tsx`, `EpochClassNames`, `ui/index.ts`, `SwapSurface.tsx`, `useMidenWalletAdapter.ts`, `use-earn-intent-flow.ts`, `useMidenBridgeIntent.ts`, `FilterDropdown.tsx`, `EarnSurface.tsx`, `PaySurface.tsx`, `cn`, `MarketSelectButton.tsx`, `use-source-selection.ts`, `Icons.tsx`, `useEpochIntent.ts`, `App.tsx`, `TokenSelector.tsx`, `RuntimeApp.tsx`, `MidenBridgePanel.tsx`, `miden-mainnet.ts`, `use-earn-engine.ts`, `ScenarioCard.tsx`, `AdvancedSurface.tsx`, `earn/miden.ts`, `use-earn-quote-target.ts`, `epoch-config.ts`, `useLatestRef`?**
  _High betweenness centrality (0.250) - this node is a cross-community bridge._
- **Why does `keywords` connect `RuntimeApp.tsx` to `react`, `package.json`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _546 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `PaySwapIntentWidget.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05520614954577219 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._