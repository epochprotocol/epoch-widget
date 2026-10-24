# Graph Report - epoch-widget  (2026-09-16)

## Corpus Check
- 212 files · ~110,825 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1204 nodes · 2177 edges · 98 communities (74 shown, 22 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `23dc0036`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- use-pay-swap-engine.ts
- src/index.ts
- PaySwapIntentWidget.tsx
- compilerOptions
- dummy-lending-markets.ts
- MarketPickerPage.tsx
- useLatestRef
- MidenBridgePanel.tsx
- cn.ts
- dependencies
- SwapIntentSummary.tsx
- devDependencies
- epoch-bridge.ts
- EarnMainView.tsx
- EarnIntentWidget.tsx
- package.json
- devDependencies
- use-earn-market-picker.ts
- scripts
- SmartWithdrawDestination.tsx
- Recipes — copy-paste integrations
- Icons.tsx
- useMidenWalletAdapter.ts
- @epoch-protocol/epoch-flows-sdk
- WithdrawPanel.tsx
- dependencies
- AdvancedSurface.tsx
- App.tsx
- peerDependencies
- escrow.ts
- cn
- demo/package.json
- main.tsx
- EpochClassNames
- api.ts
- What You Must Do When Invoked
- What You Must Do When Invoked
- useIntentFlowStatus.ts
- What You Must Do When Invoked
- What You Must Do When Invoked
- vite-env.d.ts
- repository
- earn-cta.ts
- MidenQuoteCard.tsx
- MidenWalletsSection.tsx
- use-earn-engine.ts
- tsup
- use-source-selection.ts
- @epoch-protocol/epoch-intent-widget
- compilerOptions
- Integration Guide
- Explaining and configuring rules
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- Theming
- Epoch Intent Widget — demo app
- Mode: Pay
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- scripts
- Step 5 — Pick a mode
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
- .opencode/skills/graphify/references/extraction-spec.md
- exports
- publishConfig
- agent/skills/graphify/references/extraction-spec.md
- Amounts, tokens & chains

## God Nodes (most connected - your core abstractions)
1. `cn()` - 65 edges
2. `useEarnEngine()` - 23 edges
3. `@epoch-protocol/epoch-flows-sdk` - 20 edges
4. `EpochClassNames` - 20 edges
5. `@epoch-protocol/epoch-intent-widget` - 20 edges
6. `compilerOptions` - 17 edges
7. `usePaySwapEngine()` - 16 edges
8. `SolanaAdapter` - 16 edges
9. `scripts` - 15 edges
10. `Integration Guide` - 15 edges

## Surprising Connections (you probably didn't know these)
- `ChainSelector()` --calls--> `cn()`  [EXTRACTED]
  src/components/ChainSelector.tsx → src/lib/cn.ts
- `IntentProgressProps` --references--> `EpochClassNames`  [EXTRACTED]
  src/components/IntentProgress.tsx → src/types.ts
- `IntentSummary()` --calls--> `cn()`  [EXTRACTED]
  src/components/IntentSummary.tsx → src/lib/cn.ts
- `ChainChip()` --calls--> `cn()`  [EXTRACTED]
  src/components/TokenSelector.tsx → src/lib/cn.ts
- `SummaryContext` --references--> `EpochClassNames`  [EXTRACTED]
  src/pay/pay-swap-variants.tsx → src/types.ts

## Import Cycles
- None detected.

## Communities (98 total, 22 thin omitted)

### Community 0 - "use-pay-swap-engine.ts"
Cohesion: 0.18
Nodes (21): TokenWithChain, PaySwapIntentWidgetProps, PAY_SWAP_VARIANTS, PaySwapVariant, PaySwapVariantSpec, SummaryContext, DestinationSelection, PaySwapEngine (+13 more)

### Community 1 - "src/index.ts"
Cohesion: 0.18
Nodes (16): CHAIN_DOT, DEFAULT_TESTNET_API_BASE_URL, DEFAULT_TESTNET_POSITIONS_BASE_URL, DARK_THEME, DEFAULT_THEME, LIGHT_THEME, resolveTheme(), t (+8 more)

### Community 2 - "PaySwapIntentWidget.tsx"
Cohesion: 0.06
Nodes (37): EarnCtaButton(), EarnCtaButtonProps, EarnIntentWidget(), RetryIcon, NetworkBadge(), PayIntentWidget(), PayIntentWidgetProps, CTA_TONE_CLASSES (+29 more)

### Community 3 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib (+11 more)

### Community 4 - "dummy-lending-markets.ts"
Cohesion: 0.13
Nodes (16): buildConfigForChain(), buildMarket(), DEPRECATED_DUMMY_LENDING_USDC_ADDRESS, DUMMY_LENDING_CHAIN_IDS, DUMMY_LENDING_CONFIGS, DUMMY_LENDING_DESTINATION_CHAIN_IDS, DUMMY_LENDING_SOURCE_EVM_CHAIN_IDS, DUMMY_LENDING_SUPPORTED_ADDRESSES (+8 more)

### Community 5 - "MarketPickerPage.tsx"
Cohesion: 0.09
Nodes (25): FAMILY_LABELS, fmtUsd(), LENDER_DOT, MarketRowCard(), Props, ALL_CHAINS, ALL_LENDERS, DEFAULT_CHAIN_IDS (+17 more)

### Community 6 - "useLatestRef"
Cohesion: 0.21
Nodes (11): useLatestRef(), useOnOpen(), toBigIntOrNull(), usePaySwapCallbacks(), UsePaySwapCallbacksOptions, UseSourceSelectionOptions, EpochIntentWidgetProps, IntentFlowStatus (+3 more)

### Community 7 - "MidenBridgePanel.tsx"
Cohesion: 0.24
Nodes (12): MidenExecutionStatus(), DEFAULT_SEPOLIA_CHAIN_ID_STR, useIntentFlowStatus(), EVM_EXPLORERS, explorerTxUrl(), MIDEN_CHAIN_ID, MIDENSCAN_BASE, midenscanNoteUrl() (+4 more)

### Community 8 - "cn.ts"
Cohesion: 0.10
Nodes (22): ChevronDownIcon, Card(), CardTone, Props, TONE_CLASSES, Pill(), PillSize, PillVariant (+14 more)

### Community 9 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, buffer, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-intent-widget, @epoch-protocol/epoch-intents-sdk, @miden-sdk/miden-sdk, @miden-sdk/miden-wallet-adapter-base, @miden-sdk/miden-wallet-adapter-react (+9 more)

### Community 10 - "SwapIntentSummary.tsx"
Cohesion: 0.11
Nodes (20): Avatar(), AvatarProps, EarnFlowPanel(), Props, ArrowDownIcon, ArrowDownUpIcon, ChevronRightIcon, LockIcon (+12 more)

### Community 11 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, typescript (+3 more)

### Community 12 - "epoch-bridge.ts"
Cohesion: 0.19
Nodes (17): MidenExecutionStatusProps, getMidenFaucetDecimals(), MIDEN_FAUCET_DECIMALS, toMapKey(), useEpochIntent(), UseMidenBridgeIntentOptions, buildCrossChainIntent(), buildEpochTaskDataParams() (+9 more)

### Community 13 - "EarnMainView.tsx"
Cohesion: 0.13
Nodes (18): Banner(), BannerProps, BannerVariant, VARIANT_CLASSES, GaslessSection(), GaslessSectionProps, AlertIcon, InfoIcon (+10 more)

### Community 14 - "EarnIntentWidget.tsx"
Cohesion: 0.08
Nodes (41): EarnMainView(), EarnMainViewProps, EarnWithdrawDetailView(), EarnWithdrawDetailViewProps, MidenAssetPicker(), MidenAssetPickerProps, NetworkToggle(), NetworkToggleProps (+33 more)

### Community 15 - "package.json"
Cohesion: 0.06
Nodes (30): bugs, description, files, homepage, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-intents-sdk, react, react-dom (+22 more)

### Community 16 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, lucide-react, npm-run-all, react, react-dom, tailwindcss, @tailwindcss/cli, @tanstack/react-query (+7 more)

### Community 17 - "use-earn-market-picker.ts"
Cohesion: 0.24
Nodes (13): useEarnConfigs(), useLendingPoolsPage(), earnChainIdsFor(), ALL_LENDERS, clientPage(), ClientPageParams, configsToRows(), familyOf() (+5 more)

### Community 18 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, build:css, build:js, demo, dev, dev:css, dev:js (+7 more)

### Community 19 - "SmartWithdrawDestination.tsx"
Cohesion: 0.24
Nodes (7): CSS_VARS_TO_MIRROR, Dropdown(), DropdownOption, DropdownProps, SmartWithdrawDestination(), SmartWithdrawDestinationProps, SECTION_LABEL

### Community 20 - "Recipes — copy-paste integrations"
Cohesion: 0.06
Nodes (29): Callback payloads, EpochIntentWidgetProps, IntentConfig, IntentProps, Notable exports, Props reference, Callbacks, CTA copy (+21 more)

### Community 21 - "Icons.tsx"
Cohesion: 0.12
Nodes (20): chainDotColor(), ChainSelector(), ChainSelectorProps, CheckIcon, ChevronLeftIcon, CloseIcon, HistoryToolbarIcon, IconCompatProps (+12 more)

### Community 22 - "useMidenWalletAdapter.ts"
Cohesion: 0.19
Nodes (11): MidenBridgeFields(), MidenBridgeFieldsProps, OutputToken, MidenWalletAsset, NormalizedMidenAccountId, resolveAccountId(), stripMidenIdDecorators(), useMidenWalletAdapter() (+3 more)

### Community 23 - "@epoch-protocol/epoch-flows-sdk"
Cohesion: 0.17
Nodes (3): @epoch-protocol/epoch-flows-sdk, EarnQuoteTarget, UseEarnQuoteTargetOptions

### Community 24 - "WithdrawPanel.tsx"
Cohesion: 0.20
Nodes (12): DOT_SIZE, dotStyle(), FilterDropdown(), FilterOption, Props, renderItem(), TRIGGER_SIZE, POSITIONS_LENDER_OPTIONS (+4 more)

### Community 25 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, clsx, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intents-sdk, tailwind-merge

### Community 26 - "AdvancedSurface.tsx"
Cohesion: 0.40
Nodes (4): Code(), Props, AdvancedSurface(), Props

### Community 27 - "App.tsx"
Cohesion: 0.05
Nodes (57): ADVANCED_TAB, App(), EARN_TAB, PAY_TAB, SWAP_TAB, useAdvancedFlag(), AppShell(), DemoNetwork (+49 more)

### Community 28 - "peerDependencies"
Cohesion: 0.29
Nodes (7): peerDependencies, lucide-react, react, react-dom, @tanstack/react-query, viem, wagmi

### Community 29 - "escrow.ts"
Cohesion: 0.18
Nodes (15): getPhantomProvider(), PhantomProvider, useDemoSolanaAdapter(), Window, ASSOCIATED_TOKEN_PROGRAM_ID, associatedTokenAddress(), bindingHashToBytes(), buildOpenEscrowTransaction() (+7 more)

### Community 30 - "cn"
Cohesion: 0.13
Nodes (19): GaslessEnableButton(), GaslessEnableButtonProps, GaslessToggle(), GaslessToggleProps, segmentClasses(), SparklesIcon, PositionRow(), Props (+11 more)

### Community 31 - "demo/package.json"
Cohesion: 0.10
Nodes (21): @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-intents-sdk, react, react-dom, tailwindcss, @tanstack/react-query, @types/react, @types/react-dom (+13 more)

### Community 32 - "main.tsx"
Cohesion: 0.17
Nodes (16): config, midenConfig, queryClient, isNonceLike(), MidenBridgeIntent, readNonce(), useMidenBridgeIntent(), createFeeConversionSalt() (+8 more)

### Community 33 - "EpochClassNames"
Cohesion: 0.26
Nodes (11): IntentSummaryProps, ModalProps, PayIntentSummaryProps, SwapIntentSummaryProps, WalletConnectorPanelProps, EarnIntentWidgetProps, UseEarnMarketPickerOptions, EpochTheme (+3 more)

### Community 34 - "api.ts"
Cohesion: 0.22
Nodes (10): ConfigsState, DEFAULT_EARN_CONFIGS, DEFAULT_POOL_CHAIN_IDS, filterConfigsByNetwork(), MarketsState, PoolsPageState, PositionsState, useEarnMarkets() (+2 more)

### Community 35 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 36 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 37 - "useIntentFlowStatus.ts"
Cohesion: 0.31
Nodes (5): TERMINAL_OK, isTerminal(), TERMINAL_STATUSES, useIntentTransactionStatus(), IntentFlowStatus

### Community 38 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 39 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 41 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

### Community 42 - "earn-cta.ts"
Cohesion: 0.32
Nodes (6): EarnCtaAction, EarnCtaState, isEarnCtaEnabled(), resolveEarnCta(), ResolveEarnCtaParams, base

### Community 43 - "MidenQuoteCard.tsx"
Cohesion: 0.67
Nodes (3): MidenQuoteCard(), MidenQuoteCardProps, formatQuoteTokenIn()

### Community 46 - "use-earn-engine.ts"
Cohesion: 0.15
Nodes (19): useUserPositions(), exceedsBalance(), positionWithdrawableRaw(), defaultSelection(), EarnSelection, EarnView, useEarnEngine(), useEarnQuoteTarget() (+11 more)

### Community 48 - "use-source-selection.ts"
Cohesion: 0.15
Nodes (21): getMidenChainTokens(), MIDEN_CHAIN, EarnSolana, EarnSolanaAsset, useEarnSolana(), UseEarnSolanaOptions, TokenPick, useTokenPick() (+13 more)

### Community 49 - "@epoch-protocol/epoch-intent-widget"
Cohesion: 0.12
Nodes (17): Callbacks & lifecycle, Contents, Demo app, @epoch-protocol/epoch-intent-widget, Exports, Full props reference, Headless escape hatch, Install (+9 more)

### Community 50 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module, moduleResolution (+7 more)

### Community 51 - "Integration Guide"
Cohesion: 0.13
Nodes (15): Bundler notes, Checklists, Contents, Integration Guide, Packaging notes, Prerequisites, Solana pay and swap, Step 1 — Install (+7 more)

### Community 52 - "Explaining and configuring rules"
Cohesion: 0.14
Nodes (12): Commands, Config shape, Decision guide, Educating the user, Explaining and configuring rules, Workflow, After making React code changes:, Command (+4 more)

### Community 53 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 54 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 55 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 56 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 57 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 58 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 59 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 60 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 61 - "Theming"
Cohesion: 0.33
Nodes (6): 1. Preset, 2. Token overrides (`EpochTheme`), 3. Per-slot class names (`classNames`), Advanced: CSS variables & portals, CTA copy, Theming

### Community 62 - "Epoch Intent Widget — demo app"
Cohesion: 0.40
Nodes (4): Environment, Epoch Intent Widget — demo app, Scripts, Where to copy from

### Community 63 - "Mode: Pay"
Cohesion: 0.40
Nodes (5): Flat props (simplest), Mode: Pay, Nested `intent` (full control), Pinning vs. picking the destination, Scoping the source side

### Community 64 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 65 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 66 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 67 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 68 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 69 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 70 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, typecheck

### Community 72 - "Step 5 — Pick a mode"
Cohesion: 0.50
Nodes (4): Earn, Pay, Step 5 — Pick a mode, Swap

### Community 73 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 74 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 75 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 76 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 77 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 78 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **566 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+561 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 628 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@epoch-protocol/epoch-flows-sdk` connect `@epoch-protocol/epoch-flows-sdk` to `src/index.ts`, `api.ts`, `MarketPickerPage.tsx`, `useLatestRef`, `SwapIntentSummary.tsx`, `use-earn-engine.ts`, `package.json`, `use-earn-market-picker.ts`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `EpochClassNames`, `PaySwapIntentWidget.tsx`, `src/index.ts`, `MarketPickerPage.tsx`, `cn.ts`, `SwapIntentSummary.tsx`, `EarnMainView.tsx`, `EarnIntentWidget.tsx`, `SmartWithdrawDestination.tsx`, `Icons.tsx`, `WithdrawPanel.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _566 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PaySwapIntentWidget.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05952380952380952 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `dummy-lending-markets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13071895424836602 - nodes in this community are weakly interconnected._