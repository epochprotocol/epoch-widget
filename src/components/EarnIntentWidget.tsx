import { useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, useChainId, useSwitchChain, useWalletClient } from 'wagmi';
import { getEpochChains, getEpochTokensByChainEnv } from '../epoch-config';
import { useTokenBalance } from '../use-token-balance';
import { useSessionId } from '../session';
import { cn as twcn } from '../lib/cn';
import type {
  ApiConfig,
  EarnDepositIntentDefaults,
  EarnMidenAdapter,
  EarnWithdrawIntentDefaults,
  EpochClassNames,
  EpochChain,
  EpochEarnMarket,
  EpochEarnPosition,
  EpochTheme,
  EpochToken,
  IntentCompletePayload,
  IntentSentPayload,
  OnErrorCtx,
  OnSignCtx,
  OnStartCtx,
  OnStatusCtx,
  OnSuccessCtx,
} from '../types';
import { buildEarnDepositIntent } from '../earn/build-deposit-intent';
import { buildEarnWithdrawIntent } from '../earn/build-withdraw-intent';
import { useEarnConfigs, useUserPositions } from '../earn/api';
import { useEarnIntentFlow } from '../earn/use-earn-intent-flow';
import { MIDEN_VIRTUAL_CHAIN_ID, DEFAULT_MIDEN_FAUCET, isDefaultMidenFaucet } from '../earn/miden';
import { resolveApiForNetwork } from '../resolve-api-config';
import type { OneDeltaConfig } from '../types';
import { ArrowDownIcon, CheckIcon } from './Icons';
import { SegmentedTabs } from './ui/SegmentedTabs';
import { Banner } from './Banner';
import { EarnFlowPanel } from './EarnFlowPanel';
import { MarketPickerPage } from './MarketPickerPage';
import { Modal } from './Modal';
import { NetworkToggle } from './NetworkToggle';
import { ProgressStepper } from './ProgressStepper';
import { TokenSelector, type TokenWithChain } from './TokenSelector';
import { WithdrawPanel } from './WithdrawPanel';
import { WithdrawDetailPanel, WithdrawFundsButton } from './WithdrawDetailPanel';

type EarnView = 'main' | 'selectToken' | 'selectMarket' | 'withdrawDetail';

interface EarnIntentWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  api: ApiConfig;
  /** Network mode. Default: `"mainnet"`. */
  network?: 'mainnet' | 'testnet';
  /** Allow the user to toggle mainnet/testnet inside the widget. Default: true. */
  allowNetworkToggle?: boolean;
  classNames?: EpochClassNames;
  theme?: 'light' | 'dark' | EpochTheme;
  renderInline?: boolean;
  title?: string;
  submitButtonText?: string;
  earnMarkets?: EpochEarnMarket[];
  earnMarketsSource?: OneDeltaConfig[];
  earnDefaultTab?: 'deposit' | 'withdraw';
  earnHideTabs?: boolean;
  earnDepositDefaults?: EarnDepositIntentDefaults;
  earnWithdrawDefaults?: EarnWithdrawIntentDefaults;
  /** Override the 1delta-solver base URL (`POST /earn/quote`). Defaults to `api.baseUrl`. */
  earnSolverUrl?: string;
  /** Optional Miden wallet adapter for testnet earn deposits funded from Miden. */
  earnMiden?: EarnMidenAdapter;
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
}

