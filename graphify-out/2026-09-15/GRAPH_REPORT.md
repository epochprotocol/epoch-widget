# Graph Report - epoch-widget  (2026-09-15)

## Corpus Check
- 208 files · ~108,631 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1178 nodes · 2120 edges · 101 communities (78 shown, 21 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `23dc0036`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- use-pay-swap-miden.ts
- src/index.ts
- PaySwapIntentWidget.tsx
- compilerOptions
- api.ts
- MarketPickerPage.tsx
- WithdrawAmountCard.tsx
- EarnIntentWidget.tsx
- ui/index.ts
- dependencies
- SwapIntentSummary.tsx
- devDependencies
- MidenBridgePanel.tsx
- use-pay-swap-engine.ts
- use-earn-intent-flow.ts
- package.json
- devDependencies
- MarketSelectButton.tsx
- scripts
- cn
- Recipes — copy-paste integrations
- Icons.tsx
- EarnSurface.tsx
- AppShell.tsx
- WithdrawPanel.tsx
- dependencies
- SwapSurface.tsx
- PaySurface.tsx
- peerDependencies
- App.tsx
- WithdrawDetailPanel.tsx
- demo/package.json
- main.tsx
- scenarios.ts
- PaySwapMainView.tsx
- What You Must Do When Invoked
- What You Must Do When Invoked
- EpochClassNames
- What You Must Do When Invoked
- What You Must Do When Invoked
- vite-env.d.ts
- repository
- useLatestRef
- vite.config.ts
- @epoch-protocol/epoch-flows-sdk
- earn/miden.ts
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
- EarnCtaButton.tsx
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
- EpochIntentWidget.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 65 edges
2. `useEarnEngine()` - 22 edges
3. `@epoch-protocol/epoch-flows-sdk` - 20 edges
4. `EpochClassNames` - 20 edges
5. `@epoch-protocol/epoch-intent-widget` - 20 edges
6. `compilerOptions` - 17 edges
7. `usePaySwapEngine()` - 16 edges
8. `scripts` - 15 edges
9. `Integration Guide` - 15 edges
10. `compilerOptions` - 14 edges

## Surprising Connections (you probably didn't know these)
- `ChainSelector()` --calls--> `cn()`  [EXTRACTED]
  src/components/ChainSelector.tsx → src/lib/cn.ts
- `IntentSummaryProps` --references--> `EpochClassNames`  [EXTRACTED]
  src/components/IntentSummary.tsx → src/types.ts
- `IntentSummary()` --calls--> `cn()`  [EXTRACTED]
  src/components/IntentSummary.tsx → src/lib/cn.ts
- `PayIntentSummaryProps` --references--> `EpochClassNames`  [EXTRACTED]
  src/components/PayIntentSummary.tsx → src/types.ts
- `SwapIntentSummaryProps` --references--> `EpochClassNames`  [EXTRACTED]
  src/components/SwapIntentSummary.tsx → src/types.ts

## Import Cycles
- None detected.

## Communities (101 total, 21 thin omitted)

### Community 0 - "use-pay-swap-miden.ts"
Cohesion: 0.26
Nodes (14): DestinationSelection, PaySwapEngine, PaySwapMiden, PaySwapMidenDest, PaySwapMidenSource, UsePaySwapMidenOptions, isSolanaChain(), PaySwapSolana (+6 more)

### Community 1 - "src/index.ts"
Cohesion: 0.18
Nodes (16): Modal(), DEFAULT_TESTNET_API_BASE_URL, DEFAULT_TESTNET_POSITIONS_BASE_URL, DARK_THEME, DEFAULT_THEME, LIGHT_THEME, resolveTheme(), t (+8 more)

### Community 2 - "PaySwapIntentWidget.tsx"
Cohesion: 0.07
Nodes (31): NetworkBadge(), NetworkToggle(), NetworkToggleProps, segmentClasses(), PayIntentWidgetProps, CTA_TONE_CLASSES, PaySwapIntentWidget(), WidgetView (+23 more)

### Community 3 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib (+11 more)

### Community 4 - "api.ts"
Cohesion: 0.07
Nodes (39): ConfigsState, DEFAULT_EARN_CONFIGS, DEFAULT_POOL_CHAIN_IDS, filterConfigsByNetwork(), MarketsState, PoolsPageState, PositionsState, useEarnConfigs() (+31 more)

### Community 5 - "MarketPickerPage.tsx"
Cohesion: 0.09
Nodes (25): CHAIN_DOT, chainDotColor(), SearchIcon, ALL_CHAINS, ALL_LENDERS, DEFAULT_CHAIN_IDS, FAMILY_DISPLAY, FAMILY_DOT (+17 more)

### Community 6 - "WithdrawAmountCard.tsx"
Cohesion: 0.22
Nodes (6): PositionRow(), Props, FRACTIONS, WithdrawAmountCard(), WithdrawAmountCardProps, formatUsdPrice()

### Community 7 - "EarnIntentWidget.tsx"
Cohesion: 0.20
Nodes (13): EarnMainView(), EarnMainViewProps, EarnWithdrawDetailView(), EarnWithdrawDetailViewProps, EarnIntentWidget(), CheckIcon, EARN_PROGRESS_STATUSES, IntentProgress() (+5 more)

### Community 8 - "ui/index.ts"
Cohesion: 0.14
Nodes (14): ChevronDownIcon, Card(), CardTone, Props, TONE_CLASSES, Pill(), PillSize, PillVariant (+6 more)

### Community 9 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-intent-widget, @epoch-protocol/epoch-intents-sdk, @miden-sdk/miden-sdk, @miden-sdk/miden-wallet-adapter-base, @miden-sdk/miden-wallet-adapter-react, @miden-sdk/react (+7 more)

### Community 10 - "SwapIntentSummary.tsx"
Cohesion: 0.11
Nodes (21): Avatar(), AvatarProps, ChainSelector(), ChainSelectorProps, ArrowDownIcon, ArrowDownUpIcon, ChevronRightIcon, LockIcon (+13 more)

### Community 11 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, typescript (+3 more)

### Community 12 - "MidenBridgePanel.tsx"
Cohesion: 0.05
Nodes (57): Code(), Props, MidenBridgeFields(), MidenBridgeFieldsProps, OutputToken, MidenExecutionStatus(), MidenExecutionStatusProps, MidenQuoteCard() (+49 more)

### Community 13 - "use-pay-swap-engine.ts"
Cohesion: 0.21
Nodes (11): SwapIntentSummary(), usePropOverride(), PAY_SWAP_VARIANTS, PaySwapVariant, PaySwapVariantSpec, SummaryContext, PLACEHOLDER_INTENT, usePaySwapEngine() (+3 more)

### Community 14 - "use-earn-intent-flow.ts"
Cohesion: 0.20
Nodes (17): EARN_MIDEN_EXTRA_FIELDS, normalizeMidenId(), buildSwapLegTaskInput(), createEarnIntentSdk(), EarnIntentFlowStatus, earnProtocolName(), EarnQuote, EarnQuoteInput (+9 more)

### Community 15 - "package.json"
Cohesion: 0.07
Nodes (28): bugs, description, files, homepage, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-intents-sdk, react, react-dom (+20 more)

### Community 16 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, lucide-react, npm-run-all, react, react-dom, tailwindcss, @tailwindcss/cli, @tanstack/react-query (+7 more)

### Community 17 - "MarketSelectButton.tsx"
Cohesion: 0.20
Nodes (11): FAMILY_LABELS, fmtUsd(), LENDER_DOT, MarketRowCard(), Props, TrendingUpIcon, Props, ACCENT_PALETTE (+3 more)

### Community 18 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, build:css, build:js, demo, dev, dev:css, dev:js (+7 more)

### Community 19 - "cn"
Cohesion: 0.13
Nodes (20): clsx, tailwind-merge, EarnFlowPanel(), Props, GaslessEnableButton(), GaslessEnableButtonProps, GaslessToggle(), GaslessToggleProps (+12 more)

### Community 20 - "Recipes — copy-paste integrations"
Cohesion: 0.06
Nodes (29): Callback payloads, EpochIntentWidgetProps, IntentConfig, IntentProps, Notable exports, Props reference, Callbacks, CTA copy (+21 more)

### Community 21 - "Icons.tsx"
Cohesion: 0.15
Nodes (13): Banner(), BannerProps, BannerVariant, VARIANT_CLASSES, AlertIcon, ChevronLeftIcon, CloseIcon, HistoryToolbarIcon (+5 more)

### Community 22 - "EarnSurface.tsx"
Cohesion: 0.20
Nodes (11): MultiSelectDropdown(), MultiSelectOption, Props, EARN_DEPOSIT_PROPS, EARN_WITHDRAW_PROPS, CHAIN_OPTIONS, EarnSurface(), KEEP_UPPER (+3 more)

### Community 23 - "AppShell.tsx"
Cohesion: 0.33
Nodes (5): AppShell(), NETWORK_TABS, Props, Row(), @rainbow-me/rainbowkit

### Community 24 - "WithdrawPanel.tsx"
Cohesion: 0.20
Nodes (12): DOT_SIZE, dotStyle(), FilterDropdown(), FilterOption, Props, renderItem(), TRIGGER_SIZE, POSITIONS_LENDER_OPTIONS (+4 more)

### Community 25 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, clsx, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intents-sdk, tailwind-merge

### Community 26 - "SwapSurface.tsx"
Cohesion: 0.23
Nodes (9): EditableField(), Props, SectionLabel(), SWAP_SCENARIOS, SWAP_TESTNET_SCENARIOS, applyEdits(), editsFromScenario(), IntentEdits (+1 more)

### Community 27 - "PaySurface.tsx"
Cohesion: 0.22
Nodes (12): DemoNetwork, PAY_SCENARIOS, ScenarioProps, Props, applyEdits(), Edits, editsFromScenario(), FlatEdits (+4 more)

### Community 28 - "peerDependencies"
Cohesion: 0.29
Nodes (7): peerDependencies, lucide-react, react, react-dom, @tanstack/react-query, viem, wagmi

### Community 29 - "App.tsx"
Cohesion: 0.24
Nodes (9): ADVANCED_TAB, App(), EARN_TAB, PAY_TAB, SWAP_TAB, useAdvancedFlag(), useEarnMidenAdapter(), getApiBaseUrl() (+1 more)

### Community 30 - "WithdrawDetailPanel.tsx"
Cohesion: 0.16
Nodes (12): CSS_VARS_TO_MIRROR, Dropdown(), DropdownOption, DropdownProps, SmartWithdrawDestination(), SmartWithdrawDestinationProps, WithdrawFromCard(), WithdrawFromCardProps (+4 more)

### Community 31 - "demo/package.json"
Cohesion: 0.11
Nodes (17): @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-intents-sdk, react, react-dom, tailwindcss, @tanstack/react-query, @types/react, @types/react-dom (+9 more)

### Community 32 - "main.tsx"
Cohesion: 0.19
Nodes (13): config, midenConfig, queryClient, createFeeConversionSalt(), Options, toAccountId(), useMidenP2IDNoteFactory(), @epoch-protocol/epoch-intent-widget (+5 more)

### Community 33 - "scenarios.ts"
Cohesion: 0.16
Nodes (11): Badge(), toneClass, Props, ScenarioCard(), BASE_SEPOLIA_USDC, OP_SEPOLIA_USDC, PAY_TESTNET_SCENARIOS, Scenario (+3 more)

### Community 34 - "PaySwapMainView.tsx"
Cohesion: 0.21
Nodes (9): GaslessSection(), GaslessSectionProps, PAY_SWAP_PROGRESS_STATUSES, PaySwapMainView(), PaySwapMainViewProps, useGaslessWallet(), useGaslessWalletCheck(), UseGaslessWalletParams (+1 more)

### Community 35 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 36 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 37 - "EpochClassNames"
Cohesion: 0.33
Nodes (9): IntentProgressProps, ModalProps, WalletConnectorPanelProps, EarnIntentWidgetProps, UseEarnMarketPickerOptions, EpochTheme, ApiConfig, EpochClassNames (+1 more)

### Community 38 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 39 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 41 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

### Community 42 - "useLatestRef"
Cohesion: 0.21
Nodes (11): useLatestRef(), toBigIntOrNull(), usePaySwapCallbacks(), UsePaySwapCallbacksOptions, useQuoteAutoFetch(), UseSourceSelectionOptions, EpochIntentWidgetProps, IntentFlowStatus (+3 more)

### Community 43 - "vite.config.ts"
Cohesion: 0.40
Nodes (4): @tailwindcss/vite, vite, vite-plugin-wasm, @vitejs/plugin-react

### Community 44 - "@epoch-protocol/epoch-flows-sdk"
Cohesion: 0.17
Nodes (3): @epoch-protocol/epoch-flows-sdk, EarnQuoteTarget, UseEarnQuoteTargetOptions

### Community 45 - "earn/miden.ts"
Cohesion: 0.18
Nodes (15): MidenAssetPicker(), MidenAssetPickerProps, bech32HrpExpand(), bech32Polymod(), decodeMidenBech32(), getMidenGraphTokens(), isDefaultMidenFaucet(), midenFaucetKey() (+7 more)

### Community 46 - "use-earn-engine.ts"
Cohesion: 0.17
Nodes (16): TokenWithChain, useUserPositions(), exceedsBalance(), positionWithdrawableRaw(), EarnCtaAction, EarnCtaState, isEarnCtaEnabled(), resolveEarnCta() (+8 more)

### Community 48 - "use-source-selection.ts"
Cohesion: 0.18
Nodes (17): getMidenChainTokens(), MIDEN_CHAIN, TokenPick, useTokenPick(), resolveDefaultSource(), TokenOnChain, DEFAULT_DEST_CHAIN_ID, RequiredToken (+9 more)

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

### Community 71 - "EarnCtaButton.tsx"
Cohesion: 0.33
Nodes (5): EarnCtaButton(), EarnCtaButtonProps, RetryIcon, ActionButton(), ActionButtonProps

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

### Community 100 - "EpochIntentWidget.tsx"
Cohesion: 0.38
Nodes (5): PayIntentWidget(), SwapIntentWidget(), WalletConnectorPanel(), EpochIntentWidget(), useOnOpen()

## Knowledge Gaps
- **557 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+552 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 619 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@epoch-protocol/epoch-flows-sdk` connect `@epoch-protocol/epoch-flows-sdk` to `src/index.ts`, `PaySwapMainView.tsx`, `api.ts`, `MarketPickerPage.tsx`, `WithdrawAmountCard.tsx`, `useLatestRef`, `use-pay-swap-engine.ts`, `package.json`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `src/index.ts`, `PaySwapIntentWidget.tsx`, `EpochIntentWidget.tsx`, `MarketPickerPage.tsx`, `WithdrawAmountCard.tsx`, `EarnIntentWidget.tsx`, `EarnCtaButton.tsx`, `ui/index.ts`, `SwapIntentSummary.tsx`, `EpochClassNames`, `use-pay-swap-engine.ts`, `MarketSelectButton.tsx`, `Icons.tsx`, `WithdrawPanel.tsx`, `WithdrawDetailPanel.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _557 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PaySwapIntentWidget.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07439024390243902 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07293868921775898 - nodes in this community are weakly interconnected._