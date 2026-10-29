# Graph Report - epoch-widget  (2026-10-28)

## Corpus Check
- 223 files · ~111,296 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1239 nodes · 2188 edges · 96 communities (71 shown, 21 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `38ab855e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- use-pay-swap-engine.ts
- src/index.ts
- PaySwapIntentWidget.tsx
- compilerOptions
- api.ts
- MarketPickerPage.tsx
- WithdrawFromCard.tsx
- EarnMainView.tsx
- ui/index.ts
- dependencies
- SwapIntentSummary.tsx
- devDependencies
- SwapSurface.tsx
- RuntimeApp.tsx
- use-earn-intent-flow.ts
- package.json
- devDependencies
- useMidenWalletAdapter.ts
- scripts
- @epoch-protocol/epoch-intent-widget
- Recipes — copy-paste integrations
- WithdrawPanel.tsx
- EarnSurface.tsx
- scenarios.ts
- PaySurface.tsx
- dependencies
- cn
- TokenSelector.tsx
- peerDependencies
- use-source-selection.ts
- Icons.tsx
- demo/package.json
- MidenBridgeFields.tsx
- App.tsx
- AppShell.tsx
- What You Must Do When Invoked
- MidenBridgePanel.tsx
- What You Must Do When Invoked
- What You Must Do When Invoked
- vite-env.d.ts
- repository
- What You Must Do When Invoked
- tsup
- EpochClassNames
- use-earn-engine.ts
- main.tsx
- vite.config.ts
- compilerOptions
- Explaining and configuring rules
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
- useLatestRef

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
- `ChainSelector()` --calls--> `cn()`  [EXTRACTED]
  src/components/ChainSelector.tsx → src/lib/cn.ts
- `IntentProgressProps` --references--> `EpochClassNames`  [EXTRACTED]
  src/components/IntentProgress.tsx → src/types.ts

## Import Cycles
- None detected.

## Communities (96 total, 21 thin omitted)

### Community 0 - "use-pay-swap-engine.ts"
Cohesion: 0.13
Nodes (22): TokenWithChain, usePropOverride(), PAY_SWAP_VARIANTS, PaySwapVariant, PaySwapVariantSpec, SummaryContext, DestinationSelection, useDestinationSelection() (+14 more)

### Community 1 - "src/index.ts"
Cohesion: 0.12
Nodes (20): EarnIntentWidgetProps, EarnQuoteTarget, useEarnQuoteTarget(), UseEarnQuoteTargetOptions, DEFAULT_TESTNET_API_BASE_URL, DEFAULT_TESTNET_POSITIONS_BASE_URL, DARK_THEME, DEFAULT_THEME (+12 more)

### Community 2 - "PaySwapIntentWidget.tsx"
Cohesion: 0.06
Nodes (35): EarnCtaButton(), EarnCtaButtonProps, RetryIcon, NetworkBadge(), NetworkToggle(), NetworkToggleProps, segmentClasses(), CTA_TONE_CLASSES (+27 more)

### Community 3 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib (+11 more)

### Community 4 - "api.ts"
Cohesion: 0.07
Nodes (40): ConfigsState, DEFAULT_EARN_CONFIGS, DEFAULT_POOL_CHAIN_IDS, filterConfigsByNetwork(), MarketsState, PoolsPageState, PositionsState, useEarnConfigs() (+32 more)

### Community 5 - "MarketPickerPage.tsx"
Cohesion: 0.14
Nodes (16): ALL_CHAINS, ALL_LENDERS, DEFAULT_CHAIN_IDS, FAMILY_DISPLAY, FAMILY_DOT, familyOf(), KEEP_UPPER_LENDER_SEG, MarketPickerPage() (+8 more)

### Community 6 - "WithdrawFromCard.tsx"
Cohesion: 0.21
Nodes (8): CSS_VARS_TO_MIRROR, Dropdown(), DropdownOption, DropdownProps, SmartWithdrawDestination(), SmartWithdrawDestinationProps, WithdrawFromCardProps, SECTION_LABEL

### Community 7 - "EarnMainView.tsx"
Cohesion: 0.13
Nodes (18): Banner(), EarnMainView(), EarnMainViewProps, EarnWithdrawDetailViewProps, EarnFlowPanel(), GaslessSection(), GaslessSectionProps, CheckIcon (+10 more)

### Community 8 - "ui/index.ts"
Cohesion: 0.12
Nodes (17): ChevronDownIcon, Card(), CardTone, Props, TONE_CLASSES, Pill(), PillSize, PillVariant (+9 more)

### Community 9 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intent-widget, @epoch-protocol/epoch-intents-sdk, @miden-sdk/miden-sdk, @miden-sdk/miden-wallet-adapter-base, @miden-sdk/miden-wallet-adapter-react (+8 more)

### Community 10 - "SwapIntentSummary.tsx"
Cohesion: 0.12
Nodes (18): Avatar(), AvatarProps, Props, ArrowDownIcon, ArrowDownUpIcon, LockIcon, WalletIcon, CardData (+10 more)

### Community 11 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, typescript (+3 more)

### Community 12 - "SwapSurface.tsx"
Cohesion: 0.23
Nodes (11): DemoNetwork, SectionLabel(), ScenarioProps, SWAP_SCENARIOS, Props, Props, applyEdits(), editsFromScenario() (+3 more)

### Community 13 - "RuntimeApp.tsx"
Cohesion: 0.19
Nodes (10): MIDEN_MAINNET_WALLET_NETWORK, MidenAccountId, normalizeMidenAccount(), requirePublicMidenAccount(), config, { connectors }, midenConfig, queryClient (+2 more)

### Community 14 - "use-earn-intent-flow.ts"
Cohesion: 0.16
Nodes (19): EARN_MIDEN_EXTRA_FIELDS, buildSwapLegTaskInput(), createEarnIntentSdk(), EarnIntentFlowStatus, earnProtocolName(), EarnQuote, EarnQuoteInput, EarnSubmitInput (+11 more)

### Community 15 - "package.json"
Cohesion: 0.06
Nodes (31): bugs, description, files, homepage, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intents-sdk, react (+23 more)

### Community 16 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, lucide-react, npm-run-all, react, react-dom, tailwindcss, @tailwindcss/cli, @tanstack/react-query (+7 more)

### Community 17 - "useMidenWalletAdapter.ts"
Cohesion: 0.17
Nodes (15): useEarnMidenAdapter(), createFeeConversionSalt(), Options, toAccountId(), useMidenP2IDNoteFactory(), NormalizedMidenAccountId, resolveAccountId(), stripMidenIdDecorators() (+7 more)

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
Nodes (11): MultiSelectDropdown(), MultiSelectOption, Props, EARN_DEPOSIT_PROPS, EARN_WITHDRAW_PROPS, CHAIN_OPTIONS, EarnSurface(), KEEP_UPPER (+3 more)

### Community 23 - "scenarios.ts"
Cohesion: 0.15
Nodes (12): Badge(), toneClass, Props, ScenarioCard(), BASE_SEPOLIA_USDC, OP_SEPOLIA_USDC, PAY_TESTNET_SCENARIOS, Scenario (+4 more)

### Community 24 - "PaySurface.tsx"
Cohesion: 0.21
Nodes (10): EditableField(), Props, Row(), PAY_SCENARIOS, applyEdits(), Edits, editsFromScenario(), FlatEdits (+2 more)

### Community 25 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, clsx, @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intents-sdk, tailwind-merge

### Community 26 - "cn"
Cohesion: 0.12
Nodes (20): GaslessEnableButton(), GaslessEnableButtonProps, GaslessToggle(), GaslessToggleProps, segmentClasses(), SparklesIcon, PositionRow(), Props (+12 more)

### Community 27 - "TokenSelector.tsx"
Cohesion: 0.12
Nodes (19): CHAIN_DOT, chainDotColor(), FAMILY_LABELS, fmtUsd(), LENDER_DOT, MarketRowCard(), Props, ChevronRightIcon (+11 more)

### Community 28 - "peerDependencies"
Cohesion: 0.29
Nodes (7): peerDependencies, lucide-react, react, react-dom, @tanstack/react-query, viem, wagmi

### Community 29 - "use-source-selection.ts"
Cohesion: 0.19
Nodes (11): getMidenChainTokens(), MIDEN_CHAIN, TokenPick, useTokenPick(), resolveDefaultSource(), TokenOnChain, DEFAULT_DEST_CHAIN_ID, RequiredToken (+3 more)

### Community 30 - "Icons.tsx"
Cohesion: 0.13
Nodes (15): BannerProps, BannerVariant, VARIANT_CLASSES, ChainSelector(), ChainSelectorProps, AlertIcon, ChevronLeftIcon, HistoryToolbarIcon (+7 more)

### Community 31 - "demo/package.json"
Cohesion: 0.10
Nodes (19): @epoch-protocol/epoch-commons-sdk, @epoch-protocol/epoch-flows-sdk, @epoch-protocol/epoch-intents-sdk, react, react-dom, tailwindcss, @tanstack/react-query, @types/react (+11 more)

### Community 32 - "MidenBridgeFields.tsx"
Cohesion: 0.50
Nodes (4): MidenBridgeFields(), MidenBridgeFieldsProps, OutputToken, MidenWalletAsset

### Community 33 - "App.tsx"
Cohesion: 0.16
Nodes (12): ADVANCED_TAB, App(), EARN_TAB, PAY_TAB, rpcUrls, SWAP_TAB, useAdvancedFlag(), Code() (+4 more)

### Community 35 - "AppShell.tsx"
Cohesion: 0.13
Nodes (17): AppShell(), NETWORK_TABS, Props, LocalSignerButton(), Props, LocalSignerDialog(), Props, LocalSignerForm() (+9 more)

### Community 36 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 37 - "MidenBridgePanel.tsx"
Cohesion: 0.06
Nodes (51): BASE_MAINNET_USDC, baseUsdc, MIDEN_MAINNET, midenUsdcx, resolveEpochApiBaseUrl(), ViteApiEnvironment, getApiBaseUrl(), MidenExecutionStatus() (+43 more)

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

### Community 48 - "EpochClassNames"
Cohesion: 0.13
Nodes (18): EarnIntentWidget(), CloseIcon, PoweredIcon, IntentSummaryProps, Modal(), ModalProps, PaySwapMainViewProps, PayIntentSummaryProps (+10 more)

### Community 49 - "use-earn-engine.ts"
Cohesion: 0.13
Nodes (22): useUserPositions(), exceedsBalance(), positionWithdrawableRaw(), EarnCtaAction, EarnCtaState, isEarnCtaEnabled(), resolveEarnCta(), ResolveEarnCtaParams (+14 more)

### Community 50 - "main.tsx"
Cohesion: 0.39
Nodes (5): bootScreenStyle, Bootstrap(), DEFAULT_MIDEN_MAINNET_RPC_URL, ensurePragmaMidenMainnetOracle(), MainnetOracleGraph

### Community 51 - "vite.config.ts"
Cohesion: 0.16
Nodes (12): DEMO_RPC_PATHS, getBaseRpcUrl(), getDemoChains(), getDemoRpcUrls(), INFURA_NETWORKS, demoRequire, intentsMidenAssets, intentsRequire (+4 more)

### Community 52 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module, moduleResolution (+7 more)

### Community 53 - "Explaining and configuring rules"
Cohesion: 0.14
Nodes (12): Commands, Config shape, Decision guide, Educating the user, Explaining and configuring rules, Workflow, After making React code changes:, Command (+4 more)

### Community 54 - "EarnIntentWidget.tsx"
Cohesion: 0.19
Nodes (14): EarnWithdrawDetailView(), MidenAssetPicker(), MidenAssetPickerProps, WithdrawDetailPanel(), DEFAULT_MIDEN_FAUCET, getMidenGraphTokens(), isDefaultMidenFaucet(), midenFaucetKey() (+6 more)

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

### Community 101 - "useLatestRef"
Cohesion: 0.23
Nodes (10): useLatestRef(), toBigIntOrNull(), usePaySwapCallbacks(), UsePaySwapCallbacksOptions, UseSourceSelectionOptions, EpochIntentWidgetProps, IntentFlowStatus, useIntentFlow() (+2 more)

## Knowledge Gaps
- **580 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+575 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 655 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `package.json` to `Icons.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `src/index.ts`, `PaySwapIntentWidget.tsx`, `WithdrawFromCard.tsx`, `EarnMainView.tsx`, `ui/index.ts`, `SwapIntentSummary.tsx`, `EpochClassNames`, `WithdrawPanel.tsx`, `TokenSelector.tsx`, `Icons.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `clsx` connect `package.json` to `cn`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _580 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `use-pay-swap-engine.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11612903225806452 - nodes in this community are weakly interconnected._
- **Should `PaySwapIntentWidget.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06280193236714976 - nodes in this community are weakly interconnected._