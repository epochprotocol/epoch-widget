import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useChainId, useSwitchChain, useWalletClient } from "wagmi";
import { getEpochChains, getEpochTokensByChainEnv } from "../epoch-config";
import { useTokenBalance } from "../use-token-balance";
import { useSessionId } from "../session";
import type { EpochEarnMarket, EpochEarnPosition } from "../types";
import { useUserPositions } from "./api";
import { useEarnMarketPicker } from "./use-earn-market-picker";
import { useEarnMiden } from "./use-earn-miden";
import { useEarnQuoteTarget } from "./use-earn-quote-target";
import { resolveEarnCta, isEarnCtaEnabled } from "./earn-cta";
import { EARN_TESTNET_SOURCE_EVM_CHAIN_IDS } from "./earn-chains";
import { DEFAULT_MIDEN_FAUCET } from "./miden";
import {
  DUMMY_LENDING_SUPPORTED_ADDRESSES,
  DEPRECATED_DUMMY_LENDING_USDC_ADDRESS,
} from "./dummy-lending-markets";
import { resolveApiForNetwork } from "../resolve-api-config";
import { useEarnIntentFlow } from "./use-earn-intent-flow";
import { useEffectiveGasless } from "../hooks/use-effective-gasless";
import { useGaslessWallet } from "../hooks/use-gasless-wallet-check";
import { usePropOverride } from "../hooks/use-prop-override";
import { useLatestRef } from "../hooks/use-latest-ref";
import { useOnOpen } from "../hooks/use-on-open";
import { useTokenPick } from "../hooks/use-token-pick";
import type { TokenWithChain } from "../components/TokenSelector";
import type { EarnIntentWidgetProps } from "./earn-props";

export type EarnView = "main" | "selectToken" | "selectMarket" | "withdrawDetail";

/**
 * Choices that only make sense for one network. Tagged with `forTestnet` so a
 * network flip invalidates them together rather than one reset per field.
 */
interface EarnSelection {
  forTestnet: boolean;
  market: EpochEarnMarket | null;
  depositAmount: string;
  position: EpochEarnPosition | null;
  withdrawAmount: string;
  chainId: number | null;
  fundingSource: "evm" | "miden";
  /** Positions-API chain filter. Testnet pins Base Sepolia; mainnet = all. */
  positionsChainId: string;
  /**
   * Smart Withdraw routes the withdrawn underlying to another chain/token via
   * the intent network. OFF = receive it on the position's own chain.
   */
  smartWithdraw: boolean;
  smartDestChainId: number | null;
  smartDestTokenAddress: string;
}

const defaultSelection = (isTestnet: boolean): EarnSelection => ({
  forTestnet: isTestnet,
  market: null,
  depositAmount: "",
  position: null,
  withdrawAmount: "",
  chainId: null,
  fundingSource: "evm",
  positionsChainId: isTestnet ? "84532" : "",
  smartWithdraw: false,
  smartDestChainId: null,
  smartDestTokenAddress: "",
});

/**
 * Everything the Earn widget knows, minus how it looks.
 *
 * Takes the widget's props whole so the component isn't a forty-line
 * destructure before it can render anything.
 */
