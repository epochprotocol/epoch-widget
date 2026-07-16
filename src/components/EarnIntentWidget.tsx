import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useChainId, useSwitchChain, useWalletClient } from "wagmi";
import { detectWalletAccountType } from "@epoch-protocol/epoch-intents-sdk";
import { getEpochChains, getEpochTokensByChainEnv } from "../epoch-config";
import { useTokenBalance } from "../use-token-balance";
import { useSessionId } from "../session";
import type {
  ApiConfig,
  EarnDepositIntentDefaults,
  EarnMidenAdapter,
  EarnWithdrawIntentDefaults,
  EpochClassNames,
  EpochEarnMarket,
  EpochEarnPosition,
  EpochTheme,
  IntentCompletePayload,
  IntentSentPayload,
  OnErrorCtx,
  OnSignCtx,
  OnStartCtx,
  OnStatusCtx,
  OnSuccessCtx,
  RoutingAndLiquidityOptions,
} from "../types";
import { useUserPositions } from "../earn/api";
import { useEarnMarketPicker } from "../earn/use-earn-market-picker";
import { useEarnMiden } from "../earn/use-earn-miden";
import { useEarnQuoteTarget } from "../earn/use-earn-quote-target";
import { resolveEarnCta, isEarnCtaEnabled } from "../earn/earn-cta";
import { EARN_TESTNET_SOURCE_EVM_CHAIN_IDS } from "../earn/earn-chains";
import { MIDEN_VIRTUAL_CHAIN_ID, DEFAULT_MIDEN_FAUCET } from "../earn/miden";
import {
  DUMMY_LENDING_SUPPORTED_ADDRESSES,
  DEPRECATED_DUMMY_LENDING_USDC_ADDRESS,
} from "../earn/dummy-lending-markets";
import { resolveApiForNetwork } from "../resolve-api-config";
import { useEarnIntentFlow } from "../earn/use-earn-intent-flow";
import { useGaslessWallet } from "../hooks/use-gasless-wallet-check";
import { useLatestRef } from "../hooks/use-latest-ref";
import { useOnOpen } from "../hooks/use-on-open";
import { useTokenPick } from "../hooks/use-token-pick";
import type { OneDeltaConfig } from "../types";
import { ArrowDownIcon, CheckIcon } from "./Icons";
import { SegmentedTabs } from "./ui/SegmentedTabs";
import { Banner } from "./Banner";
import { EarnFlowPanel } from "./EarnFlowPanel";
import { MarketPickerPage } from "./MarketPickerPage";
import { Modal } from "./Modal";
import { NetworkToggle } from "./NetworkToggle";
import { GaslessEnableButton } from "./GaslessEnableButton";
import { ProgressStepper } from "./ProgressStepper";
import { TokenSelector, type TokenWithChain } from "./TokenSelector";
import { WithdrawPanel } from "./WithdrawPanel";
import { MidenAssetPicker } from "./earn/MidenAssetPicker";
import { EarnCtaButton } from "./earn/EarnCtaButton";
import {
  WithdrawDetailPanel,
  WithdrawFundsButton,
} from "./WithdrawDetailPanel";

type EarnView = "main" | "selectToken" | "selectMarket" | "withdrawDetail";

interface EarnIntentWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  api: ApiConfig;
  network?: "mainnet" | "testnet";
  allowNetworkToggle?: boolean;
  allowGasless?: boolean;
  gasless?: boolean;
  classNames?: EpochClassNames;
  theme?: "light" | "dark" | EpochTheme;
  renderInline?: boolean;
  title?: string;
  submitButtonText?: string;
  earnMarkets?: EpochEarnMarket[];
  earnMarketsSource?: OneDeltaConfig[];
  earnDefaultTab?: "deposit" | "withdraw";
  earnHideTabs?: boolean;
  earnDepositDefaults?: EarnDepositIntentDefaults;
  earnWithdrawDefaults?: EarnWithdrawIntentDefaults;
  /** Override the 1delta-solver base URL (`POST /earn/quote`). Defaults to `api.baseUrl`. */
  earnSolverUrl?: string;
  /** Optional Miden wallet adapter for testnet earn deposits funded from Miden. */
  earnMiden?: EarnMidenAdapter;
  /**
   * Chain IDs to fan /pools fetches over. Forwarded as one `chainId=` per
   * request. Default: [1, 8453, 42161, 10, 137]. Set to a single chain to
   * scope the picker.
   */
  earnChainIds?: number[];
  /**
   * Restrict /pools to specific lender keys. Passed verbatim as the `lender`
   * query param — 1delta accepts CSV (e.g. `AAVE_V3,COMPOUND_V3_USDC`) and
   * matches the granular `lenderKey` (per-market for Morpho/Fluid). Omit to
   * include every lender on each chain.
   */
  earnLenderFilter?: string;
  /** Max rows per chain on /pools (1delta `count`). Default 100. */
  earnPoolsPerChain?: number;
  /** /pools sort field. Default `totalDepositsUsd`. */
  earnPoolsSortBy?:
    | "depositRate"
    | "variableBorrowRate"
    | "totalDepositsUsd"
    | "totalLiquidityUsd"
    | "utilization";
  /** /pools sort direction. Default `DESC`. */
  earnPoolsSortDir?: "ASC" | "DESC";
  /** @deprecated no-op — markets always come from `earnMarketsSource`. */
  earnUseMockData?: boolean;
  onIntentSent?: (data: IntentSentPayload) => void;
  onIntentComplete?: (data: IntentCompletePayload) => void;
  onError?: (ctx: OnErrorCtx) => void;
  onOpen?: () => void;
  onStart?: (ctx: OnStartCtx) => void;
  onSign?: (ctx: OnSignCtx) => void;
  onSuccess?: (ctx: OnSuccessCtx) => void;
  onStatus?: (ctx: OnStatusCtx) => void;
  routingAndLiquidityOptions?: RoutingAndLiquidityOptions;
}

