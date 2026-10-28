# Graph Report - epoch-widget  (2026-10-26)

## Corpus Check
- 222 files · ~110,555 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1231 nodes · 2170 edges · 98 communities (73 shown, 21 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `29f8427e`
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
- Icons.tsx
- cn.ts
- dependencies
- EpochClassNames
- devDependencies
- epoch-bridge.ts
- miden-mainnet.ts
- use-earn-intent-flow.ts
- package.json
- devDependencies
- useMidenWalletAdapter.ts
- scripts
- @epoch-protocol/epoch-intent-widget
- Recipes — copy-paste integrations
- WithdrawPanel.tsx
- EarnSurface.tsx
- App.tsx
- PaySurface.tsx
- dependencies
- SwapSurface.tsx
- MarketRowCard.tsx
- peerDependencies
- MidenExecutionStatus.tsx
- TokenSelector.tsx
- demo/package.json
- useMidenBridgeIntent.ts
- AdvancedSurface.tsx
- useIntentFlowStatus.ts
- AppShell.tsx
- What You Must Do When Invoked
- MidenBridgePanel.tsx
- What You Must Do When Invoked
- What You Must Do When Invoked
- vite-env.d.ts
- repository
- What You Must Do When Invoked
- ScenarioCard.tsx
- tsup
- EpochIntentWidget.tsx
- use-earn-engine.ts
- RuntimeApp.tsx
- vite.config.ts
- compilerOptions
- Explaining and configuring rules
- earn/miden.ts
- EarnIntentWidget.tsx
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- Epoch Intent Widget — demo app
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- scripts
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
- exports
- publishConfig
- agent/skills/graphify/references/extraction-spec.md

## God Nodes (most connected - your core abstractions)
1. `cn()` - 65 edges
2. `useEarnEngine()` - 24 edges
3. `EpochClassNames` - 20 edges
4. `@epoch-protocol/epoch-intent-widget` - 19 edges
5. `compilerOptions` - 17 edges
6. `scripts` - 16 edges
7. `usePaySwapEngine()` - 15 edges
8. `compilerOptions` - 14 edges
9. `Integration Guide` - 14 edges
10. `useEarnIntentFlow()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `MainnetMidenProbe()` --calls--> `useEarnEngine()`  [EXTRACTED]
  test/earn-miden-mainnet.test.tsx → src/earn/use-earn-engine.ts
- `Probe()` --calls--> `useEarnIntentFlow()`  [EXTRACTED]
  test/earn-withdraw-origin.test.tsx → src/earn/use-earn-intent-flow.ts
- `PrivateMidenDestinationProbe()` --calls--> `useEarnMiden()`  [EXTRACTED]
  test/earn-miden-mainnet.test.tsx → src/earn/use-earn-miden.ts
- `MidenExecutionStatusProps` --references--> `IntentResult`  [EXTRACTED]
  demo/src/miden/components/MidenExecutionStatus.tsx → demo/src/miden/types/miden.ts
- `UseMidenBridgeIntentOptions` --references--> `CrossChainIntentParams`  [EXTRACTED]
  demo/src/miden/hooks/useMidenBridgeIntent.ts → demo/src/miden/types/miden.ts

## Import Cycles
- None detected.

## Communities (98 total, 21 thin omitted)

### Community 0 - "use-pay-swap-engine.ts"
Cohesion: 0.16
Nodes (20): useEffectiveGasless(), usePropOverride(), PaySwapIntentWidgetProps, PaySwapVariantSpec, DestinationSelection, useDestinationSelection(), PaySwapEngine, PLACEHOLDER_INTENT (+12 more)

### Community 1 - "src/index.ts"
Cohesion: 0.11
Nodes (26): ChevronLeftIcon, CloseIcon, PoweredIcon, Modal(), ModalProps, WalletConnectorPanel(), WalletConnectorPanelProps, EarnIntentWidgetProps (+18 more)

### Community 2 - "PaySwapIntentWidget.tsx"
Cohesion: 0.06
Nodes (35): EarnCtaButton(), EarnCtaButtonProps, RetryIcon, NetworkBadge(), NetworkToggle(), NetworkToggleProps, segmentClasses(), PayIntentWidget() (+27 more)

### Community 3 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib (+11 more)

### Community 4 - "api.ts"
Cohesion: 0.07
Nodes (39): ConfigsState, DEFAULT_EARN_CONFIGS, DEFAULT_POOL_CHAIN_IDS, filterConfigsByNetwork(), MarketsState, PoolsPageState, PositionsState, useEarnConfigs() (+31 more)

### Community 5 - "MarketPickerPage.tsx"
Cohesion: 0.14
Nodes (16): ALL_CHAINS, ALL_LENDERS, DEFAULT_CHAIN_IDS, FAMILY_DISPLAY, FAMILY_DOT, familyOf(), KEEP_UPPER_LENDER_SEG, MarketPickerPage() (+8 more)

### Community 6 - "cn"
Cohesion: 0.11
Nodes (20): CSS_VARS_TO_MIRROR, Dropdown(), DropdownOption, DropdownProps, GaslessToggle(), GaslessToggleProps, segmentClasses(), SmartWithdrawDestination() (+12 more)

### Community 7 - "Icons.tsx"
Cohesion: 0.07
Nodes (33): lucide-react, Banner(), BannerProps, BannerVariant, VARIANT_CLASSES, EarnMainView(), EarnMainViewProps, EarnWithdrawDetailViewProps (+25 more)

### Community 8 - "cn.ts"
Cohesion: 0.09
Nodes (23): clsx, tailwind-merge, ChevronDownIcon, Card(), CardTone, Props, TONE_CLASSES, Pill() (+15 more)

### Community 9 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intent-widget, @epoch-protocol/epoch-intents-sdk, @miden-sdk/miden-sdk, @miden-sdk/miden-wallet-adapter-base, @miden-sdk/miden-wallet-adapter-react (+8 more)

### Community 10 - "EpochClassNames"
Cohesion: 0.11
Nodes (20): ArrowDownUpIcon, WalletIcon, IntentProgressProps, CardData, IntentSummary(), IntentSummaryProps, PaySwapMainViewProps, PayIntentSummary() (+12 more)

### Community 11 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, typescript (+3 more)

### Community 12 - "epoch-bridge.ts"
Cohesion: 0.29
Nodes (12): useEpochIntent(), buildCrossChainIntent(), buildEpochTaskDataParams(), CrossChainQuote, getCrossChainQuote(), normalizeMidenIdToHex(), IMPORTANT: integer strings (e.g. "1099993") are base units and must use, CrossChainIntentParams (+4 more)

### Community 13 - "miden-mainnet.ts"
Cohesion: 0.22
Nodes (7): BASE_MAINNET_USDC, baseUsdc, MIDEN_MAINNET, midenUsdcx, resolveEpochApiBaseUrl(), ViteApiEnvironment, getApiBaseUrl()

### Community 14 - "use-earn-intent-flow.ts"
Cohesion: 0.17
Nodes (19): buildSwapLegTaskInput(), createEarnIntentSdk(), EarnIntentFlowStatus, earnProtocolName(), EarnQuote, EarnQuoteInput, EarnSubmitInput, ExecutionTx (+11 more)

### Community 15 - "package.json"
Cohesion: 0.07
Nodes (28): bugs, description, files, homepage, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intents-sdk, react (+20 more)

### Community 16 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, lucide-react, npm-run-all, react, react-dom, tailwindcss, @tailwindcss/cli, @tanstack/react-query (+7 more)

### Community 17 - "useMidenWalletAdapter.ts"
Cohesion: 0.15
Nodes (15): MidenBridgeFields(), MidenBridgeFieldsProps, OutputToken, MidenWalletAsset, NormalizedMidenAccountId, resolveAccountId(), stripMidenIdDecorators(), useMidenWalletAdapter() (+7 more)

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
Cohesion: 0.17
Nodes (13): PositionRow(), Props, DOT_SIZE, dotStyle(), FilterDropdown(), FilterOption, Props, renderItem() (+5 more)

### Community 22 - "EarnSurface.tsx"
Cohesion: 0.20
Nodes (11): MultiSelectDropdown(), MultiSelectOption, Props, EARN_DEPOSIT_PROPS, EARN_WITHDRAW_PROPS, CHAIN_OPTIONS, EarnSurface(), KEEP_UPPER (+3 more)

### Community 23 - "App.tsx"
Cohesion: 0.15
Nodes (12): ADVANCED_TAB, EARN_TAB, PAY_TAB, SWAP_TAB, BASE_SEPOLIA_USDC, OP_SEPOLIA_USDC, PAY_SCENARIOS, PAY_TESTNET_SCENARIOS (+4 more)

### Community 24 - "PaySurface.tsx"
Cohesion: 0.24
Nodes (11): DemoNetwork, ScenarioProps, Props, applyEdits(), Edits, editsFromScenario(), FlatEdits, IntentEdits (+3 more)

### Community 25 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, clsx, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intents-sdk, tailwind-merge

### Community 26 - "SwapSurface.tsx"
Cohesion: 0.23
Nodes (9): EditableField(), Props, SectionLabel(), SWAP_SCENARIOS, SWAP_TESTNET_SCENARIOS, applyEdits(), editsFromScenario(), IntentEdits (+1 more)

### Community 27 - "MarketRowCard.tsx"
Cohesion: 0.21
Nodes (10): FAMILY_LABELS, fmtUsd(), LENDER_DOT, MarketRowCard(), Props, TrendingUpIcon, ACCENT_PALETTE, colorFor() (+2 more)

### Community 28 - "peerDependencies"
Cohesion: 0.29
Nodes (7): peerDependencies, lucide-react, react, react-dom, @tanstack/react-query, viem, wagmi

### Community 29 - "MidenExecutionStatus.tsx"
Cohesion: 0.31
Nodes (8): MidenExecutionStatus(), MidenExecutionStatusProps, EVM_EXPLORERS, explorerTxUrl(), MIDEN_CHAIN_ID, MIDENSCAN_BASE, midenscanNoteUrl(), truncateHash()

### Community 30 - "TokenSelector.tsx"
Cohesion: 0.12
Nodes (20): CHAIN_DOT, chainDotColor(), Avatar(), AvatarProps, ChainSelector(), ChainSelectorProps, Props, ChevronRightIcon (+12 more)

### Community 31 - "demo/package.json"
Cohesion: 0.10
Nodes (19): @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intents-sdk, react, react-dom, tailwindcss, @tanstack/react-query, @types/react (+11 more)

### Community 32 - "useMidenBridgeIntent.ts"
Cohesion: 0.16
Nodes (16): App(), useAdvancedFlag(), useEarnMidenAdapter(), isNonceLike(), MidenBridgeIntent, readNonce(), useMidenBridgeIntent(), UseMidenBridgeIntentOptions (+8 more)

### Community 33 - "AdvancedSurface.tsx"
Cohesion: 0.40
Nodes (4): Code(), Props, AdvancedSurface(), Props

### Community 34 - "useIntentFlowStatus.ts"
Cohesion: 0.29
Nodes (6): TERMINAL_OK, useIntentFlowStatus(), isTerminal(), TERMINAL_STATUSES, useIntentTransactionStatus(), IntentFlowStatus

### Community 35 - "AppShell.tsx"
Cohesion: 0.13
Nodes (17): AppShell(), NETWORK_TABS, Props, LocalSignerButton(), Props, LocalSignerDialog(), Props, LocalSignerForm() (+9 more)

### Community 36 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 37 - "MidenBridgePanel.tsx"
Cohesion: 0.18
Nodes (13): MidenQuoteCard(), MidenQuoteCardProps, MidenWalletsSection(), MidenWalletsSectionProps, getMidenFaucetDecimals(), isMidenMainnetUsdcx(), MAINNET_USDCX_KEY, toMapKey() (+5 more)

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

### Community 43 - "ScenarioCard.tsx"
Cohesion: 0.31
Nodes (6): Badge(), toneClass, Row(), Props, ScenarioCard(), Scenario

### Community 48 - "EpochIntentWidget.tsx"
Cohesion: 0.16
Nodes (14): EarnIntentWidget(), SwapIntentWidget(), SwapIntentWidgetProps, EpochIntentWidget(), useLatestRef(), useOnOpen(), toBigIntOrNull(), usePaySwapCallbacks() (+6 more)

### Community 49 - "use-earn-engine.ts"
Cohesion: 0.10
Nodes (24): useUserPositions(), exceedsBalance(), positionWithdrawableRaw(), EarnCtaAction, EarnCtaState, isEarnCtaEnabled(), resolveEarnCta(), ResolveEarnCtaParams (+16 more)

### Community 50 - "RuntimeApp.tsx"
Cohesion: 0.17
Nodes (10): getBaseRpcUrl(), bootScreenStyle, Bootstrap(), DEFAULT_MIDEN_MAINNET_RPC_URL, ensurePragmaMidenMainnetOracle(), MainnetOracleGraph, config, { connectors } (+2 more)

### Community 51 - "vite.config.ts"
Cohesion: 0.22
Nodes (7): demoRequire, intentsMidenAssets, intentsRequire, @tailwindcss/vite, vite, vite-plugin-wasm, @vitejs/plugin-react

### Community 52 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module, moduleResolution (+7 more)

### Community 53 - "Explaining and configuring rules"
Cohesion: 0.14
Nodes (12): Commands, Config shape, Decision guide, Educating the user, Explaining and configuring rules, Workflow, After making React code changes:, Command (+4 more)

### Community 54 - "earn/miden.ts"
Cohesion: 0.15
Nodes (16): EARN_MIDEN_EXTRA_FIELDS, getMidenChainTokens(), getMidenGraphTokens(), isDefaultMidenFaucet(), MIDEN_CHAIN, midenFaucetKey(), MidenGraphToken, TokenPick (+8 more)

### Community 55 - "EarnIntentWidget.tsx"
Cohesion: 0.26
Nodes (9): EarnWithdrawDetailView(), MidenAssetPicker(), MidenAssetPickerProps, DEFAULT_MIDEN_FAUCET, EarnMiden, MidenAsset, MidenDestFaucet, UseEarnMidenOptions (+1 more)

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

### Community 73 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, typecheck

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

## Knowledge Gaps
- **578 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+573 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 652 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `src/index.ts`, `PaySwapIntentWidget.tsx`, `Icons.tsx`, `cn.ts`, `EpochClassNames`, `WithdrawPanel.tsx`, `MarketRowCard.tsx`, `TokenSelector.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Icons.tsx` to `package.json`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `clsx` connect `cn.ts` to `package.json`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _578 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10793650793650794 - nodes in this community are weakly interconnected._
- **Should `PaySwapIntentWidget.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.061979648473635525 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._