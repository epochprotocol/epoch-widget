import { useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, useChainId, useSwitchChain, useWalletClient } from 'wagmi';
import { getEpochChains, getEpochTokensByChainEnv } from '../epoch-config';
import { useTokenBalance } from '../use-token-balance';
import { useSessionId } from '../session';
import { s } from '../styles';
import { t } from '../theme';
import { injectKeyframes } from '../utils';
import type {
  ApiConfig,
  EarnDepositIntentDefaults,
  EarnWithdrawIntentDefaults,
  EpochClassNames,
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
import type { OneDeltaConfig } from '../types';
import { ArrowDownIcon, CheckIcon } from './Icons';
import { SegmentedTabs } from './ui/SegmentedTabs';
import { Banner } from './Banner';
import { EarnFlowPanel } from './EarnFlowPanel';
import { MarketPickerPage } from './MarketPickerPage';
import { Modal } from './Modal';
import { ProgressStepper } from './ProgressStepper';
import { injectShimmerKeyframes } from './Shimmer';
import { TokenSelector, type TokenWithChain } from './TokenSelector';
import { WithdrawPanel } from './WithdrawPanel';

type EarnView = 'main' | 'selectToken' | 'selectMarket';

interface EarnIntentWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  api: ApiConfig;
  /** @deprecated earn is mainnet-only; prop ignored. */
  network?: 'mainnet' | 'testnet';
  /** @deprecated earn is mainnet-only; prop ignored. */
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
  network: _network,
  allowNetworkToggle: _allowNetworkToggle,
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
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('');
  const [view, setView] = useState<EarnView>('main');

  useEffect(() => {
    injectKeyframes();
    injectShimmerKeyframes();
  }, []);

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
    }
  }, [isOpen]);

  const configsState = useEarnConfigs({
    enabled: isOpen,
    source: earnMarketsSource,
  });
  // legacy: callers passing `earnMarkets` directly still see them — we render
  // the configs picker but the deprecated prop is accepted for back-compat.
  void earnMarketsProp;

  const positionsState = useUserPositions({
    address,
    network: 'mainnet',
    api,
    enabled: isOpen && isConnected,
    configs: configsState.configs,
    chainsOverride: '1',
    lendersOverride: '',
  });

  const availableChains = useMemo(() => getEpochChains(false), []);
  const allTokens = useMemo<TokenWithChain[]>(
    () =>
      availableChains.flatMap((chain) =>
        getEpochTokensByChainEnv(chain.id, false).map((tok) => ({ ...tok, chain })),
      ),
    [availableChains],
  );
  const availableTokens = useMemo(
    () => (selectedChainId ? getEpochTokensByChainEnv(selectedChainId, false) : []),
    [selectedChainId],
  );
  const selectedToken = useMemo(
    () => availableTokens.find((tok) => tok.address === selectedTokenAddress) ?? null,
    [availableTokens, selectedTokenAddress],
  );
  const selectedChain = availableChains.find((c) => c.id === selectedChainId);
  const pillToken = selectedToken ?? allTokens[0] ?? null;
  const pillChain = selectedChain ?? availableChains[0] ?? null;

  useEffect(() => {
    if (!isOpen) return;
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
    apiBaseUrl: api.baseUrl,
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

  const effectiveSourceToken = earnTab === 'withdraw' ? withdrawSourceToken : selectedToken;
  const effectiveSourceChainId =
    earnTab === 'withdraw' ? withdrawSourceChainId : selectedChainId;

  useEffect(() => {
    if (!activeBuildOk || effectiveSourceChainId == null || !effectiveSourceToken || !activeMarket || !address) return;
    const timer = window.setTimeout(() => {
      earnFlow.fetchQuote({
        tab: earnTab,
        amount: activeAmount,
        market: activeMarket,
        position: selectedPosition,
        sourceChainId: effectiveSourceChainId,
        sourceToken: effectiveSourceToken,
        network: 'mainnet',
        isAll: earnTab === 'withdraw' ? withdrawIsAll : undefined,
      });
    }, 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBuildOk, activeAmount, activeMarket, effectiveSourceChainId, effectiveSourceToken?.address, address, earnTab, withdrawIsAll]);


  const isWrongNetwork =
    effectiveSourceChainId !== null && chainId !== effectiveSourceChainId;
  const insufficientBalance = earnTab === 'deposit' && balance !== null && balance === 0n;
  const isBusy = earnFlow.isBusy;

  // Cross-chain = the market lives on a different chain than the source the
  // user is funding from. SIO will insert a bridge/swap step before the
  // 1delta deposit, so the CTA hints at that.
  const isCrossChain =
    !!activeMarket &&
    selectedChainId !== null &&
    activeMarket.chainId != null &&
    selectedChainId !== activeMarket.chainId;

  type CtaAction = 'connect' | 'switch' | 'submit' | 'disabled';
  const ctaState: { action: CtaAction; label: string; tone?: 'primary' | 'warning' } = (() => {
    if (earnFlow.isQuoting) return { action: 'disabled', label: 'Fetching quote…' };
    if (earnFlow.status === 'submitting') return { action: 'disabled', label: earnTab === 'deposit' ? 'Depositing…' : 'Withdrawing…' };
    if (earnFlow.status === 'complete') return { action: 'disabled', label: 'Completed' };
    if (!isConnected) return { action: 'connect', label: 'Connect wallet' };
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
    if (!activeBuildOk || effectiveSourceChainId == null || !effectiveSourceToken) {
      return { action: 'disabled', label: 'Enter an amount' };
    }
    const baseLabel = submitButtonText ?? (earnTab === 'deposit' ? 'Deposit' : 'Withdraw');
    return {
      action: 'submit',
      label: isCrossChain && earnTab === 'deposit' ? `Bridge + ${baseLabel}` : baseLabel,
    };
  })();

  const ctaEnabled = ctaState.action === 'submit' || ctaState.action === 'switch';

  const modalTitle = title ?? (earnTab === 'deposit' ? 'Earn' : 'Withdraw');

  const headerAction = null;

  const ctaBg = ctaState.tone === 'warning' ? t.warning : t.primary;
  const ctaBgHover = ctaState.tone === 'warning' ? t.warning : t.primaryHover;

  const handleCtaClick = () => {
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
      network: 'mainnet',
      quote: earnFlow.quote,
      isAll: earnTab === 'withdraw' ? withdrawIsAll : undefined,
    });
  };

  const inlineError =
    earnFlow.error ?? (earnFlow.quoteError ? `Quote failed: ${earnFlow.quoteError}` : null);

  const footer = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {inlineError && (
        <div
          role="alert"
          style={{
            fontSize: '12.5px',
            color: t.error,
            backgroundColor: t.errorSoft,
            border: `1px solid ${t.error}`,
            borderRadius: t.radiusSm,
            padding: '8px 12px',
            lineHeight: 1.4,
          }}
        >
          {inlineError}
        </div>
      )}
      <button
        type="button"
        className={cn?.button}
        style={cn?.button ? undefined : { ...s.button, backgroundColor: ctaBg, ...(ctaEnabled ? {} : s.buttonDisabled) }}
        disabled={!ctaEnabled || isBusy || earnFlow.isQuoting}
        onClick={handleCtaClick}
        onMouseEnter={(e) => {
          if (ctaEnabled && !cn?.button) e.currentTarget.style.backgroundColor = ctaBgHover as string;
        }}
        onMouseLeave={(e) => {
          if (ctaEnabled && !cn?.button) e.currentTarget.style.backgroundColor = ctaBg as string;
        }}
      >
        {(isBusy || earnFlow.isQuoting) && <span style={{ ...s.spinner, color: '#ffffff' }} />}
        {ctaState.label}
      </button>
    </div>
  );

  if (view === 'selectToken') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Select source token"
        theme={theme}
        classNames={cn}
        onBack={() => setView('main')}
        renderInline={renderInline}
      >
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
          walletBalance={isConnected ? balance : null}
          sourceTokenDecimals={selectedToken?.decimals ?? 18}
          balanceLoading={isConnected && !!selectedToken && isBalanceLoading}
        />
      ) : (
        <WithdrawPanel
          positions={positionsState.positions}
          summary={positionsState.summary}
          isLoading={positionsState.isLoading}
          error={positionsState.error}
          walletConnected={isConnected}
          selectedPosition={selectedPosition}
          onSelectPosition={(p) => {
            setSelectedPosition(p);
            setWithdrawAmount('');
            setWithdrawIsAll(false);
          }}
          withdrawAmount={withdrawAmount}
          onAmountChange={(v) => {
            setWithdrawAmount(v);
            setWithdrawIsAll(false);
          }}
          onMaxClick={(p, maxHuman) => {
            if (selectedPosition?.id !== p.id) setSelectedPosition(p);
            setWithdrawAmount(maxHuman);
            setWithdrawIsAll(true);
          }}
          buildError={withdrawBuildError}
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
