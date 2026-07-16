import { useMemo, useState } from 'react';
import { useAccount, useChainId, useSwitchChain, useWalletClient } from 'wagmi';
import { useEffectiveGasless } from '../hooks/use-effective-gasless';
import { useGaslessWallet } from '../hooks/use-gasless-wallet-check';
import { usePropOverride } from '../hooks/use-prop-override';
import type { UseGaslessWalletResult } from '../hooks/use-gasless-wallet-check';
import { resolveApiForNetwork } from '../resolve-api-config';
import { useSessionId } from '../session';
import { useIntentFlow } from '../use-intent-flow';
import { useTokenBalance } from '../use-token-balance';
import type { IntentProps } from '../types';
import { buildPayIntentFromFlatProps } from './build-pay-intent';
import type { PaySwapIntentWidgetProps } from './pay-swap-props';
import { PAY_SWAP_VARIANTS } from './pay-swap-variants';
import type { PaySwapVariantSpec } from './pay-swap-variants';
import { useDestinationSelection } from './use-destination-selection';
import type { DestinationSelection } from './use-destination-selection';
import { usePaySwapCallbacks } from './use-pay-swap-callbacks';
import { useQuoteAutoFetch } from './use-quote-auto-fetch';
import { useSourceSelection } from './use-source-selection';
import type { SourceSelection } from './use-source-selection';

/** Stands in until the integrator supplies a resolvable intent. */
const PLACEHOLDER_INTENT: IntentProps = {
  requiredToken: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: '',
    decimals: 18,
  },
  requiredAmount: 0n,
  config: { protocol: 'transfer', action: 'pay', fixedOutput: false },
};

export interface PaySwapEngine {
  spec: PaySwapVariantSpec;
  source: SourceSelection;
  destination: DestinationSelection;
  intentFlow: ReturnType<typeof useIntentFlow>;
  gaslessWallet: UseGaslessWalletResult;

  /** The integrator's intent resolved — false means nothing to submit. */
  hasIntent: boolean;
  /** Why the flat-prop intent failed to build, if it did. */
  flatPayError: string | null;
  resolvedIntent: IntentProps;
  /** Where funds land — the intent's receiver, else the flat `toAddress`. */
  recipientAddress: string | undefined;
  /** Swap forces this false; Pay honours the prop. */
  lockDestinationToken: boolean;

  isTestnet: boolean;
  applyNetwork: (nextIsTestnet: boolean) => void;
  allowNetworkToggle: boolean;

  gasless: boolean;
  setGasless: (next: boolean) => void;
  effectiveAllowGasless: boolean;

  address: string | undefined;
  isConnected: boolean;
  walletIcon: string | undefined;
  switchChain: ReturnType<typeof useSwitchChain>['switchChain'];

  balance: bigint | null;
  isBalanceLoading: boolean;
  isWrongNetwork: boolean;
  insufficientBalance: boolean;
  isBusy: boolean;
  canSubmit: boolean;

  modalTitle: string;
  modalSubmitText: string;
  usdPriceResolver: PaySwapIntentWidgetProps['usdPriceFor'];
}

/**
 * Everything the Pay/Swap widget knows, minus how it looks.
 *
 * Takes the widget's props whole so the component isn't a forty-line
 * destructure before it can render anything.
 */
