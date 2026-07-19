import { useAccount } from 'wagmi';
import { useOnOpen } from './hooks/use-on-open';
import { Modal } from './components/Modal';
import { WalletConnectorPanel } from './components/wallet/WalletConnectorPanel';
import { EarnIntentWidget } from './components/EarnIntentWidget';
import { PayIntentWidget } from './components/PayIntentWidget';
import { SwapIntentWidget } from './components/SwapIntentWidget';
import type { EpochIntentWidgetProps, WidgetFlow } from './types';

export function EpochIntentWidget(props: EpochIntentWidgetProps) {
  const {
    isOpen,
    onClose,
    mode: modeProp,
    flow: flowProp,
    theme,
    classNames: cn,
    renderInline = false,
    onOpen,
    api,
    network = 'mainnet',
    allowNetworkToggle = false,
    allowGasless = true,
    gasless = false,
    onIntentSent,
    onIntentComplete,
    onError,
    onStart,
    onSign,
    onSuccess,
    onStatus,
    title,
    submitButtonText,
    intent,
    toAddress,
    toAmount,
    toChainId,
    toToken,
    toTokenDecimals,
    toTokenSymbol,
    earnMarkets,
    earnMarketsSource,
    earnSolverUrl,
    earnDefaultTab,
    earnHideTabs,
    earnDepositDefaults,
    earnWithdrawDefaults,
    earnMiden,
    miden,
    earnChainIds,
    earnLenderFilter,
    earnPoolsPerChain,
    earnPoolsSortBy,
    earnPoolsSortDir,
    sourceChainIds,
    sourceTokenFilter,
    defaultSourceChainId,
    defaultSourceTokenAddress,
    lockDestinationToken,
    ctaLabels,
    usdPriceFor,
    onSourceTokenChange,
    onQuote,
    routingAndLiquidityOptions,
  } = props;

  const rawMode = modeProp ?? flowProp ?? 'pay';
  const flowMode: WidgetFlow =
    rawMode === 'pay' || rawMode === 'swap' || rawMode === 'earn' ? rawMode : 'pay';
  const { isConnected } = useAccount();

  useOnOpen(isOpen, onOpen);

  if (!isOpen) {
    return null;
  }

  // One adapter for every flow. `earnMiden` stays a back-compat alias for the
  // neutral `miden` prop; a caller wiring both flows passes it once.
  const midenAdapter = miden ?? earnMiden;

  const paySwapShared = {
    isOpen,
    onClose,
    api,
    network,
    allowNetworkToggle,
    allowGasless,
    gasless,
    classNames: cn,
    theme,
    onIntentSent,
    onIntentComplete,
    onError,
    onStart,
    onSign,
    onSuccess,
    onStatus,
    title,
    submitButtonText,
    renderInline,
    intent,
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
    lockDestinationToken,
    ctaLabels,
    usdPriceFor,
    onSourceTokenChange,
    onQuote,
    routingAndLiquidityOptions,
    miden: midenAdapter,
  };

  if (!isConnected) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Connect wallet"
        theme={theme}
        classNames={cn}
        renderInline={renderInline}
      >
        <WalletConnectorPanel theme={theme} classNames={cn} />
      </Modal>
    );
  }

  if (flowMode === 'earn') {
    return (
      <EarnIntentWidget
        isOpen={isOpen}
        onClose={onClose}
        api={api}
        network={network}
        allowNetworkToggle={allowNetworkToggle ?? true}
        allowGasless={allowGasless}
        gasless={gasless}
        classNames={cn}
        theme={theme}
        renderInline={renderInline}
        title={title}
        submitButtonText={submitButtonText}
        earnMarkets={earnMarkets}
        earnMarketsSource={earnMarketsSource}
        earnSolverUrl={earnSolverUrl}
        earnDefaultTab={earnDefaultTab}
        earnHideTabs={earnHideTabs}
        earnDepositDefaults={earnDepositDefaults}
        earnWithdrawDefaults={earnWithdrawDefaults}
        earnMiden={midenAdapter}
        earnChainIds={earnChainIds}
        earnLenderFilter={earnLenderFilter}
        earnPoolsPerChain={earnPoolsPerChain}
        earnPoolsSortBy={earnPoolsSortBy}
        earnPoolsSortDir={earnPoolsSortDir}
        onIntentSent={onIntentSent}
        onIntentComplete={onIntentComplete}
        onError={onError}
        onOpen={onOpen}
        onStart={onStart}
        onSign={onSign}
        onSuccess={onSuccess}
        onStatus={onStatus}
        routingAndLiquidityOptions={routingAndLiquidityOptions}
      />
    );
  }

  if (flowMode === 'swap') {
    return <SwapIntentWidget {...paySwapShared} />;
  }

  return <PayIntentWidget {...paySwapShared} />;
}