export function EarnIntentWidget({
  isOpen,
  onClose,
  api,
  network: networkProp = "mainnet",
  allowNetworkToggle = true,
  allowGasless = true,
  gasless: gaslessProp = false,
  classNames: cn,
  theme,
  renderInline = false,
  title,
  submitButtonText,
  earnMarkets: earnMarketsProp,
  earnMarketsSource,
  earnDefaultTab = "deposit",
  earnHideTabs = false,
  earnDepositDefaults,
  earnWithdrawDefaults,
  earnSolverUrl,
  earnMiden,
  earnChainIds,
  earnLenderFilter,
  earnPoolsPerChain,
  earnPoolsSortBy,
  earnPoolsSortDir,
  onIntentSent,
  onIntentComplete,
  onError,
  onOpen,
  onStart,
  onSign,
  onSuccess,
  onStatus,
  routingAndLiquidityOptions,
}: EarnIntentWidgetProps) {
  const sessionId = useSessionId(isOpen);
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const effectiveAllowGasless = useMemo(
    () =>
      allowGasless &&
      walletClient != null &&
      detectWalletAccountType(walletClient as never) === "local",
    [allowGasless, walletClient],
  );

  const [earnTab, setEarnTab] = useState<"deposit" | "withdraw">(
    earnDefaultTab,
  );
  const [earnSelectedMarket, setEarnSelectedMarket] =
    useState<EpochEarnMarket | null>(null);
  const [earnAmount, setEarnAmount] = useState("");
  const [selectedPosition, setSelectedPosition] =
    useState<EpochEarnPosition | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  // Smart Withdraw = let Epoch's intent network bridge/swap the withdrawn
  // underlying to a different chain or token. OFF = receive the underlying on
  // its native chain (current default behaviour). When ON, the
  // `smartDest*` state captures the user's chosen destination — wired into
  // the UI but not yet plumbed into the intent payload (today's flow still
  // pins source = underlying, lands on the position's chain).
  const [smartWithdraw, setSmartWithdraw] = useState(false);
  const [smartDestChainId, setSmartDestChainId] = useState<number | null>(null);
  const [smartDestTokenAddress, setSmartDestTokenAddress] = useState("");
  // Positions-API filters. Defaults: all chains (empty → derived CSV) + all
  // lenders. User can narrow via the dropdowns in WithdrawPanel.
  const [positionsChainId, setPositionsChainId] = useState(
    networkProp === "testnet" ? "84532" : "",
  );
  const [positionsLenderKey, setPositionsLenderKey] = useState("");
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [fundingSource, setFundingSource] = useState<"evm" | "miden">("evm");
  const [selectedMidenFaucetId, setSelectedMidenFaucetId] = useState<string>(
    DEFAULT_MIDEN_FAUCET.faucetId,
  );
  const [view, setView] = useState<EarnView>("main");
  const [isTestnet, setIsTestnet] = useState(networkProp === "testnet");
  const [gasless, setGasless] = useState(gaslessProp);
  const networkEnv: "mainnet" | "testnet" = isTestnet ? "testnet" : "mainnet";
  const midenEnabled =
    networkEnv === "testnet" &&
    earnMiden != null &&
    earnMiden.enabled !== false;
  const resolvedApi = useMemo(
    () => resolveApiForNetwork(api, networkEnv),
    [api, networkEnv],
  );

  // Source-funding chains. Testnet is narrowed to the chains dummy-lending can
  // actually be funded from; mainnet offers the full Epoch chain list.
  const availableChains = useMemo(() => {
    const chains = getEpochChains(isTestnet);
    if (!isTestnet) return chains;
    return chains.filter((c) => EARN_TESTNET_SOURCE_EVM_CHAIN_IDS.has(c.id));
  }, [isTestnet]);

  const allTokens = useMemo<TokenWithChain[]>(() => {
    const allowed = new Set(DUMMY_LENDING_SUPPORTED_ADDRESSES);
    const deprecated = DEPRECATED_DUMMY_LENDING_USDC_ADDRESS.toLowerCase();
    return availableChains.flatMap((chain) =>
      getEpochTokensByChainEnv(chain.id, isTestnet).flatMap((tok) => {
        if (isTestnet) {
          const addr = tok.address.toLowerCase();
          if (!allowed.has(addr) || addr === deprecated) return [];
        }
        return [{ ...tok, chain }];
      }),
    );
  }, [availableChains, isTestnet]);

  const availableTokens = useMemo(
    () =>
      selectedChainId
        ? getEpochTokensByChainEnv(selectedChainId, isTestnet)
        : [],
    [selectedChainId, isTestnet],
  );

  const {
    address: selectedTokenAddress,
    token: selectedToken,
    setPick: setTokenAddressPick,
  } = useTokenPick(availableTokens);

  useOnOpen(isOpen, onOpen);

  useEffect(() => {
    if (!isOpen) return;
    setEarnTab(earnDefaultTab);
  }, [isOpen, earnDefaultTab]);

  // Default destination = the position's underlying chain + token.
  const applySmartDestDefaults = useCallback(
    (position: EpochEarnPosition | null) => {
      if (!position) {
        setSmartDestChainId(null);
        setSmartDestTokenAddress("");
        return;
      }
      if (position.market.chainId != null) {
        setSmartDestChainId(position.market.chainId);
      }
      setSmartDestTokenAddress(position.market.token.address);
    },
    [],
  );

  // Every position change reseeds the destination in the same render, rather
  // than letting an effect watch `selectedPosition` and set it a render later.
  const selectPosition = useCallback(
    (position: EpochEarnPosition | null) => {
      setSelectedPosition(position);
      applySmartDestDefaults(position);
    },
    [applySmartDestDefaults],
  );

  // Smart Withdraw OFF restores the position's own chain + underlying so
  // nothing stale survives if the user toggles it back on.
  const handleSmartWithdrawChange = useCallback(
    (next: boolean) => {
      setSmartWithdraw(next);
      if (!next) applySmartDestDefaults(selectedPosition);
    },
    [applySmartDestDefaults, selectedPosition],
  );

  // Switching network invalidates every network-scoped selection. Both entry
  // points — the `network` prop and the header toggle — funnel through here so
  // the resets land in the same render as the `isTestnet` flip, instead of
  // cascading through an effect that watches `isTestnet` and repaints twice.
  const applyNetwork = useCallback(
    (nextIsTestnet: boolean) => {
      setIsTestnet(nextIsTestnet);
      setSelectedChainId(null);
      setTokenAddressPick("");
      setEarnSelectedMarket(null);
      selectPosition(null);
      setEarnAmount("");
      setWithdrawAmount("");
      setPositionsChainId(nextIsTestnet ? "84532" : "");
      if (!nextIsTestnet) setFundingSource("evm");
    },
    [selectPosition, setTokenAddressPick],
  );

  useEffect(() => {
    applyNetwork(networkProp === "testnet");
  }, [networkProp, applyNetwork]);

  const picker = useEarnMarketPicker({
    api: resolvedApi,
    enabled: isOpen && view === "selectMarket",
    configsEnabled: isOpen,
    isTestnet,
    networkEnv,
    earnChainIds,
    earnLenderFilter,
    earnMarketsSource,
    defaultSortBy: earnPoolsSortBy,
    defaultSortDir: earnPoolsSortDir,
  });

  // No "reset on close" effect here by design. `EpochIntentWidget` — the only
  // thing that renders this — returns null while closed, so the whole component
  // unmounts and every value below reverts to its useState initializer on the
  // next open. A reset effect would be dead code that silently rots as new
  // state is added.

  // legacy: callers passing `earnMarkets` directly still see them — we render
  // the configs picker but the deprecated prop is accepted for back-compat.
  void earnMarketsProp;
  void earnPoolsPerChain;

  const positionsState = useUserPositions({
    address,
    network: networkEnv,
    api: resolvedApi,
    // Only fetch positions while the Withdraw tab is active AND the user is
    // on the main list view — skips the request on deposit usage and
    // prevents a refetch when the user enters the withdraw detail view.
    enabled: isOpen && isConnected && earnTab === "withdraw" && view === "main",
    // Scope to the earn chains directly — no longer derived from a full pool
    // config set (the picker is now server-paginated). Empty user filter ⇒
    // fall back to the all-chains CSV.
    chainsOverride: positionsChainId || picker.earnChainsCsv,
    lendersOverride: positionsLenderKey,
  });

  // Auto-pick: when the user lands on the Withdraw tab and positions arrive,
  // jump straight into the detail/amount view with positions[0] selected. The
  // user opens the picker explicitly via the From card chevron — so we only
  // do this once per (open × tab-entry) and never re-trigger it as long as a
  // selection is preserved.
  const didAutoPickRef = useRef(false);
  useEffect(() => {
    if (!isOpen) {
      didAutoPickRef.current = false;
      return;
    }
    if (earnTab !== "withdraw") {
      didAutoPickRef.current = false;
      return;
    }
    if (didAutoPickRef.current) return;
    if (selectedPosition) return;
    const first = positionsState.positions[0];
    if (!first) return;
    didAutoPickRef.current = true;
    selectPosition(first);
    setView("withdrawDetail");
  }, [
    isOpen,
    earnTab,
    positionsState.positions,
    selectedPosition,
    selectPosition,
  ]);

  const gaslessWallet = useGaslessWallet({
    allowGasless:
      effectiveAllowGasless &&
      (earnTab === "withdraw" || fundingSource === "evm"),
    apiBaseUrl: resolvedApi.baseUrl,
    gasless,
    setGasless,
    walletClient,
    address,
    // A withdraw executes on the POSITION's chain, not the deposit funding
    // chain — probing the wrong one would gate the toggle on 7702 support the
    // withdraw never uses.
    chainIdForCheck:
      earnTab === "withdraw"
        ? (selectedPosition?.market.chainId ?? null)
        : fundingSource === "miden"
          ? null
          : (selectedChainId ??
            (isTestnet ? 84532 : (walletClient?.chain?.id ?? null))),
    switchChain,
  });

  const selectedChain = availableChains.find((c) => c.id === selectedChainId);
  const miden = useEarnMiden({
    earnMiden,
    isTestnet,
    midenEnabled,
    fundingSource,
    selectedMidenFaucetId,
    earnTab,
    smartWithdraw,
    smartDestChainId,
    smartDestTokenAddress,
  });

  const pillToken =
    fundingSource === "miden" && miden.sourceToken
      ? miden.sourceToken
      : (selectedToken ?? allTokens[0] ?? null);
  const pillChain =
    fundingSource === "miden"
      ? miden.chain
      : (selectedChain ?? availableChains[0] ?? null);

  useEffect(() => {
    if (!isOpen) return;
    if (fundingSource === "miden") return;
    if (selectedChainId !== null) return;
    const first = allTokens[0];
    if (!first) return;
    setSelectedChainId(first.chain.id);
    setTokenAddressPick(first.address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, allTokens]);

  const { balance, isLoading: isBalanceLoading } = useTokenBalance(
    selectedChainId,
    selectedTokenAddress,
    address,
    api.rpcUrls,
  );

  const {
    activeAmount,
    activeMarket,
    activeBuildOk,
    depositBuildError,
    withdrawBuildError,
    effectiveSourceChainId,
    effectiveSourceToken,
    isSmartWithdrawDegenerate,
  } = useEarnQuoteTarget({
    earnTab,
    fundingSource,
    earnSelectedMarket,
    earnAmount,
    selectedPosition,
    withdrawAmount,
    earnDepositDefaults,
    earnWithdrawDefaults,
    selectedChainId,
    selectedToken,
    midenSourceToken: miden.sourceToken,
    smartWithdraw,
    smartDestChainId,
    smartDestTokenAddress,
    onPinSourceChain: setSelectedChainId,
  });

  const earnFlow = useEarnIntentFlow({
    apiBaseUrl: resolvedApi.baseUrl,
    earnSolverUrl,
    walletClient,
    address,
    sessionId,
    routingAndLiquidityOptions,
    gasless: effectiveAllowGasless && gasless,
    onIntentSent,
    onIntentComplete,
    onError,
    onStart,
    onSign,
    onSuccess,
    onRequestClose: onClose,
  });

  const onStatusRef = useLatestRef(onStatus);
  useEffect(() => {
    const callbackStatus =
      earnFlow.status === "quoting" ? "idle" : earnFlow.status;
    if (callbackStatus === "polling") return;
    onStatusRef.current?.({
      sessionId,
      status: callbackStatus,
      progress: earnFlow.statusProgress,
      activeStep: earnFlow.activeStep,
    });
  }, [
    sessionId,
    earnFlow.status,
    earnFlow.statusProgress,
    earnFlow.activeStep,
    onStatusRef,
  ]);

  // Single point of entry for kicking off a quote — used both by the auto-fire
  // effect (debounced as inputs change) and by the manual "Retry quote" CTA
  // shown when the previous attempt failed.
  const triggerQuote = useCallback(() => {
    if (
      !activeBuildOk ||
      effectiveSourceChainId == null ||
      !effectiveSourceToken ||
      !activeMarket ||
      !address
    )
      return;
    if (
      fundingSource === "miden" &&
      (!earnMiden?.connected || !miden.quoteSource)
    )
      return;
    // Destination not yet moved off the position's own chain/token → no route
    // to quote. Skip until the user picks a real destination.
    if (isSmartWithdrawDegenerate) return;
    // Miden destination chosen but no Miden account connected → no recipient.
    if (miden.smartDestNotReady) return;
    earnFlow.fetchQuote({
      tab: earnTab,
      amount: activeAmount,
      market: activeMarket,
      position: selectedPosition,
      sourceChainId: effectiveSourceChainId,
      sourceToken: effectiveSourceToken,
      network: networkEnv,
      midenSource: miden.quoteSource,
      smartWithdraw: earnTab === "withdraw" ? smartWithdraw : undefined,
      smartDestChainId: earnTab === "withdraw" ? smartDestChainId : undefined,
      smartDestTokenAddress:
        earnTab === "withdraw" ? smartDestTokenAddress : undefined,
      midenDest: earnTab === "withdraw" ? miden.smartDest : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeBuildOk,
    activeAmount,
    activeMarket,
    effectiveSourceChainId,
    effectiveSourceToken?.address,
    address,
    earnTab,
    smartWithdraw,
    smartDestChainId,
    smartDestTokenAddress,
    selectedPosition,
    networkEnv,
    fundingSource,
    miden.quoteSource,
    earnMiden?.connected,
    isSmartWithdrawDegenerate,
    miden.smartDest,
    miden.smartDestNotReady,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(triggerQuote, 250);
    return () => window.clearTimeout(timer);
  }, [triggerQuote]);

  const isWrongNetwork =
    fundingSource === "evm" &&
    effectiveSourceChainId !== null &&
    chainId !== effectiveSourceChainId;
  const insufficientBalance =
    earnTab === "deposit" &&
    fundingSource === "evm" &&
    balance !== null &&
    balance === 0n;
  const insufficientMidenBalance =
    earnTab === "deposit" &&
    fundingSource === "miden" &&
    miden.balance !== null &&
    miden.balance === 0n;
  const isBusy = earnFlow.isBusy;

  // Cross-chain = the market lives on a different chain than the source the
  // user is funding from. SIO will insert a bridge/swap step before the
  // 1delta deposit, so the CTA hints at that.
  const isCrossChain =
    !!activeMarket &&
    earnTab === "deposit" &&
    (fundingSource === "miden" ||
      (selectedChainId !== null &&
        activeMarket.chainId != null &&
        selectedChainId !== activeMarket.chainId));

  const ctaState = resolveEarnCta({
    earnTab,
    fundingSource,
    flow: {
      isQuoting: earnFlow.isQuoting,
      status: earnFlow.status,
      quoteError: earnFlow.quoteError,
    },
    isConnected,
    midenConnected: !!earnMiden?.connected,
    hasSelectedMarket: !!earnSelectedMarket,
    depositAmount: earnAmount,
    hasSelectedPosition: !!selectedPosition,
    withdrawAmount,
    availableChains,
    selectedChain,
    effectiveSourceChainId,
    effectiveSourceToken,
    isWrongNetwork,
    insufficientBalance,
    selectedToken,
    insufficientMidenBalance,
    midenAssetSymbol: miden.selectedAsset?.symbol,
    buildOk: activeBuildOk,
    isSmartWithdrawDegenerate,
    midenSmartDestNotReady: miden.smartDestNotReady,
    isCrossChain,
    submitButtonText,
  });

  const ctaEnabled = isEarnCtaEnabled(ctaState.action);

  const detailTokenSymbol = selectedPosition?.market.token.symbol;
  const modalTitle =
    view === "withdrawDetail" && detailTokenSymbol
      ? `Withdraw ${detailTokenSymbol}`
      : (title ?? (earnTab === "deposit" ? "Earn" : "Withdraw"));

  const headerAction = allowNetworkToggle ? (
    <NetworkToggle
      isTestnet={isTestnet}
      onChange={(checked) => applyNetwork(checked)}
    />
  ) : null;

  const handleConnectMiden = useCallback(() => {
    void Promise.resolve(earnMiden?.connect?.()).catch(() => {
      // useEarnMidenAdapter surfaces a toast; swallow to avoid unhandled rejection.
    });
  }, [earnMiden]);

  const handleCtaClick = () => {
    if (ctaState.action === "connectMiden") {
      handleConnectMiden();
      return;
    }
    if (ctaState.action === "switch") {
      const target =
        earnTab === "withdraw"
          ? (availableChains.find((c) => c.id === effectiveSourceChainId) ??
            selectedChain)
          : selectedChain;
      if (target) switchChain?.({ chainId: target.id });
      return;
    }
    if (ctaState.action === "retry") {
      triggerQuote();
      return;
    }
    if (ctaState.action !== "submit") return;
    if (
      effectiveSourceChainId == null ||
      !effectiveSourceToken ||
      !activeMarket
    )
      return;
    earnFlow.submit({
      tab: earnTab,
      amount: activeAmount,
      market: activeMarket,
      position: selectedPosition,
      sourceChainId: effectiveSourceChainId,
      sourceToken: effectiveSourceToken,
      network: networkEnv,
      quote: earnFlow.quote,
      midenSource: miden.quoteSource,
      smartWithdraw: earnTab === "withdraw" ? smartWithdraw : undefined,
      smartDestChainId: earnTab === "withdraw" ? smartDestChainId : undefined,
      smartDestTokenAddress:
        earnTab === "withdraw" ? smartDestTokenAddress : undefined,
      midenDest: earnTab === "withdraw" ? miden.smartDest : undefined,
    });
  };

  const inlineError =
    earnFlow.error ??
    (earnFlow.quoteError ? `Quote failed: ${earnFlow.quoteError}` : null);

  const ctaToneClasses =
    ctaState.tone === "warning"
      ? "bg-warning hover:bg-warning"
      : "bg-primary hover:bg-primary-hover";

  const showDepositFooter = view === "main" && earnTab === "deposit";
  const showDetailFooter = view === "withdrawDetail";

  const depositFooter = (
    <EarnCtaButton
      label={ctaState.label}
      toneClasses={ctaToneClasses}
      enabled={ctaEnabled}
      busy={isBusy || earnFlow.isQuoting}
      showRetryIcon={ctaState.action === "retry"}
      onClick={handleCtaClick}
      buttonClassName={cn?.button}
      error={inlineError}
    />
  );

  // Busy/quoting states win first (smart-aware progress copy); otherwise defer
  // to ctaState for any non-submit action (switch network, retry a failed
  // quote, or a disabled hint like "Select a different chain or token") so the
  // button never reads "Review Smart Withdrawal" while it actually re-quotes.
  const detailCtaLabel = (() => {
    // While busy, show the hook's live sub-stage (which quote is in flight /
    // waiting on the wallet / submitting) so the button says what's happening.
    if (isBusy)
      return (
        earnFlow.stepLabel ?? (smartWithdraw ? "Routing…" : "Withdrawing…")
      );
    if (earnFlow.isQuoting) return "Fetching quote…";
    if (
      ctaState.action === "switch" ||
      ctaState.action === "retry" ||
      ctaState.action === "disabled"
    )
      return ctaState.label;
    // Idle + ready. "Confirm" (not "Review") — the click executes: it re-quotes
    // both legs and opens the wallet, it does not open a separate review step.
    return smartWithdraw ? "Confirm Smart Withdraw" : "Withdraw Funds";
  })();

  const detailFooter = (
    <WithdrawFundsButton
      label={detailCtaLabel}
      disabled={!ctaEnabled}
      isBusy={isBusy || earnFlow.isQuoting}
      onClick={handleCtaClick}
    />
  );

  const footer = showDepositFooter
    ? depositFooter
    : showDetailFooter
      ? detailFooter
      : undefined;

  // Chrome every view shares. Spread rather than retyped per branch, so a modal
  // prop can't end up wired on three views and forgotten on the fourth.
  const modalChrome = {
    isOpen,
    onClose,
    theme,
    classNames: cn,
    renderInline,
  };
  const backToMain = () => setView("main");

  if (view === "selectToken") {
    const isMidenPicker = fundingSource === "miden" && midenEnabled;
    return (
      <Modal
        {...modalChrome}
        title={isMidenPicker ? "Select Miden asset" : "Select source token"}
        onBack={backToMain}
      >
        {isMidenPicker ? (
          <MidenAssetPicker
            assets={miden.assets.length > 0 ? miden.assets : [DEFAULT_MIDEN_FAUCET]}
            onSelect={(faucetId) => {
              setSelectedMidenFaucetId(faucetId);
              setView("main");
            }}
          />
        ) : (
          <TokenSelector
            tokens={allTokens}
            selectedTokenAddress={selectedTokenAddress}
            selectedChainId={selectedChainId}
            onSelect={(addr, cid) => {
              setSelectedChainId(cid);
              setTokenAddressPick(addr);
              setView("main");
            }}
            onBack={backToMain}
          />
        )}
      </Modal>
    );
  }

  if (view === "withdrawDetail" && selectedPosition) {
    return (
      <Modal
        {...modalChrome}
        title={modalTitle}
        footer={footer}
        onBack={() => {
          setView("main");
          selectPosition(null);
          setWithdrawAmount("");
          setSmartWithdraw(false);
        }}
      >
        <WithdrawDetailPanel
          position={selectedPosition}
          amount={withdrawAmount}
          onAmountChange={(v) => {
            setWithdrawAmount(v);
          }}
          onPickFraction={(human) => {
            setWithdrawAmount(human);
          }}
          onPickAnotherPosition={() => {
            // Open the picker without discarding the current selection — if
            // the user backs out, they return to the same amount + position.
            // The picker swap (onPickPosition) is what resets the amount.
            setView("main");
          }}
          smartWithdraw={smartWithdraw}
          onSmartWithdrawChange={handleSmartWithdrawChange}
          smartDestChainId={smartDestChainId}
          smartDestTokenAddress={smartDestTokenAddress}
          onPickDestChain={(id) => {
            setSmartDestChainId(id);
            // Reset receive token to first option on the new chain so we never
            // surface a stale token from another network. Miden → default faucet.
            if (id === MIDEN_VIRTUAL_CHAIN_ID) {
              setSmartDestTokenAddress(
                miden.destFaucets[0]?.faucetId ?? DEFAULT_MIDEN_FAUCET.faucetId,
              );
            } else {
              const firstTok = getEpochTokensByChainEnv(id, isTestnet)[0];
              setSmartDestTokenAddress(firstTok?.address ?? "");
            }
          }}
          onPickDestToken={setSmartDestTokenAddress}
          isTestnet={isTestnet}
          midenDestEnabled={miden.destEnabled}
          midenRecipientAccount={earnMiden?.accountId}
          midenFaucets={miden.destFaucets}
          buildError={withdrawBuildError}
          quoteError={earnFlow.quoteError}
          isQuoting={earnFlow.isQuoting}
          approxUsd={(() => {
            const usd = selectedPosition.underlyingUsdValue;
            const bal = (() => {
              try {
                return (
                  Number(selectedPosition.underlyingBalanceRaw) /
                  10 ** selectedPosition.market.token.decimals
                );
              } catch {
                return 0;
              }
            })();
            const n = Number(withdrawAmount);
            if (!Number.isFinite(n) || n <= 0 || !usd || bal <= 0) return null;
            return (n / bal) * usd;
          })()}
        />
        {(earnFlow.status === "submitting" ||
          earnFlow.status === "sent" ||
          earnFlow.status === "complete") && (
          <ProgressStepper
            activeStep={
              earnFlow.status === "complete" ? 5 : earnFlow.activeStep
            }
            statusProgress={earnFlow.statusProgress}
            className={cn?.progress}
          />
        )}
        {earnFlow.status === "complete" && (
          <Banner variant="success" className={cn?.banner}>
            <div className="flex items-center gap-2">
              <CheckIcon />
              <span>Withdraw completed successfully.</span>
            </div>
          </Banner>
        )}
      </Modal>
    );
  }

  if (view === "selectMarket") {
    return (
      <Modal
        {...modalChrome}
        title="Select Market"
        onBack={backToMain}
        headerAction={headerAction}
      >
        <MarketPickerPage
          rows={picker.rows}
          selectedId={earnSelectedMarket?.id}
          isLoading={picker.isLoading}
          error={picker.error}
          chainFilter={picker.chainFilter}
          onChainChange={picker.setChainFilter}
          lenderFilter={picker.lenderFilter}
          onLenderChange={picker.setLenderFilter}
          sortBy={picker.sortBy}
          sortDir={picker.sortDir}
          onSortChange={picker.setSort}
          page={picker.page}
          hasMore={picker.hasMore}
          onPrev={picker.prevPage}
          onNext={picker.nextPage}
          availableChainIds={picker.availableChainIds}
          availableLenders={picker.availableLenders}
          onSelect={(m) => {
            setEarnSelectedMarket(m);
            setView("main");
          }}
        />
      </Modal>
    );
  }

  return (
    <Modal
      {...modalChrome}
      title={modalTitle}
      footer={footer}
      headerAction={headerAction}
    >
      {!earnHideTabs && (
        <SegmentedTabs<"deposit" | "withdraw">
          tabs={[
            {
              value: "deposit",
              label: "Deposit",
              icon: <ArrowDownIcon width={14} height={14} />,
            },
            {
              value: "withdraw",
              label: "Withdraw",
              icon: (
                <span
                  style={{
                    display: "inline-flex",
                    transform: "rotate(180deg)",
                  }}
                >
                  <ArrowDownIcon width={14} height={14} />
                </span>
              ),
            },
          ]}
          value={earnTab}
          onChange={setEarnTab}
          size="md"
          style={{ marginBottom: "4px" }}
        />
      )}

      {earnTab === "deposit" ? (
        <>
          {effectiveAllowGasless && fundingSource === "evm" ? (
            <GaslessEnableButton
              gasless={gasless}
              disabledReason={gaslessWallet.unavailableReason}
              needsEpochSetup={gaslessWallet.needsEpochSetup}
              onSwitchSmartAccount={() =>
                gaslessWallet.switchToEpochSmartAccount()
              }
              setupBusy={gaslessWallet.setupBusy}
              setupError={gaslessWallet.setupError}
              checking={gaslessWallet.checking}
              onEnable={() => setGasless(true)}
              onDisable={() => setGasless(false)}
              className="mb-1"
            />
          ) : null}
          <EarnFlowPanel
            selected={earnSelectedMarket}
            onPickMarket={() => setView("selectMarket")}
            amount={earnAmount}
            onAmountChange={setEarnAmount}
            buildError={depositBuildError}
            walletConnected={isConnected}
            walletAddress={isConnected ? address : undefined}
            walletIcon={isConnected ? connector?.icon : undefined}
            sourceTokenSymbol={pillToken?.symbol ?? "-"}
            sourceChainName={pillChain?.name ?? ""}
            sourceTokenLogoURI={pillToken?.logoURI}
            sourceChainLogoURI={pillChain?.logoURI}
            onSelectSourceToken={() => setView("selectToken")}
            walletBalance={
              fundingSource === "miden"
                ? miden.balance
                : isConnected
                  ? balance
                  : null
            }
            sourceTokenDecimals={
              fundingSource === "miden"
                ? (miden.selectedAsset?.decimals ?? 18)
                : (selectedToken?.decimals ?? 18)
            }
            balanceLoading={
              fundingSource === "miden"
                ? false
                : isConnected && !!selectedToken && isBalanceLoading
            }
            midenEnabled={midenEnabled}
            fundingSource={fundingSource}
            onFundingSourceChange={setFundingSource}
            midenConnected={!!earnMiden?.connected}
            onConnectMiden={handleConnectMiden}
          />
        </>
      ) : (
        <>
          {effectiveAllowGasless ? (
            <GaslessEnableButton
              gasless={gasless}
              disabledReason={gaslessWallet.unavailableReason}
              needsEpochSetup={gaslessWallet.needsEpochSetup}
              onSwitchSmartAccount={() =>
                gaslessWallet.switchToEpochSmartAccount()
              }
              setupBusy={gaslessWallet.setupBusy}
              setupError={gaslessWallet.setupError}
              checking={gaslessWallet.checking}
              onEnable={() => setGasless(true)}
              onDisable={() => setGasless(false)}
              className="mb-1"
            />
          ) : null}
          <WithdrawPanel
          positions={positionsState.positions}
          isLoading={positionsState.isLoading}
          error={positionsState.error}
          walletConnected={isConnected}
          isTestnet={isTestnet}
          selectedPositionId={selectedPosition?.id ?? null}
          onPickPosition={(p) => {
            selectPosition(p);
            setWithdrawAmount("");
            setSmartWithdraw(false);
            setView("withdrawDetail");
          }}
          chainFilter={positionsChainId}
          onChainFilterChange={(v) => {
            setPositionsChainId(v);
            selectPosition(null);
            setWithdrawAmount("");
          }}
          lenderFilter={positionsLenderKey}
          onLenderFilterChange={(v) => {
            setPositionsLenderKey(v);
            selectPosition(null);
            setWithdrawAmount("");
          }}
          />
        </>
      )}

      {(earnFlow.status === "submitting" ||
        earnFlow.status === "sent" ||
        earnFlow.status === "complete") && (
        <ProgressStepper
          activeStep={earnFlow.status === "complete" ? 5 : earnFlow.activeStep}
          statusProgress={earnFlow.statusProgress}
          className={cn?.progress}
        />
      )}

      {earnFlow.status === "complete" && (
        <Banner variant="success" className={cn?.banner}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckIcon />
            <span>Earn action completed successfully.</span>
          </div>
        </Banner>
      )}
    </Modal>
  );
}