export function useEarnEngine(props: EarnIntentWidgetProps) {
  const {
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
  } = props;

  const sessionId = useSessionId(isOpen);
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const effectiveAllowGasless = useEffectiveGasless(allowGasless, walletClient);

  const [earnTab, setEarnTab] = usePropOverride(
    earnDefaultTab,
    (t) => t,
  );
  const [isTestnet, applyNetwork] = usePropOverride(
    networkProp,
    (n) => n === "testnet",
  );

  const [positionsLenderKey, setPositionsLenderKey] = useState("");

  // Every network-scoped choice, stored as one value tagged with the network it
  // was made on. A flip makes the whole set stale at once, so `selection` falls
  // back to defaults and nothing has to remember to reset it.
  const [storedSelection, setStoredSelection] = useState<EarnSelection>(() =>
    defaultSelection(networkProp === "testnet"),
  );
  const selection =
    storedSelection.forTestnet === isTestnet
      ? storedSelection
      : defaultSelection(isTestnet);
  const patchSelection = useCallback(
    (patch: Partial<EarnSelection>) =>
      setStoredSelection((prev) => ({
        ...(prev.forTestnet === isTestnet
          ? prev
          : defaultSelection(isTestnet)),
        ...patch,
        forTestnet: isTestnet,
      })),
    [isTestnet],
  );

  const {
    market: earnSelectedMarket,
    depositAmount: earnAmount,
    position: selectedPosition,
    withdrawAmount,
    chainId: selectedChainId,
    positionsChainId,
    smartWithdraw,
    smartDestChainId,
    smartDestTokenAddress,
  } = selection;
  // Miden funding only exists on testnet, so it can't survive a flip to mainnet.
  const fundingSource = isTestnet ? selection.fundingSource : "evm";

  const setEarnSelectedMarket = useCallback(
    (market: EpochEarnMarket | null) => patchSelection({ market }),
    [patchSelection],
  );
  const setEarnAmount = useCallback(
    (depositAmount: string) => patchSelection({ depositAmount }),
    [patchSelection],
  );
  const setSelectedPosition = useCallback(
    (position: EpochEarnPosition | null) => patchSelection({ position }),
    [patchSelection],
  );
  const setWithdrawAmount = useCallback(
    (v: string) => patchSelection({ withdrawAmount: v }),
    [patchSelection],
  );
  const setSelectedChainId = useCallback(
    (chainId: number | null) => patchSelection({ chainId }),
    [patchSelection],
  );
  const setPositionsChainId = useCallback(
    (v: string) => patchSelection({ positionsChainId: v }),
    [patchSelection],
  );
  const setSmartWithdraw = useCallback(
    (v: boolean) => patchSelection({ smartWithdraw: v }),
    [patchSelection],
  );
  const setSmartDestChainId = useCallback(
    (v: number | null) => patchSelection({ smartDestChainId: v }),
    [patchSelection],
  );
  const setSmartDestTokenAddress = useCallback(
    (v: string) => patchSelection({ smartDestTokenAddress: v }),
    [patchSelection],
  );
  const setFundingSource = useCallback(
    (v: "evm" | "miden") => patchSelection({ fundingSource: v }),
    [patchSelection],
  );
  const [selectedMidenFaucetId, setSelectedMidenFaucetId] = useState<string>(
    DEFAULT_MIDEN_FAUCET.faucetId,
  );
  const [view, setView] = useState<EarnView>("main");
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
    [setSmartDestChainId, setSmartDestTokenAddress],
  );

  // Every position change reseeds the destination in the same render, rather
  // than letting an effect watch `selectedPosition` and set it a render later.
  const selectPosition = useCallback(
    (position: EpochEarnPosition | null) => {
      setSelectedPosition(position);
      applySmartDestDefaults(position);
    },
    [applySmartDestDefaults, setSelectedPosition],
  );

  // Smart Withdraw OFF restores the position's own chain + underlying so
  // nothing stale survives if the user toggles it back on.
  const handleSmartWithdrawChange = useCallback(
    (next: boolean) => {
      setSmartWithdraw(next);
      if (!next) applySmartDestDefaults(selectedPosition);
    },
    [applySmartDestDefaults, selectedPosition, setSmartWithdraw],
  );

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

  // No reset-on-close effect: `EpochIntentWidget` unmounts this while closed,
  // so state reverts to its initializers on the next open.

  // Deprecated `earnMarkets` prop, still accepted for back-compat.
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
  return {
    address,
    allTokens,
    balance,
    connector,
    walletIcon: connector?.icon,
    ctaEnabled,
    ctaState,
    depositBuildError,
    earnAmount,
    earnFlow,
    earnSelectedMarket,
    earnTab,
    effectiveAllowGasless,
    fundingSource,
    gasless,
    gaslessWallet,
    handleConnectMiden,
    handleCtaClick,
    handleSmartWithdrawChange,
    isBalanceLoading,
    isBusy,
    isConnected,
    isTestnet,
    miden,
    midenEnabled,
    modalTitle,
    picker,
    pillChain,
    pillToken,
    positionsChainId,
    positionsLenderKey,
    positionsState,
    selectPosition,
    selectedChainId,
    selectedPosition,
    selectedToken,
    selectedTokenAddress,
    setEarnAmount,
    setEarnSelectedMarket,
    setEarnTab,
    setFundingSource,
    setGasless,
    setPositionsChainId,
    setPositionsLenderKey,
    setSelectedChainId,
    setSelectedMidenFaucetId,
    setSmartDestChainId,
    setSmartDestTokenAddress,
    setSmartWithdraw,
    setTokenAddressPick,
    setWithdrawAmount,
    smartDestChainId,
    smartDestTokenAddress,
    smartWithdraw,
    view,
    setView,
    withdrawAmount,
    withdrawBuildError,
    applyNetwork,
    allowNetworkToggle,
    cn,
    theme,
    renderInline,
    isOpen,
    onClose,
    earnHideTabs,
    earnMiden,
  };
}

export type EarnEngine = ReturnType<typeof useEarnEngine>;
