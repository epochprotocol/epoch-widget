import { useEffect, useMemo, useState, useRef } from 'react';
import { useWalletClient, useAccount, useChainId, useSwitchChain } from 'wagmi';
import { getEpochChainById, getEpochChains, getEpochTokensByChainEnv } from '../epoch-config';
import { useTokenBalance } from '../use-token-balance';
import { useIntentFlow, type IntentFlowStatus } from '../use-intent-flow';
import { useTokenUsdPrice } from '../hooks/use-token-usd-price';
import { useSessionId } from '../session';
import { cn as twcn } from '../lib/cn';
import { formatAmount } from '../utils';
import { Modal } from './Modal';
import { ProgressStepper } from './ProgressStepper';
import { NetworkToggle } from './NetworkToggle';
import { TokenSelector, type TokenWithChain } from './TokenSelector';
import { PayIntentSummary } from './PayIntentSummary';
import { SwapIntentSummary } from './SwapIntentSummary';
import { Banner } from './Banner';
import { TokenChainPill } from './TokenChainPill';
import { CheckIcon } from './Icons';
import { buildPayIntentFromFlatProps } from '../pay/build-pay-intent';
import type { EpochIntentWidgetProps, IntentProps } from '../types';

type WidgetView = 'main' | 'selectToken';

const PLACEHOLDER_INTENT: IntentProps = {
  requiredToken: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: '',
    decimals: 18,
  },
  requiredAmount: 0n,
  config: {
    protocol: 'transfer',
    action: 'pay',
    fixedOutput: false,
  },
};

export type PaySwapIntentWidgetProps = Pick<
  EpochIntentWidgetProps,
  | 'isOpen'
  | 'onClose'
  | 'api'
  | 'network'
  | 'allowNetworkToggle'
  | 'classNames'
  | 'theme'
  | 'onIntentSent'
  | 'onIntentComplete'
  | 'onError'
  | 'onStart'
  | 'onSign'
  | 'onSuccess'
  | 'onStatus'
  | 'title'
  | 'submitButtonText'
  | 'renderInline'
  | 'intent'
  | 'toAddress'
  | 'toAmount'
  | 'toChainId'
  | 'toToken'
  | 'toTokenDecimals'
  | 'toTokenSymbol'
  | 'sourceChainIds'
  | 'sourceTokenFilter'
  | 'defaultSourceChainId'
  | 'defaultSourceTokenAddress'
  | 'lockSourceToken'
  | 'ctaLabels'
  | 'usdPriceFor'
  | 'onSourceTokenChange'
  | 'onQuote'
> & {
  /** `pay` vs `swap` — same SDK path; affects copy and `onStart` / internal `mode`. */
  variant: 'pay' | 'swap';
};

