import type { ReactNode } from 'react';
import type { PaySwapEngine } from '../../pay/use-pay-swap-engine';
import type { EpochClassNames } from '../../types';
import { Banner } from '../Banner';
import { GaslessSection } from '../GaslessSection';
import { IntentProgress } from '../IntentProgress';

/** Statuses Pay/Swap shows the step tracker for. Earn tracks a different set. */
const PROGRESS_STATUSES = ['submitting', 'polling', 'complete'];

interface PaySwapMainViewProps {
  engine: PaySwapEngine;
  payAmount: string;
  receiveAmount: string;
  payTokenPill: ReactNode;
  receiveTokenPill: ReactNode;
  balanceStr?: string;
  usdEquivalent: string | null;
  classNames?: EpochClassNames;
}

export function PaySwapMainView({
  engine,
  payAmount,
  receiveAmount,
  payTokenPill,
  receiveTokenPill,
  balanceStr,
  usdEquivalent,
  classNames: cn,
}: PaySwapMainViewProps) {
  const {
    spec,
    source,
    destination,
    intentFlow,
    resolvedIntent,
    hasIntent,
    flatPayError,
    isConnected,
    address,
    walletIcon,
    insufficientBalance,
    isBalanceLoading,
  } = engine;

  return (
    <>
      {!hasIntent && flatPayError && (
        <Banner variant="warning" className={cn?.banner}>
          {flatPayError}
        </Banner>
      )}

      <GaslessSection
        allowed={engine.effectiveAllowGasless}
        wallet={engine.gaslessWallet}
        gasless={engine.gasless}
        onChange={engine.setGasless}
      />

      {hasIntent &&
        spec.renderSummary({
          payAmount,
          paySymbol: source.token?.symbol ?? '',
          payTokenPill,
          receiveAmount,
          receiveSymbol: resolvedIntent.requiredToken.symbol,
          receiveTokenPill,
          destinationChainName: spec.fallsBackToResolvedChainName
            ? (resolvedIntent.destinationChainName ?? destination.chain?.name)
            : resolvedIntent.destinationChainName,
          positionLabel: resolvedIntent.positionLabel,
          recipientAddress: engine.recipientAddress,
          walletAddress: isConnected ? address : undefined,
          walletIcon: isConnected ? walletIcon : undefined,
          walletConnected: isConnected,
          isQuoting: intentFlow.isQuoting,
          balanceStr: isConnected ? balanceStr : undefined,
          balanceError: insufficientBalance,
          isBalanceLoading: isConnected && !!source.token && isBalanceLoading,
          usdEquivalent,
          classNames: cn,
        })}

      <IntentProgress
        status={intentFlow.status}
        showFor={PROGRESS_STATUSES}
        activeStep={intentFlow.activeStep}
        statusProgress={intentFlow.statusProgress}
        successMessage={spec.successMessage}
        classNames={cn}
      />
    </>
  );
}