export function EarnIntentWidget({
  isOpen,
  onClose,
  api,
  network: networkProp = 'mainnet',
  allowNetworkToggle = true,
  classNames: cn,
  theme,
  renderInline = false,
  title,
  submitButtonText,
  earnMarkets: earnMarketsProp,
  earnMarketsSource,
  earnDefaultTab = 'deposit',
  earnHideTabs = false,
  earnDepositDefaults,
  earnWithdrawDefaults,
  earnSolverUrl,
  earnMiden,
  onIntentSent,
  onIntentComplete,
  onError,
  onOpen,
  onStart,
  onSign,
  onSuccess,
  onStatus,
}: EarnIntentWidgetProps) {
  const sessionId = useSessionId(isOpen);
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const [earnTab, setEarnTab] = useState<'deposit' | 'withdraw'>(earnDefaultTab);
  const [earnSelectedMarket, setEarnSelectedMarket] = useState<EpochEarnMarket | null>(null);
  const [earnAmount, setEarnAmount] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<EpochEarnPosition | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawIsAll, setWithdrawIsAll] = useState(false);
  // Smart Withdraw = let Epoch's intent network bridge/swap the withdrawn
  // underlying to a different chain or token. OFF = receive the underlying on
  // its native chain (current default behaviour). When ON, the
  // `smartDest*` state captures the user's chosen destination — wired into
  // the UI but not yet plumbed into the intent payload (today's flow still
  // pins source = underlying, lands on the position's chain).
  const [smartWithdraw, setSmartWithdraw] = useState(false);
  const [smartDestChainId, setSmartDestChainId] = useState<number | null>(null);
  const [smartDestTokenAddress, setSmartDestTokenAddress] = useState('');
  // Positions-API filters. Defaults: Base (8453), all lenders. User can switch
  // chain or scope to a single lender via the dropdowns in WithdrawPanel.
  const [positionsChainId, setPositionsChainId] = useState(
    networkProp === 'testnet' ? '84532' : '8453',
  );
  const [positionsLenderKey, setPositionsLenderKey] = useState('');
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('');
  const [fundingSource, setFundingSource] = useState<'evm' | 'miden'>('evm');
  const [selectedMidenFaucetId, setSelectedMidenFaucetId] = useState<string>(
    DEFAULT_MIDEN_FAUCET.faucetId,
  );
  const [view, setView] = useState<EarnView>('main');


  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) onOpenRef.current?.();
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setEarnTab(earnDefaultTab);
  }, [isOpen, earnDefaultTab]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedChainId(null);
      setSelectedTokenAddress('');
      setView('main');
      setEarnSelectedMarket(null);
      setEarnAmount('');
      setSelectedPosition(null);
      setWithdrawAmount('');
      setWithdrawIsAll(false);
      setSmartWithdraw(false);
      setSmartDestChainId(null);
      setSmartDestTokenAddress('');
      setFundingSource('evm');
      setSelectedMidenFaucetId(DEFAULT_MIDEN_FAUCET.faucetId);
    }
  }, [isOpen]);

  // Default destination = the position's underlying chain + token. Re-run
  // whenever the user enters/leaves the detail view via a different position.
  useEffect(() => {
    if (!selectedPosition) {
      setSmartDestChainId(null);
      setSmartDestTokenAddress('');
      return;
    }
    if (selectedPosition.market.chainId != null) {
      setSmartDestChainId(selectedPosition.market.chainId);
    }
    setSmartDestTokenAddress(selectedPosition.market.token.address);
  }, [selectedPosition]);

  // Smart Withdraw OFF clears the destination so nothing stale survives if
  // the user toggles it back on for a different position.
  useEffect(() => {
    if (smartWithdraw) return;
    if (selectedPosition) {
      if (selectedPosition.market.chainId != null) {
        setSmartDestChainId(selectedPosition.market.chainId);
      }
      setSmartDestTokenAddress(selectedPosition.market.token.address);
    }
  }, [smartWithdraw, selectedPosition]);

  const [isTestnet, setIsTestnet] = useState(networkProp === 'testnet');
  const networkEnv: 'mainnet' | 'testnet' = isTestnet ? 'testnet' : 'mainnet';
  const midenEnabled =
    networkEnv === 'testnet' &&
    earnMiden != null &&
    earnMiden.enabled !== false;
  const resolvedApi = useMemo(
    () => resolveApiForNetwork(api, networkEnv),
    [api, networkEnv],
  );

  useEffect(() => {
    setIsTestnet(networkProp === 'testnet');
  }, [networkProp]);

  useEffect(() => {
    setSelectedChainId(null);
    setSelectedTokenAddress('');
    setEarnSelectedMarket(null);
    setPositionsChainId(isTestnet ? '84532' : '8453');
  }, [isTestnet]);

  const configsState = useEarnConfigs({
    enabled: isOpen,
    source: earnMarketsSource,
    network: networkEnv,
  });
  // legacy: callers passing `earnMarkets` directly still see them — we render
  // the configs picker but the deprecated prop is accepted for back-compat.
  void earnMarketsProp;

  const positionsState = useUserPositions({
    address,
    network: networkEnv,
    api: resolvedApi,
    enabled: isOpen && isConnected,
    configs: configsState.configs,
    chainsOverride: positionsChainId,
    lendersOverride: positionsLenderKey,
  });

  const availableChains = useMemo(() => getEpochChains(isTestnet), [isTestnet]);
  const allTokens = useMemo<TokenWithChain[]>(
    () =>
      availableChains.flatMap((chain) =>
        getEpochTokensByChainEnv(chain.id, isTestnet).map((tok) => ({ ...tok, chain })),
      ),
    [availableChains, isTestnet],
  );
  const availableTokens = useMemo(
    () => (selectedChainId ? getEpochTokensByChainEnv(selectedChainId, isTestnet) : []),
    [selectedChainId, isTestnet],
  );
  const selectedToken = useMemo(
    () => availableTokens.find((tok) => tok.address === selectedTokenAddress) ?? null,
    [availableTokens, selectedTokenAddress],
  );
  const selectedChain = availableChains.find((c) => c.id === selectedChainId);
  const midenAssets = useMemo(
    () => (earnMiden?.assets ?? []).filter((a) => isDefaultMidenFaucet(a.faucetId)),
    [earnMiden?.assets],
  );

  const selectedMidenAsset = useMemo(
    () =>
      midenAssets.find(
        (a) => a.faucetId.toLowerCase() === selectedMidenFaucetId.toLowerCase(),
      ) ??
      midenAssets[0] ??
      null,
    [midenAssets, selectedMidenFaucetId],
  );
  const midenSourceToken = useMemo((): EpochToken | null => {
    if (!selectedMidenAsset) return null;
    return {
      address: '0x0000000000000000000000000000000000000000',
      symbol: selectedMidenAsset.symbol,
      name: selectedMidenAsset.symbol,
      decimals: selectedMidenAsset.decimals,
      chainId: MIDEN_VIRTUAL_CHAIN_ID,
      logoURI: selectedMidenAsset.logoURI,
    };
  }, [selectedMidenAsset]);
  const midenChain = useMemo(
    (): EpochChain => ({ id: MIDEN_VIRTUAL_CHAIN_ID, name: 'Miden', network: 'miden-testnet' }),
    [],
  );
  const pillToken =
    fundingSource === 'miden' && midenSourceToken
      ? midenSourceToken
      : selectedToken ?? allTokens[0] ?? null;
  const pillChain =
    fundingSource === 'miden' ? midenChain : selectedChain ?? availableChains[0] ?? null;

  useEffect(() => {
    if (!midenEnabled || fundingSource !== 'miden') return;
    if (selectedMidenAsset) return;
    setSelectedMidenFaucetId(DEFAULT_MIDEN_FAUCET.faucetId);
  }, [midenEnabled, fundingSource, selectedMidenAsset]);

  useEffect(() => {
    if (!isOpen) return;
    if (fundingSource === 'miden') return;
    if (selectedChainId !== null) return;
    const first = allTokens[0];
    if (!first) return;
    setSelectedChainId(first.chain.id);
    setSelectedTokenAddress(first.address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, allTokens]);

  useEffect(() => {
    if (availableTokens.length > 0) {
      setSelectedTokenAddress((prev) =>
        availableTokens.some((tok) => tok.address === prev) ? prev : availableTokens[0].address,
      );
    } else {
      setSelectedTokenAddress('');
    }
  }, [availableTokens]);

  const { balance, isLoading: isBalanceLoading } = useTokenBalance(
    selectedChainId,
    selectedTokenAddress,
    address,
    api.rpcUrls,
  );

  // For withdraw, the source token / chain are not user-pickable — they are
  // pinned to the underlying of the selected position. parseUnits in the
  // intent builder needs the right decimal scaling, and tokenIn = underlying
  // keeps the flow single-chain (no bridge insertion before the withdraw).
  // The position's underlying may not appear in the epoch-config token list,
  // so we synthesize the source token from the market instead of relying on
  // selectedTokenAddress lookup.
  const withdrawSourceChainId =
    earnTab === 'withdraw' && selectedPosition?.market.chainId != null
      ? selectedPosition.market.chainId
      : null;
  const withdrawSourceToken =
    earnTab === 'withdraw' && selectedPosition && selectedPosition.market.chainId != null
      ? ({
          address: selectedPosition.market.token.address,
          symbol: selectedPosition.market.token.symbol,
          name: selectedPosition.market.token.symbol,
          decimals: selectedPosition.market.token.decimals,
          chainId: selectedPosition.market.chainId,
          logoURI: selectedPosition.market.token.logoURI,
        } as EpochToken)
      : null;
  useEffect(() => {
    if (withdrawSourceChainId !== null) setSelectedChainId(withdrawSourceChainId);
  }, [withdrawSourceChainId]);

  const depositBuild = useMemo(() => {
    if (earnTab !== 'deposit' || !earnSelectedMarket || !earnAmount.trim()) return null;
    return buildEarnDepositIntent(earnSelectedMarket, earnAmount, earnDepositDefaults);
  }, [earnTab, earnSelectedMarket, earnAmount, earnDepositDefaults]);

  const withdrawBuild = useMemo(() => {
    if (earnTab !== 'withdraw' || !selectedPosition || !withdrawAmount.trim()) return null;
    return buildEarnWithdrawIntent(selectedPosition, withdrawAmount, earnWithdrawDefaults);
  }, [earnTab, selectedPosition, withdrawAmount, earnWithdrawDefaults]);

  const depositBuildError = depositBuild && !depositBuild.ok ? depositBuild.error : null;
  const withdrawBuildError = withdrawBuild && !withdrawBuild.ok ? withdrawBuild.error : null;
  const activeAmount = earnTab === 'deposit' ? earnAmount : withdrawAmount;
  const activeMarket = earnTab === 'deposit' ? earnSelectedMarket : selectedPosition?.market ?? null;
  const activeBuildOk = earnTab === 'deposit' ? depositBuild?.ok === true : withdrawBuild?.ok === true;

  const earnFlow = useEarnIntentFlow({
    apiBaseUrl: resolvedApi.baseUrl,
    earnSolverUrl,
    walletClient,
    address,
    sessionId,
    onIntentSent,
    onIntentComplete,
    onError,
    onStart,
    onSign,
    onSuccess,
    onRequestClose: onClose,
  });

  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;
  useEffect(() => {
    const callbackStatus = earnFlow.status === 'quoting' ? 'idle' : earnFlow.status;
    if (callbackStatus === 'polling') return;
    onStatusRef.current?.({
      sessionId,
      status: callbackStatus,
      progress: earnFlow.statusProgress,
      activeStep: earnFlow.activeStep,
    });
  }, [sessionId, earnFlow.status, earnFlow.statusProgress, earnFlow.activeStep]);

  const effectiveSourceToken =
    earnTab === 'withdraw'
      ? withdrawSourceToken
      : fundingSource === 'miden'
        ? midenSourceToken
        : selectedToken;
  const effectiveSourceChainId =
    earnTab === 'withdraw'
      ? withdrawSourceChainId
      : fundingSource === 'miden'
        ? MIDEN_VIRTUAL_CHAIN_ID
        : selectedChainId;
  const isWrongNetwork =
    fundingSource === 'evm' &&
    effectiveSourceChainId !== null &&
    chainId !== effectiveSourceChainId;
  const midenBalance = selectedMidenAsset?.balance ?? null;

  const midenQuoteSource =
    fundingSource === 'miden' &&
    earnMiden?.accountId &&
    selectedMidenAsset
      ? {
          accountId: earnMiden.accountId,
          faucetId: selectedMidenAsset.faucetId,
          decimals: selectedMidenAsset.decimals,
          createP2IDNote: earnMiden.createP2IDNote,
          reclaimHeight: earnMiden.reclaimHeight,
        }
      : undefined;

  useEffect(() => {
    if (!activeBuildOk || effectiveSourceChainId == null || !effectiveSourceToken || !activeMarket || !address) return;
    if (fundingSource === 'miden' && (!earnMiden?.connected || !midenQuoteSource)) return;
    if (isWrongNetwork) return;
    const timer = window.setTimeout(() => {
      earnFlow.fetchQuote({
        tab: earnTab,
        amount: activeAmount,
        market: activeMarket,
        position: selectedPosition,
        sourceChainId: effectiveSourceChainId,
        sourceToken: effectiveSourceToken,
        network: networkEnv,
        midenSource: midenQuoteSource,
        isAll: earnTab === 'withdraw' ? withdrawIsAll : undefined,
        smartWithdraw: earnTab === 'withdraw' ? smartWithdraw : undefined,
        smartDestChainId: earnTab === 'withdraw' ? smartDestChainId : undefined,
        smartDestTokenAddress: earnTab === 'withdraw' ? smartDestTokenAddress : undefined,
      });
    }, 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBuildOk, activeAmount, activeMarket, effectiveSourceChainId, effectiveSourceToken?.address, address, earnTab, withdrawIsAll, smartWithdraw, smartDestChainId, smartDestTokenAddress, networkEnv, isWrongNetwork, chainId, fundingSource, midenQuoteSource, earnMiden?.connected]);


  const insufficientBalance =
    earnTab === 'deposit' &&
    fundingSource === 'evm' &&
    balance !== null &&
    balance === 0n;
  const insufficientMidenBalance =
    earnTab === 'deposit' &&
    fundingSource === 'miden' &&
    midenBalance !== null &&
    midenBalance === 0n;
  const isBusy = earnFlow.isBusy;

  // Cross-chain = the market lives on a different chain than the source the
  // user is funding from. SIO will insert a bridge/swap step before the
  // 1delta deposit, so the CTA hints at that.
  const isCrossChain =
    !!activeMarket &&
    earnTab === 'deposit' &&
    (fundingSource === 'miden' ||
      (selectedChainId !== null &&
        activeMarket.chainId != null &&
        selectedChainId !== activeMarket.chainId));

  type CtaAction = 'connect' | 'connectMiden' | 'switch' | 'submit' | 'disabled';
  const ctaState: { action: CtaAction; label: string; tone?: 'primary' | 'warning' } = (() => {
    if (earnFlow.isQuoting) return { action: 'disabled', label: 'Fetching quote…' };
    if (earnFlow.status === 'submitting') return { action: 'disabled', label: earnTab === 'deposit' ? 'Depositing…' : 'Withdrawing…' };
    if (earnFlow.status === 'complete') return { action: 'disabled', label: 'Completed' };
    if (!isConnected) return { action: 'connect', label: 'Connect wallet' };
    if (earnTab === 'deposit' && fundingSource === 'miden' && !earnMiden?.connected) {
      return { action: 'connectMiden', label: 'Connect Miden wallet' };
    }
    if (earnTab === 'deposit' && !earnSelectedMarket) return { action: 'disabled', label: 'Select market' };
    if (earnTab === 'deposit' && !earnAmount.trim()) return { action: 'disabled', label: 'Enter an amount' };
    if (earnTab === 'withdraw' && !selectedPosition) return { action: 'disabled', label: 'Select a position' };
    if (earnTab === 'withdraw' && !withdrawAmount.trim()) return { action: 'disabled', label: 'Enter an amount' };
    const switchTargetChain =
      earnTab === 'withdraw'
        ? availableChains.find((c) => c.id === effectiveSourceChainId) ?? selectedChain
        : selectedChain;
    if (isWrongNetwork && switchTargetChain) {
      return { action: 'switch', label: `Switch to ${switchTargetChain.name}`, tone: 'warning' };
    }
    if (insufficientBalance && selectedToken) {
      return { action: 'disabled', label: `Insufficient ${selectedToken.symbol} balance` };
    }
    if (insufficientMidenBalance && selectedMidenAsset) {
      return { action: 'disabled', label: `Insufficient ${selectedMidenAsset.symbol} balance` };
    }
    if (!activeBuildOk || effectiveSourceChainId == null || !effectiveSourceToken) {
      return { action: 'disabled', label: 'Enter an amount' };
    }
    const baseLabel = submitButtonText ?? (earnTab === 'deposit' ? 'Deposit' : 'Withdraw');
    const crossLabel =
      fundingSource === 'miden' && earnTab === 'deposit'
        ? `Bridge from Miden + ${baseLabel}`
        : isCrossChain && earnTab === 'deposit'
          ? `Bridge + ${baseLabel}`
          : baseLabel;
    return {
      action: 'submit',
      label: crossLabel,
    };
  })();

  const ctaEnabled =
    ctaState.action === 'submit' ||
    ctaState.action === 'switch' ||
    ctaState.action === 'connectMiden';

  const detailTokenSymbol = selectedPosition?.market.token.symbol;
  const modalTitle =
    view === 'withdrawDetail' && detailTokenSymbol
      ? `Withdraw ${detailTokenSymbol}`
      : title ?? (earnTab === 'deposit' ? 'Earn' : 'Withdraw');

  const headerAction = allowNetworkToggle ? (
    <NetworkToggle
      isTestnet={isTestnet}
      onChange={(checked) => {
        setIsTestnet(checked);
        setSelectedChainId(null);
        setSelectedTokenAddress('');
        setEarnSelectedMarket(null);
        setSelectedPosition(null);
        setEarnAmount('');
        setWithdrawAmount('');
        if (!checked) setFundingSource('evm');
      }}
    />
  ) : null;

  const handleCtaClick = () => {
    if (ctaState.action === 'connectMiden') {
      void earnMiden?.connect?.();
      return;
    }
    if (ctaState.action === 'switch') {
      const target =
        earnTab === 'withdraw'
          ? availableChains.find((c) => c.id === effectiveSourceChainId) ?? selectedChain
          : selectedChain;
      if (target) switchChain?.({ chainId: target.id });
      return;
    }
    if (ctaState.action !== 'submit') return;
    if (effectiveSourceChainId == null || !effectiveSourceToken || !activeMarket) return;
    earnFlow.submit({
      tab: earnTab,
      amount: activeAmount,
      market: activeMarket,
      position: selectedPosition,
      sourceChainId: effectiveSourceChainId,
      sourceToken: effectiveSourceToken,
      network: networkEnv,
      quote: earnFlow.quote,
      midenSource: midenQuoteSource,
      isAll: earnTab === 'withdraw' ? withdrawIsAll : undefined,
      smartWithdraw: earnTab === 'withdraw' ? smartWithdraw : undefined,
      smartDestChainId: earnTab === 'withdraw' ? smartDestChainId : undefined,
      smartDestTokenAddress: earnTab === 'withdraw' ? smartDestTokenAddress : undefined,
    });
  };

  const inlineError =
    earnFlow.error ?? (earnFlow.quoteError ? `Quote failed: ${earnFlow.quoteError}` : null);

  const ctaToneClasses =
    ctaState.tone === 'warning'
      ? 'bg-warning hover:bg-warning'
      : 'bg-primary hover:bg-primary-hover';

  const showDepositFooter = view === 'main' && earnTab === 'deposit';
  const showDetailFooter = view === 'withdrawDetail';

  const depositFooter = (
    <div className="flex flex-col gap-2">
      {inlineError && (
        <div
          role="alert"
          className="rounded-sm border border-error bg-error-soft px-3 py-2 text-[12.5px] leading-snug text-error"
        >
          {inlineError}
        </div>
      )}
      <button
        type="button"
        className={twcn(
          'flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border-0 px-4 py-3.5 text-[15px] font-[650] -tracking-[0.005em] text-white shadow-md transition-[background-color,box-shadow,transform] duration-150',
          ctaToneClasses,
          (!ctaEnabled || isBusy || earnFlow.isQuoting) && 'cursor-not-allowed opacity-45',
          cn?.button,
        )}
        disabled={!ctaEnabled || isBusy || earnFlow.isQuoting}
        onClick={handleCtaClick}
      >
        {(isBusy || earnFlow.isQuoting) && (
          <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin-epoch rounded-full border-2 border-white border-t-transparent" />
        )}
        {ctaState.label}
      </button>
    </div>
  );

  const detailCtaLabel =
    ctaState.action === 'switch'
      ? ctaState.label
      : isBusy
        ? smartWithdraw ? 'Routing…' : 'Withdrawing…'
        : earnFlow.isQuoting
          ? 'Fetching quote…'
          : smartWithdraw
            ? 'Review Smart Withdrawal'
            : 'Withdraw Funds';

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

  if (view === 'selectToken') {
    const isMidenPicker = fundingSource === 'miden' && midenEnabled;
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isMidenPicker ? 'Select Miden asset' : 'Select source token'}
        theme={theme}
        classNames={cn}
        onBack={() => setView('main')}
        renderInline={renderInline}
      >
        {isMidenPicker ? (
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {(midenAssets.length > 0 ? midenAssets : [DEFAULT_MIDEN_FAUCET]).map((asset) => (
              <li key={asset.faucetId}>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between rounded-md border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-line-strong"
                  onClick={() => {
                    setSelectedMidenFaucetId(asset.faucetId);
                    setView('main');
                  }}
                >
                  <span className="text-sm font-semibold text-fg">{asset.symbol}</span>
                  <span className="text-xs text-fg-muted">Miden</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <TokenSelector
            tokens={allTokens}
            selectedTokenAddress={selectedTokenAddress}
            selectedChainId={selectedChainId}
            onSelect={(addr, cid) => {
              setSelectedChainId(cid);
              setSelectedTokenAddress(addr);
              setView('main');
            }}
            onBack={() => setView('main')}
          />
        )}
      </Modal>
    );
  }

  if (view === 'withdrawDetail' && selectedPosition) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        theme={theme}
        classNames={cn}
        footer={footer}
        onBack={() => {
          setView('main');
          setSelectedPosition(null);
          setWithdrawAmount('');
          setWithdrawIsAll(false);
          setSmartWithdraw(false);
          setSmartDestChainId(null);
          setSmartDestTokenAddress('');
        }}
        renderInline={renderInline}
      >
        <WithdrawDetailPanel
          position={selectedPosition}
          amount={withdrawAmount}
          onAmountChange={(v) => {
            setWithdrawAmount(v);
            setWithdrawIsAll(false);
          }}
          onPickFraction={(human, isMax) => {
            setWithdrawAmount(human);
            setWithdrawIsAll(isMax);
          }}
          smartWithdraw={smartWithdraw}
          onSmartWithdrawChange={setSmartWithdraw}
          smartDestChainId={smartDestChainId}
          smartDestTokenAddress={smartDestTokenAddress}
          onPickDestChain={(id) => {
            setSmartDestChainId(id);
            // Reset receive token to first option on the new chain so we never
            // surface a stale token from another network.
            const firstTok = getEpochTokensByChainEnv(id, false)[0];
            setSmartDestTokenAddress(firstTok?.address ?? '');
          }}
          onPickDestToken={setSmartDestTokenAddress}
          buildError={withdrawBuildError}
          quoteError={earnFlow.quoteError}
          isQuoting={earnFlow.isQuoting}
          approxUsd={(() => {
            const usd = selectedPosition.underlyingUsdValue;
            const bal = (() => {
              try {
                return Number(selectedPosition.underlyingBalanceRaw) /
                  10 ** selectedPosition.market.token.decimals;
              } catch {
                return 0;
              }
            })();
            const n = Number(withdrawAmount);
            if (!Number.isFinite(n) || n <= 0 || !usd || bal <= 0) return null;
            return (n / bal) * usd;
          })()}
        />
        {(earnFlow.status === 'submitting' || earnFlow.status === 'sent' || earnFlow.status === 'complete') && (
          <ProgressStepper
            activeStep={earnFlow.status === 'complete' ? 5 : earnFlow.activeStep}
            statusProgress={earnFlow.statusProgress}
            className={cn?.progress}
          />
        )}
        {earnFlow.status === 'complete' && (
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

  if (view === 'selectMarket') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Select Market"
        theme={theme}
        classNames={cn}
        onBack={() => setView('main')}
        renderInline={renderInline}
        headerAction={headerAction}
      >
        <MarketPickerPage
          configs={configsState.configs}
          selectedId={earnSelectedMarket?.id}
          isLoading={configsState.isLoading}
          error={configsState.error}
          sourceChainId={selectedChainId}
          onSelect={(m) => {
            // Keep the user's source chain/token — cross-chain deposits bridge
            // from source chain into the market's chain via SIO.
            setEarnSelectedMarket(m);
            setView('main');
          }}
        />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      theme={theme}
      classNames={cn}
      footer={footer}
      headerAction={headerAction}
      renderInline={renderInline}
    >
      {!earnHideTabs && (
        <SegmentedTabs<'deposit' | 'withdraw'>
          tabs={[
            { value: 'deposit', label: 'Deposit', icon: <ArrowDownIcon width={14} height={14} /> },
            {
              value: 'withdraw',
              label: 'Withdraw',
              icon: (
                <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}>
                  <ArrowDownIcon width={14} height={14} />
                </span>
              ),
            },
          ]}
          value={earnTab}
          onChange={setEarnTab}
          size="md"
          style={{ marginBottom: '4px' }}
        />
      )}

      {earnTab === 'deposit' ? (
        <EarnFlowPanel
          selected={earnSelectedMarket}
          onPickMarket={() => setView('selectMarket')}
          amount={earnAmount}
          onAmountChange={setEarnAmount}
          buildError={depositBuildError}
          walletConnected={isConnected}
          walletAddress={isConnected ? address : undefined}
          walletIcon={isConnected ? connector?.icon : undefined}
          sourceTokenSymbol={pillToken?.symbol ?? '-'}
          sourceChainName={pillChain?.name ?? ''}
          sourceTokenLogoURI={pillToken?.logoURI}
          sourceChainLogoURI={pillChain?.logoURI}
          onSelectSourceToken={() => setView('selectToken')}
          walletBalance={fundingSource === 'miden' ? midenBalance : isConnected ? balance : null}
          sourceTokenDecimals={
            fundingSource === 'miden'
              ? (selectedMidenAsset?.decimals ?? 6)
              : (selectedToken?.decimals ?? 18)
          }
          balanceLoading={fundingSource === 'evm' && isConnected && !!selectedToken && isBalanceLoading}
          midenEnabled={midenEnabled}
          fundingSource={fundingSource}
          onFundingSourceChange={(source) => {
            setFundingSource(source);
            if (source === 'evm') {
              setSelectedMidenFaucetId(DEFAULT_MIDEN_FAUCET.faucetId);
            }
          }}
          midenConnected={!!earnMiden?.connected}
          onConnectMiden={() => void earnMiden?.connect?.()}
        />
      ) : (
        <WithdrawPanel
          positions={positionsState.positions}
          summary={positionsState.summary}
          isLoading={positionsState.isLoading}
          error={positionsState.error}
          walletConnected={isConnected}
          selectedPositionId={selectedPosition?.id ?? null}
          onPickPosition={(p) => {
            setSelectedPosition(p);
            setWithdrawAmount('');
            setWithdrawIsAll(false);
            setSmartWithdraw(false);
            setView('withdrawDetail');
          }}
          chainFilter={positionsChainId}
          onChainFilterChange={(v) => {
            setPositionsChainId(v);
            setSelectedPosition(null);
            setWithdrawAmount('');
            setWithdrawIsAll(false);
          }}
          lenderFilter={positionsLenderKey}
          onLenderFilterChange={(v) => {
            setPositionsLenderKey(v);
            setSelectedPosition(null);
            setWithdrawAmount('');
            setWithdrawIsAll(false);
          }}
        />
      )}

      {(earnFlow.status === 'submitting' || earnFlow.status === 'sent' || earnFlow.status === 'complete') && (
        <ProgressStepper
          activeStep={earnFlow.status === 'complete' ? 5 : earnFlow.activeStep}
          statusProgress={earnFlow.statusProgress}
          className={cn?.progress}
        />
      )}

      {earnFlow.status === 'complete' && (
        <Banner variant="success" className={cn?.banner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckIcon />
            <span>Earn action completed successfully.</span>
          </div>
        </Banner>
      )}
    </Modal>
  );
}