export function usePaySwapEngine(props: PaySwapIntentWidgetProps): PaySwapEngine {
  const {
    variant,
    isOpen,
    onClose,
    intent: intentProp,
    api,
    network = 'mainnet',
    allowNetworkToggle = false,
    allowGasless = true,
    gasless: gaslessProp = false,
    title: titleProp,
    submitButtonText: submitButtonTextProp,
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
    lockDestinationToken: lockDestinationTokenProp = true,
    usdPriceFor,
    onIntentSent,
    onIntentComplete,
    onError,
    onStart,
    onSign,
    onSuccess,
    onStatus,
    onSourceTokenChange,
    onQuote,
    routingAndLiquidityOptions,
  } = props;

  const spec = PAY_SWAP_VARIANTS[variant];
  const lockDestinationToken = spec.ignoresDestinationLock
    ? false
    : lockDestinationTokenProp;

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
  }, [
    intentProp,
    toAddress,
    toAmount,
    toChainId,
    toToken,
    toTokenDecimals,
    toTokenSymbol,
  ]);

  const payIntent: IntentProps | null =
    intentProp ?? (flatPayBuild?.ok ? flatPayBuild.intent : null);
  const resolvedIntent = payIntent ?? PLACEHOLDER_INTENT;
  const { requiredToken, requiredAmount, config: intentConfig, receiver } =
    resolvedIntent;

  const sessionId = useSessionId(isOpen);
  const [gasless, setGasless] = useState(gaslessProp);

  const [isTestnet, applyNetwork] = usePropOverride(
    network,
    (n) => n === 'testnet',
  );

  const { data: walletClient } = useWalletClient();
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const effectiveAllowGasless = useEffectiveGasless(allowGasless, walletClient);

  const networkEnv: 'mainnet' | 'testnet' = isTestnet ? 'testnet' : 'mainnet';
  const resolvedApi = useMemo(
    () => resolveApiForNetwork(api, networkEnv),
    [api, networkEnv],
  );
  const { baseUrl: apiBaseUrl, rpcUrls } = resolvedApi;

  const source = useSourceSelection({
    isTestnet,
    sourceChainIds,
    sourceTokenFilter,
    defaultSourceChainId,
    defaultSourceTokenAddress,
  });

  const destination = useDestinationSelection({
    intentConfig,
    requiredToken,
    isTestnet,
    locked: lockDestinationToken,
  });

  const gaslessWallet = useGaslessWallet({
    allowGasless: effectiveAllowGasless,
    apiBaseUrl,
    gasless,
    setGasless,
    walletClient,
    address,
    chainIdForCheck:
      source.chainId ??
      (isTestnet
        ? (source.availableChains[0]?.id ?? 84532)
        : (walletClient?.chain?.id ?? null)),
    switchChain,
  });

  const { balance, isLoading: isBalanceLoading } = useTokenBalance(
    source.chainId,
    source.tokenAddress,
    address,
    rpcUrls,
  );

  const isWrongNetwork = source.chainId !== null && chainId !== source.chainId;
  const insufficientBalance = balance !== null && balance === 0n;

  const intentFlow = useIntentFlow({
    apiBaseUrl,
    walletClient,
    address,
    requiredToken: destination.requiredToken,
    requiredAmount,
    intentConfig: destination.intentConfig,
    isTestnet,
    sessionId,
    mode: variant,
    receiver,
    routingAndLiquidityOptions,
    gasless: effectiveAllowGasless && gasless,
    onIntentSent,
    onIntentComplete,
    onRequestClose: onClose,
    onStart,
    onSign,
    onSuccess,
    onErrorCtx: onError,
  });

  usePaySwapCallbacks({
    sessionId,
    sourceChainId: source.chainId,
    sourceTokenAddress: source.tokenAddress,
    sourceToken: source.token,
    flow: intentFlow,
    onSourceTokenChange,
    onStatus,
    onQuote,
  });

  useQuoteAutoFetch({
    enabled: !!intentConfig.fixedOutput,
    sourceChainId: source.chainId,
    sourceToken: source.token,
    destChainId: destination.chainId,
    destTokenAddress: destination.tokenAddress,
    address,
    hasWalletClient: !!walletClient,
    isWrongNetwork,
    fetchQuote: intentFlow.fetchQuote,
  });

  const hasIntent = !!payIntent;
  const isBusy =
    intentFlow.status === 'submitting' || intentFlow.status === 'polling';

  const { verb } = spec;
  const { positionLabel } = resolvedIntent;

  return {
    spec,
    source,
    destination,
    intentFlow,
    gaslessWallet,

    hasIntent,
    flatPayError: flatPayBuild && !flatPayBuild.ok ? flatPayBuild.error : null,
    resolvedIntent,
    recipientAddress: receiver ?? toAddress,
    lockDestinationToken,

    isTestnet,
    applyNetwork,
    allowNetworkToggle,

    gasless,
    setGasless,
    effectiveAllowGasless,

    address,
    isConnected,
    walletIcon: connector?.icon,
    switchChain,

    balance,
    isBalanceLoading,
    isWrongNetwork,
    insufficientBalance,
    isBusy,
    canSubmit:
      hasIntent &&
      !!walletClient &&
      !!address &&
      !!source.chainId &&
      !!source.token &&
      !isWrongNetwork &&
      !insufficientBalance &&
      !isBusy &&
      !(intentConfig.fixedOutput && intentFlow.isQuoting),

    modalTitle: titleProp ?? (positionLabel ? `${verb} ${positionLabel}` : verb),
    modalSubmitText:
      submitButtonTextProp ?? (positionLabel ? `${verb} ${positionLabel}` : verb),
    usdPriceResolver: usdPriceFor,
  };
}