export function PaySwapIntentWidget({
  variant,
  isOpen,
  onClose,
  intent: intentProp,
  api,
  network = 'mainnet',
  allowNetworkToggle = false,
  classNames: cn,
  theme,
  onIntentSent,
  onIntentComplete,
  onError,
  onStart,
  onSign,
  onSuccess,
  onStatus,
  title: titleProp,
  submitButtonText: submitButtonTextProp,
  renderInline = false,
  toAddress,
  toAmount,
  toChainId,
  toToken,
  toTokenDecimals,
  toTokenSymbol,
  sourceChainIds,
  sourceTokenFilter,
  defaultSourceChainId,
  defaultSourceTokenAddress,
  lockSourceToken = false,
  ctaLabels,
  usdPriceFor,
  onSourceTokenChange,
  onQuote,
}: PaySwapIntentWidgetProps) {
  const flatPayBuild = useMemo(() => {
    if (intentProp) return null;
    if (!toAddress && !toAmount && !toChainId && !toToken) return null;
    return buildPayIntentFromFlatProps({
      toAddress,
      toAmount,
      toChainId,
      toToken,
      toTokenDecimals,
      toTokenSymbol,
    });
  }, [intentProp, toAddress, toAmount, toChainId, toToken, toTokenDecimals, toTokenSymbol]);

  const payIntent: IntentProps | null = intentProp ?? (flatPayBuild?.ok ? flatPayBuild.intent : null);

  const sessionId = useSessionId(isOpen);

  const [isTestnet, setIsTestnet] = useState(network === 'testnet');

  const { data: walletClient } = useWalletClient();
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const resolvedIntent = useMemo<IntentProps>(() => {
    return payIntent ?? PLACEHOLDER_INTENT;
  }, [payIntent]);

  const {
    requiredToken,
    requiredAmount,
    config: intentConfig,
    destinationChainName,
    positionLabel,
    receiver,
  } = resolvedIntent;

  const verb = variant === 'swap' ? 'Swap' : 'Pay';

  const modalTitle =
    titleProp ??
    (positionLabel ? `${verb} ${positionLabel}` : verb);

  const modalSubmitText = submitButtonTextProp ?? (positionLabel ? `${verb} ${positionLabel}` : verb);

  const resolvedAllowNetworkToggle = allowNetworkToggle;

  const { baseUrl: apiBaseUrl, rpcUrls } = api;

  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('');
  const [view, setView] = useState<WidgetView>('main');

  useEffect(() => {
    setIsTestnet(network === 'testnet');
  }, [network]);

  const sourceChainIdsKey = sourceChainIds ? sourceChainIds.join(',') : '';
  const availableChains = useMemo(() => {
    const all = getEpochChains(isTestnet);
    if (!sourceChainIds || sourceChainIds.length === 0) return all;
    const allow = new Set(sourceChainIds);
    return all.filter((c) => allow.has(c.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTestnet, sourceChainIdsKey]);

  const allTokens = useMemo((): TokenWithChain[] => {
    const flat = availableChains.flatMap((chain) =>
      getEpochTokensByChainEnv(chain.id, isTestnet).map((tok) => ({ ...tok, chain })),
    );
    return sourceTokenFilter ? flat.filter(sourceTokenFilter) : flat;
  }, [availableChains, isTestnet, sourceTokenFilter]);

  // Tokens available on the currently-selected chain, derived from the
  // already-filtered `allTokens` so `sourceTokenFilter` is applied uniformly.
  const availableTokens = useMemo(
    () => allTokens.filter((tok) => tok.chain.id === selectedChainId),
    [allTokens, selectedChainId],
  );

  const selectedToken = useMemo(
    () => availableTokens.find((tok) => tok.address === selectedTokenAddress) ?? null,
    [availableTokens, selectedTokenAddress],
  );

  const selectedChain = availableChains.find((c) => c.id === selectedChainId);

  const pillToken = selectedToken ?? allTokens[0] ?? null;
  const pillChain = selectedChain ?? availableChains[0] ?? null;

  // Initial selection: honor integrator-supplied defaults when present and
  // still part of the filtered token set; otherwise fall back to the first
  // available token. Runs only when nothing is selected yet so we don't fight
  // user changes mid-session.
  useEffect(() => {
    if (!isOpen) return;
    if (selectedChainId !== null) return;
    if (defaultSourceChainId && defaultSourceTokenAddress) {
      const wanted = allTokens.find(
        (t) =>
          t.chain.id === defaultSourceChainId &&
          t.address.toLowerCase() === defaultSourceTokenAddress.toLowerCase(),
      );
      if (wanted) {
        setSelectedChainId(wanted.chain.id);
        setSelectedTokenAddress(wanted.address);
        return;
      }
    }
    if (defaultSourceChainId) {
      const first = allTokens.find((t) => t.chain.id === defaultSourceChainId);
      if (first) {
        setSelectedChainId(first.chain.id);
        setSelectedTokenAddress(first.address);
        return;
      }
    }
    const first = allTokens[0];
    if (!first) return;
    setSelectedChainId(first.chain.id);
    setSelectedTokenAddress(first.address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, allTokens, defaultSourceChainId, defaultSourceTokenAddress]);

  useEffect(() => {
    if (availableTokens.length > 0) {
      setSelectedTokenAddress((prev) =>
        availableTokens.some((tok) => tok.address === prev) ? prev : availableTokens[0].address,
      );
    } else {
      setSelectedTokenAddress('');
    }
  }, [availableTokens]);

  const onSourceTokenChangeRef = useRef(onSourceTokenChange);
  onSourceTokenChangeRef.current = onSourceTokenChange;
  useEffect(() => {
    if (!onSourceTokenChangeRef.current) return;
    if (!selectedChainId || !selectedTokenAddress) return;
    onSourceTokenChangeRef.current({
      chainId: selectedChainId,
      tokenAddress: selectedTokenAddress as `0x${string}`,
    });
  }, [selectedChainId, selectedTokenAddress]);

  const { balance, isLoading: isBalanceLoading } = useTokenBalance(
    selectedChainId,
    selectedTokenAddress,
    address,
    rpcUrls,
  );

  const isWrongNetwork = selectedChainId !== null && chainId !== selectedChainId;
  const insufficientBalance = balance !== null && balance === 0n;

  const intentFlow = useIntentFlow({
    apiBaseUrl,
    walletClient,
    address,
    requiredToken,
    requiredAmount,
    intentConfig,
    isTestnet,
    sessionId,
    mode: variant,
    receiver,
    onIntentSent,
    onIntentComplete,
    onRequestClose: onClose,
    onStart,
    onSign,
    onSuccess,
    onErrorCtx: onError,
  });

  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;
  useEffect(() => {
    if (!onStatusRef.current) return;
    onStatusRef.current({
      sessionId,
      status: intentFlow.status as IntentFlowStatus,
      progress: intentFlow.statusProgress,
      activeStep: intentFlow.activeStep,
    });
  }, [sessionId, intentFlow.status, intentFlow.statusProgress, intentFlow.activeStep]);

  useEffect(() => {
    if (!isOpen) {
      intentFlow.reset();
      setSelectedChainId(null);
      setSelectedTokenAddress('');
      setIsTestnet(network === 'testnet');
      setView('main');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, network]);

  const fetchQuoteRef = useRef(intentFlow.fetchQuote);
  fetchQuoteRef.current = intentFlow.fetchQuote;

  useEffect(() => {
    if (
      intentConfig.fixedOutput &&
      selectedChainId &&
      selectedToken &&
      walletClient &&
      address &&
      !isWrongNetwork
    ) {
      fetchQuoteRef.current({ sourceChainId: selectedChainId, sourceToken: selectedToken });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChainId, selectedTokenAddress, intentConfig.fixedOutput, address, chainId, isWrongNetwork, !!walletClient]);

  // Emit quote results once per settle. Watches `isQuoting` falling edge so
  // we don't fire on every render while quote is in flight.
  const onQuoteRef = useRef(onQuote);
  onQuoteRef.current = onQuote;
  const prevQuotingRef = useRef(false);
  useEffect(() => {
    const wasQuoting = prevQuotingRef.current;
    prevQuotingRef.current = intentFlow.isQuoting;
    if (!onQuoteRef.current) return;
    if (!wasQuoting || intentFlow.isQuoting) return;
    if (!selectedChainId || !selectedToken) return;
    const raw = intentFlow.quotedPayRaw;
    let bigintRaw: bigint | null = null;
    if (raw) {
      try {
        bigintRaw = BigInt(raw);
      } catch {
        bigintRaw = null;
      }
    }
    onQuoteRef.current({
      sourceChainId: selectedChainId,
      sourceTokenAddress: selectedTokenAddress as `0x${string}`,
      paySymbol: selectedToken.symbol,
      payAmount: intentFlow.quotedPayAmount ?? null,
      payAmountRaw: bigintRaw,
      error: intentFlow.quoteError ?? undefined,
    });
  }, [intentFlow.isQuoting, intentFlow.quotedPayAmount, intentFlow.quotedPayRaw, intentFlow.quoteError, selectedChainId, selectedTokenAddress, selectedToken]);

  const hasResolvableIntent = !!payIntent;

  const showIntentSummary = !!payIntent;

  const isBusy = intentFlow.status === 'submitting' || intentFlow.status === 'polling';

  const canSubmit =
    hasResolvableIntent &&
    !!walletClient &&
    !!address &&
    !!selectedChainId &&
    !!selectedTokenAddress &&
    !!selectedToken &&
    !isWrongNetwork &&
    !insufficientBalance &&
    !isBusy &&
    !(intentConfig.fixedOutput && intentFlow.isQuoting);

  const requiredAmountStr = formatAmount(requiredAmount, requiredToken.decimals);

  const payAmountStr = (() => {
    if (!selectedToken) return '—';
    if (!intentConfig.fixedOutput) return requiredAmountStr;
    if (intentFlow.isQuoting) return '';
    if (intentFlow.quotedPayAmount) return intentFlow.quotedPayAmount;
    if (intentFlow.quoteError) return '—';
    return '—';
  })();

  const flatPayError = flatPayBuild && !flatPayBuild.ok ? flatPayBuild.error : null;

  const cta = {
    submit: ctaLabels?.submit ?? modalSubmitText,
    switchNetwork: ctaLabels?.switchNetwork ?? ((chain: string) => `Switch to ${chain}`),
    quoting: ctaLabels?.quoting ?? 'Fetching quote…',
    preparing: ctaLabels?.preparing ?? 'Preparing…',
    signing: ctaLabels?.signing ?? 'Signing…',
    submitting: ctaLabels?.submitting ?? 'Submitting…',
    polling: ctaLabels?.polling ?? 'Waiting for execution…',
    complete: ctaLabels?.complete ?? 'Completed ✓',
    insufficientBalance:
      ctaLabels?.insufficientBalance ?? ((sym: string) => `Insufficient ${sym} balance`),
    configureRequired:
      ctaLabels?.configureRequired ?? (variant === 'swap' ? 'Configure swap' : 'Configure payment'),
  };

  type CtaAction = 'switch' | 'submit' | 'disabled';
  type CtaTone = 'primary' | 'warning' | 'success';
  const ctaState: { action: CtaAction; label: string; tone?: CtaTone } = (() => {
    if (!payIntent) {
      return { action: 'disabled', label: flatPayError ?? cta.configureRequired };
    }
    if (intentConfig.fixedOutput && intentFlow.isQuoting)
      return { action: 'disabled', label: cta.quoting };
    if (intentFlow.status === 'submitting') {
      if (intentFlow.activeStep === 1) return { action: 'disabled', label: cta.preparing };
      if (intentFlow.activeStep === 2) return { action: 'disabled', label: cta.signing };
      if (intentFlow.activeStep === 3) return { action: 'disabled', label: cta.submitting };
    }
    if (intentFlow.status === 'polling') return { action: 'disabled', label: cta.polling };
    if (intentFlow.status === 'complete')
      return { action: 'disabled', label: cta.complete, tone: 'success' };
    if (isWrongNetwork && selectedChain) {
      return { action: 'switch', label: cta.switchNetwork(selectedChain.name), tone: 'warning' };
    }
    if (insufficientBalance && selectedToken) {
      return { action: 'disabled', label: cta.insufficientBalance(selectedToken.symbol) };
    }
    return { action: 'submit', label: cta.submit };
  })();
  const ctaEnabled = ctaState.action === 'submit' || ctaState.action === 'switch';
  const CTA_TONE_CLASSES: Record<CtaTone, string> = {
    primary: 'bg-primary hover:bg-primary-hover',
    warning: 'bg-warning hover:bg-warning',
    success: 'bg-success hover:bg-success',
  };
  const ctaToneClasses = CTA_TONE_CLASSES[ctaState.tone ?? 'primary'];

  const balanceStr = (() => {
    if (!selectedToken || balance === null) return undefined;
    return `Balance: ${formatAmount(balance, selectedToken.decimals)} ${selectedToken.symbol}`;
  })();

  // USD equivalent for the pay/sell amount — driven entirely by integrator
  // resolver. When not provided, hook returns null and we render no "≈ $…"
  // line. Cached per (chain, address) so token-flipping is instant.
  const { priceUsd } = useTokenUsdPrice({
    chainId: selectedChainId,
    tokenAddress: selectedTokenAddress,
    tokenSymbol: selectedToken?.symbol ?? '',
    resolver: usdPriceFor,
  });
  const usdEquivalentStr = useMemo(() => {
    if (priceUsd == null) return null;
    if (!payAmountStr || payAmountStr === '—' || payAmountStr === '') return null;
    const n = Number(payAmountStr.replace(/,/g, ''));
    if (!Number.isFinite(n) || n <= 0) return null;
    const usd = n * priceUsd;
    const formatted =
      usd >= 1000
        ? usd.toLocaleString(undefined, { maximumFractionDigits: 0 })
        : usd >= 1
        ? usd.toFixed(2)
        : usd.toFixed(4);
    return `≈ $${formatted}`;
  }, [priceUsd, payAmountStr]);

  const destinationChainId =
    (isTestnet ? intentConfig.destinationTestnetChainId : intentConfig.destinationChainId) ??
    (isTestnet ? 84532 : 8453);

  const destinationChain = useMemo(() => getEpochChainById(destinationChainId), [destinationChainId]);

  const destinationToken = useMemo(() => {
    const tokens = getEpochTokensByChainEnv(destinationChainId, isTestnet);
    return tokens.find((tok) => tok.address.toLowerCase() === requiredToken.address.toLowerCase());
  }, [destinationChainId, isTestnet, requiredToken.address]);

  const destinationPill = (
    <TokenChainPill
      tokenSymbol={requiredToken.symbol}
      tokenLogoURI={destinationToken?.logoURI}
      chainName={destinationChainName ?? destinationChain?.name ?? ''}
      chainLogoURI={destinationChain?.logoURI}
    />
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

  const floatingPill =
    showIntentSummary && isConnected && pillToken && pillChain ? (
      <TokenChainPill
        tokenSymbol={pillToken.symbol}
        tokenLogoURI={pillToken.logoURI}
        chainName={pillChain.name}
        chainLogoURI={pillChain.logoURI}
        onClick={lockSourceToken ? undefined : () => setView('selectToken')}
        ariaLabel={lockSourceToken ? undefined : 'Change source token'}
      />
    ) : undefined;

  const inlineError = intentFlow.quoteError
    ? `Quote failed: ${intentFlow.quoteError}`
    : intentFlow.status === 'error' && intentFlow.error
    ? intentFlow.error
    : null;

  const handleCtaClick = () => {
    if (ctaState.action === 'switch' && selectedChain) {
      switchChain?.({ chainId: selectedChain.id });
      return;
    }
    if (ctaState.action !== 'submit') return;
    if (!selectedChainId || !selectedToken) return;
    intentFlow.submit({ sourceChainId: selectedChainId, sourceToken: selectedToken });
  };

  const ctaDisabled = !ctaEnabled || (ctaState.action === 'submit' && !canSubmit);

  const footer = (
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
          'flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border-0 px-4 py-3.5 text-[15px] font-[650] -tracking-[0.005em] text-white shadow-md transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.99]',
          ctaToneClasses,
          ctaDisabled && 'cursor-not-allowed opacity-45 active:scale-100',
          cn?.button,
        )}
        disabled={ctaDisabled}
        onClick={handleCtaClick}
      >
        {(isBusy || (intentConfig.fixedOutput && intentFlow.isQuoting)) && (
          <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin-epoch rounded-full border-2 border-white border-t-transparent" />
        )}
        {ctaState.label}
      </button>
    </div>
  );

  const headerAction = resolvedAllowNetworkToggle ? (
    <NetworkToggle
      isTestnet={isTestnet}
      onChange={(checked) => {
        setIsTestnet(checked);
        setSelectedChainId(null);
        setSelectedTokenAddress('');
      }}
    />
  ) : undefined;

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
      {!payIntent && flatPayError && (
        <Banner variant="warning" className={cn?.banner}>
          {flatPayError}
        </Banner>
      )}

      {showIntentSummary && variant === 'swap' && (
        <SwapIntentSummary
          sellAmount={payAmountStr}
          sellSymbol={selectedToken?.symbol ?? ''}
          sellTokenPill={floatingPill}
          buyAmount={requiredAmountStr}
          buyTokenPill={destinationPill}
          destinationChainName={destinationChainName ?? destinationChain?.name}
          isQuoting={intentFlow.isQuoting}
          balanceStr={isConnected ? balanceStr : undefined}
          balanceError={insufficientBalance}
          isBalanceLoading={isConnected && !!selectedToken && isBalanceLoading}
          walletConnected={isConnected}
          walletAddress={isConnected ? address : undefined}
          walletIcon={isConnected ? connector?.icon : undefined}
          usdEquivalent={usdEquivalentStr}
          classNames={cn}
        />
      )}
      {showIntentSummary && variant === 'pay' && (
        <PayIntentSummary
          receiveAmount={requiredAmountStr}
          receiveSymbol={requiredToken.symbol}
          positionLabel={positionLabel}
          destinationChainName={destinationChainName}
          recipientAddress={receiver ?? toAddress}
          payAmount={payAmountStr}
          paySymbol={selectedToken?.symbol ?? ''}
          tokenSelectorTrigger={floatingPill}
          walletAddress={isConnected ? address : undefined}
          walletIcon={isConnected ? connector?.icon : undefined}
          walletConnected={isConnected}
          isQuoting={intentFlow.isQuoting}
          balanceStr={isConnected ? balanceStr : undefined}
          balanceError={insufficientBalance}
          isBalanceLoading={isConnected && !!selectedToken && isBalanceLoading}
          usdEquivalent={usdEquivalentStr}
          classNames={cn}
        />
      )}

      {(intentFlow.status === 'submitting' ||
        intentFlow.status === 'polling' ||
        intentFlow.status === 'complete') && (
        <ProgressStepper
          activeStep={intentFlow.status === 'complete' ? 5 : intentFlow.activeStep}
          statusProgress={intentFlow.statusProgress}
          className={cn?.progress}
        />
      )}

      {intentFlow.status === 'complete' && (
        <div className="animate-overlay-in">
          <Banner variant="success" className={cn?.banner}>
            <div className="flex items-center gap-2">
              <CheckIcon />
              <span>
                {variant === 'swap' ? 'Swap completed successfully.' : 'Intent executed successfully.'}
              </span>
            </div>
          </Banner>
        </div>
      )}

    </Modal>
  );
}
