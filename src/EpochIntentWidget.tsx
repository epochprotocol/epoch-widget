import { useEffect, useMemo, useState } from 'react';
import { useWalletClient, useAccount, useChainId, useSwitchChain } from 'wagmi';
import { getEpochChainById, getEpochChains, getEpochTokensByChainEnv } from './epoch-config';
import { useTokenBalance } from './use-token-balance';
import { useIntentFlow } from './use-intent-flow';
import { s } from './styles';
import { t } from './theme';
import { formatAmount, injectKeyframes } from './utils';
import { injectShimmerKeyframes } from './components/Shimmer';
import { Modal } from './components/Modal';
import { ProgressStepper } from './components/ProgressStepper';
import { NetworkToggle } from './components/NetworkToggle';
import { TokenSelector, type TokenWithChain } from './components/TokenSelector';
import { IntentSummary } from './components/IntentSummary';
import { Banner } from './components/Banner';
import { TokenChainPill } from './components/TokenChainPill';
import { WalletIcon, CheckIcon } from './components/Icons';
import type { EpochIntentWidgetProps } from './types';

type WidgetView = 'main' | 'selectToken';

export function EpochIntentWidget(props: EpochIntentWidgetProps) {
  const {
    isOpen,
    onClose,
    intent,
    api,
    network = 'mainnet',
    allowNetworkToggle = false,
    classNames: cn,
    theme,
    onIntentSent,
    onIntentComplete,
    onError,
    title = 'Pay',
    submitButtonText = 'Pay',
  } = props;

  const { requiredToken, requiredAmount, config: intentConfig, destinationChainName } = intent;
  const { baseUrl: apiBaseUrl, rpcUrls } = api;

  // ---- Local state ----------------------------------------------------------

  const [isTestnet, setIsTestnet] = useState(network === 'testnet');
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('');
  const [view, setView] = useState<WidgetView>('main');

  useEffect(() => {
    setIsTestnet(network === 'testnet');
  }, [network]);

  // ---- Wagmi ---------------------------------------------------------------

  const { data: walletClient } = useWalletClient();
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // ---- Keyframes (once) ----------------------------------------------------

  useEffect(() => {
    injectKeyframes();
    injectShimmerKeyframes();
  }, []);

  // ---- Derived data --------------------------------------------------------

  const availableChains = useMemo(() => getEpochChains(isTestnet), [isTestnet]);

  // All tokens across all chains (flat list with chain info attached)
  const allTokens = useMemo((): TokenWithChain[] =>
    availableChains.flatMap((chain) =>
      getEpochTokensByChainEnv(chain.id, isTestnet).map((tok) => ({ ...tok, chain })),
    ),
    [availableChains, isTestnet],
  );

  // Tokens for the currently selected chain
  const availableTokens = useMemo(
    () => (selectedChainId ? getEpochTokensByChainEnv(selectedChainId, isTestnet) : []),
    [selectedChainId, isTestnet],
  );

  const selectedToken = useMemo(
    () => availableTokens.find((tok) => tok.address === selectedTokenAddress) ?? null,
    [availableTokens, selectedTokenAddress],
  );

  const selectedChain = availableChains.find((c) => c.id === selectedChainId);

  // Pill display: use selection or fall back to the first available token/chain
  const pillToken = selectedToken ?? allTokens[0] ?? null;
  const pillChain = selectedChain ?? availableChains[0] ?? null;

  // Auto-select first token when chain changes
  useEffect(() => {
    if (availableTokens.length > 0) {
      setSelectedTokenAddress((prev) =>
        availableTokens.some((tok) => tok.address === prev) ? prev : availableTokens[0].address,
      );
    } else {
      setSelectedTokenAddress('');
    }
  }, [availableTokens]);

  // ---- Balance -------------------------------------------------------------

  const { balance, isLoading: isBalanceLoading } = useTokenBalance(
    selectedChainId,
    selectedTokenAddress,
    address,
    rpcUrls,
  );

  const isWrongNetwork = selectedChainId !== null && chainId !== selectedChainId;
  const insufficientBalance = balance !== null && balance === 0n;

  // ---- Intent flow ---------------------------------------------------------

  const flow = useIntentFlow({
    apiBaseUrl,
    walletClient,
    address,
    requiredToken,
    requiredAmount,
    intentConfig,
    isTestnet,
    onIntentSent,
    onIntentComplete,
    onError,
    onRequestClose: onClose,
  });

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      flow.reset();
      setSelectedChainId(null);
      setSelectedTokenAddress('');
      setIsTestnet(network === 'testnet');
      setView('main');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, network]);

  // Auto-fetch quote for fixed-output intents
  useEffect(() => {
    if (
      intentConfig.fixedOutput &&
      selectedChainId &&
      selectedToken &&
      walletClient &&
      address &&
      !isWrongNetwork
    ) {
      flow.fetchQuote({ sourceChainId: selectedChainId, sourceToken: selectedToken });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChainId, selectedTokenAddress, intentConfig.fixedOutput, address]);

  // ---- Derived UI ----------------------------------------------------------

  const isBusy = flow.status === 'submitting' || flow.status === 'polling';

  const canSubmit =
    !!walletClient &&
    !!address &&
    !!selectedChainId &&
    !!selectedTokenAddress &&
    !!selectedToken &&
    !isWrongNetwork &&
    !insufficientBalance &&
    !isBusy;

  const requiredAmountStr = formatAmount(requiredAmount, requiredToken.decimals);

  const payAmountStr = (() => {
    if (!selectedToken) return '—';
    if (!intentConfig.fixedOutput) return requiredAmountStr;
    if (flow.isQuoting) return '';
    if (flow.quotedPayAmount) return flow.quotedPayAmount;
    if (flow.quoteError) return '—';
    return '—';
  })();

  const buttonLabel = (() => {
    if (flow.status === 'submitting') {
      if (flow.activeStep === 1) return 'Preparing…';
      if (flow.activeStep === 2) return 'Signing…';
      if (flow.activeStep === 3) return 'Submitting…';
    }
    if (flow.status === 'polling') return 'Waiting for execution…';
    if (flow.status === 'complete') return 'Completed ✓';
    return submitButtonText;
  })();

  const balanceStr = (() => {
    if (!selectedToken) return null;
    if (isBalanceLoading) return 'Loading balance…';
    if (balance !== null) return `Balance: ${formatAmount(balance, selectedToken.decimals)} ${selectedToken.symbol}`;
    return null;
  })();

  // ---- Destination (read-only) pill ---------------------------------------

  const destinationChainId =
    (isTestnet ? intentConfig.destinationTestnetChainId : intentConfig.destinationChainId) ??
    (isTestnet ? 84532 : 8453);

  const destinationChain = useMemo(
    () => getEpochChainById(destinationChainId),
    [destinationChainId],
  );

  const destinationToken = useMemo(() => {
    const tokens = getEpochTokensByChainEnv(destinationChainId, isTestnet);
    return tokens.find(
      (tok) => tok.address.toLowerCase() === requiredToken.address.toLowerCase(),
    );
  }, [destinationChainId, isTestnet, requiredToken.address]);

  const destinationPill = (
    <TokenChainPill
      tokenSymbol={requiredToken.symbol}
      tokenLogoURI={destinationToken?.logoURI}
      chainName={destinationChainName ?? destinationChain?.name ?? ''}
      chainLogoURI={destinationChain?.logoURI}
    />
  );

  // ---- Token selector view -------------------------------------------------

  if (view === 'selectToken') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={title} theme={theme} classNames={cn}>
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

  // ---- Main view -----------------------------------------------------------

  // Source token pill (interactive): always shows something until the user picks
  const floatingPill = isConnected && pillToken && pillChain ? (
    <TokenChainPill
      tokenSymbol={pillToken.symbol}
      tokenLogoURI={pillToken.logoURI}
      chainName={pillChain.name}
      chainLogoURI={pillChain.logoURI}
      onClick={() => setView('selectToken')}
      ariaLabel="Change source token"
    />
  ) : undefined;

  const footer = (
    <button
      type="button"
      className={cn?.button}
      style={cn?.button ? undefined : { ...s.button, ...(canSubmit ? {} : s.buttonDisabled) }}
      disabled={!canSubmit}
      onClick={() => {
        if (!selectedChainId || !selectedToken) return;
        flow.submit({ sourceChainId: selectedChainId, sourceToken: selectedToken });
      }}
      onMouseEnter={(e) => {
        if (canSubmit && !cn?.button) e.currentTarget.style.backgroundColor = t.primaryHover;
      }}
      onMouseLeave={(e) => {
        if (canSubmit && !cn?.button) e.currentTarget.style.backgroundColor = t.primary;
      }}
    >
      {isBusy && <span style={{ ...s.spinner, color: '#ffffff' }} />}
      {buttonLabel}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} theme={theme} classNames={cn} footer={footer}>

      {/* Network toggle */}
      {allowNetworkToggle && (
        <NetworkToggle
          isTestnet={isTestnet}
          onChange={(checked) => {
            setIsTestnet(checked);
            setSelectedChainId(null);
            setSelectedTokenAddress('');
          }}
        />
      )}

      {/* Wallet not connected */}
      {!isConnected && (
        <Banner variant="info" className={cn?.banner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WalletIcon />
            <span>Connect your wallet to continue.</span>
          </div>
        </Banner>
      )}

      {/* Two-card layout: pay on top with floating pill, receive below */}
      <IntentSummary
        pay={{
          label: 'You pay',
          amount: payAmountStr,
          symbol: selectedToken?.symbol ?? '',
        }}
        receive={{
          label: 'You receive',
          amount: requiredAmountStr,
          symbol: requiredToken.symbol,
          subtitle: destinationChainName,
        }}
        isQuoting={flow.isQuoting}
        tokenSelectorTrigger={floatingPill}
        destinationPill={destinationPill}
        balanceStr={isConnected ? (balanceStr ?? undefined) : undefined}
        balanceError={insufficientBalance}
        walletAddress={isConnected ? address : undefined}
        walletIcon={isConnected ? connector?.icon : undefined}
        classNames={cn}
      />

      {/* Wrong network */}
      {isConnected && isWrongNetwork && selectedChain && (
        <Banner
          variant="error"
          className={cn?.banner}
          action={
            <button
              type="button"
              style={s.networkSwitchBtn}
              onClick={() => switchChain?.({ chainId: selectedChain.id })}
            >
              Switch
            </button>
          }
        >
          Switch your wallet to <strong>{selectedChain.name}</strong> to continue.
        </Banner>
      )}

      {/* Insufficient balance */}
      {isConnected && insufficientBalance && selectedToken && (
        <Banner variant="warning" className={cn?.banner}>
          No {selectedToken.symbol} balance on {selectedChain?.name ?? 'this chain'}.
        </Banner>
      )}

      {/* Quote error */}
      {isConnected && flow.quoteError && (
        <Banner variant="warning" className={cn?.banner}>
          Quote failed: {flow.quoteError}
        </Banner>
      )}

      {/* Progress stepper */}
      {(flow.status === 'submitting' || flow.status === 'polling' || flow.status === 'complete') && (
        <ProgressStepper
          activeStep={flow.status === 'complete' ? 5 : flow.activeStep}
          statusProgress={flow.statusProgress}
          className={cn?.progress}
        />
      )}

      {/* Success */}
      {flow.status === 'complete' && (
        <Banner variant="success" className={cn?.banner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckIcon />
            <span>Intent executed successfully.</span>
          </div>
        </Banner>
      )}

      {/* Error */}
      {flow.status === 'error' && flow.error && (
        <Banner variant="error" className={cn?.banner}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>Something went wrong</div>
            <div style={{ opacity: 0.85 }}>{flow.error}</div>
          </div>
        </Banner>
      )}
    </Modal>
  );
}
