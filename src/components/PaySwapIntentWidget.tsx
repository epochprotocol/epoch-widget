import { useState } from "react";
import { useTokenUsdPrice } from "../hooks/use-token-usd-price";
import { formatAmount } from "../utils";
import { formatUsdEquivalent } from "../lib/format-usd";
import {
  isPaySwapCtaEnabled,
  resolvePaySwapCta,
  resolvePaySwapCtaLabels,
  type PaySwapCtaTone,
} from "../pay/pay-swap-cta";
import { usePaySwapEngine } from "../pay/use-pay-swap-engine";
import { Modal } from "./Modal";
import { NetworkToggle } from "./NetworkToggle";
import { TokenChainPill } from "./TokenChainPill";
import { ActionButton } from "./ui/ActionButton";
import { PaySwapMainView } from "./pay/PaySwapMainView";
import { TokenSelector } from "./TokenSelector";

export type { PaySwapIntentWidgetProps } from "../pay/pay-swap-props";
import type { PaySwapIntentWidgetProps } from "../pay/pay-swap-props";

type WidgetView = "main" | "selectToken" | "selectDestToken";

const CTA_TONE_CLASSES: Record<PaySwapCtaTone, string> = {
  primary: "bg-primary hover:bg-primary-hover",
  warning: "bg-warning hover:bg-warning",
  success: "bg-success hover:bg-success",
};

/**
 * Shared engine for the Pay and Swap flows. `usePaySwapEngine` owns the state
 * and the SDK wiring; this file decides what the user sees.
 */
export function PaySwapIntentWidget(props: PaySwapIntentWidgetProps) {
  const { classNames: cn, theme, renderInline, isOpen, onClose, ctaLabels } = props;
  const [view, setView] = useState<WidgetView>("main");
  const engine = usePaySwapEngine(props);
  const { spec, source, destination, intentFlow, resolvedIntent } = engine;

  const receiveAmountStr = formatAmount(
    resolvedIntent.requiredAmount,
    resolvedIntent.requiredToken.decimals,
  );

  // Fixed-output is the only mode that must wait on a quote to know what the
  // user pays; otherwise the required amount is the pay amount.
  const payAmountStr = (() => {
    if (!source.token) return "—";
    if (!resolvedIntent.config.fixedOutput) return receiveAmountStr;
    if (intentFlow.isQuoting) return "";
    return intentFlow.quotedPayAmount ?? "—";
  })();

  const ctaState = resolvePaySwapCta({
    labels: resolvePaySwapCtaLabels(ctaLabels, {
      submit: engine.modalSubmitText,
      configureRequired: spec.configureLabel,
    }),
    hasIntent: engine.hasIntent,
    buildError: engine.flatPayError,
    fixedOutput: !!resolvedIntent.config.fixedOutput,
    flow: intentFlow,
    isWrongNetwork: engine.isWrongNetwork,
    selectedChain: source.chain,
    insufficientBalance: engine.insufficientBalance,
    selectedToken: source.token,
  });

  const handleCtaClick = () => {
    if (ctaState.action === "switch" && source.chain) {
      engine.switchChain?.({ chainId: source.chain.id });
      return;
    }
    if (ctaState.action !== "submit") return;
    if (!source.chainId || !source.token) return;
    intentFlow.submit({
      sourceChainId: source.chainId,
      sourceToken: source.token,
    });
  };

  const { priceUsd } = useTokenUsdPrice({
    chainId: source.chainId,
    tokenAddress: source.tokenAddress,
    tokenSymbol: source.token?.symbol ?? "",
    resolver: engine.usdPriceResolver,
  });

  const backToMain = () => setView("main");

  const inlineError = intentFlow.quoteError
    ? `Quote failed: ${intentFlow.quoteError}`
    : intentFlow.status === "error" && intentFlow.error
      ? intentFlow.error
      : null;

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
      <ActionButton
        label={ctaState.label}
        toneClasses={CTA_TONE_CLASSES[ctaState.tone ?? "primary"]}
        busy={
          engine.isBusy ||
          !!(resolvedIntent.config.fixedOutput && intentFlow.isQuoting)
        }
        disabled={
          !isPaySwapCtaEnabled(ctaState.action) ||
          (ctaState.action === "submit" && !engine.canSubmit)
        }
        onClick={handleCtaClick}
        className={cn?.button}
      />
    </div>
  );

  const sourcePill =
    engine.hasIntent && engine.isConnected ? (
      <TokenChainPill
        tokenSymbol={(source.token ?? source.allTokens[0])?.symbol ?? ""}
        tokenLogoURI={(source.token ?? source.allTokens[0])?.logoURI}
        chainName={(source.chain ?? source.availableChains[0])?.name ?? ""}
        chainLogoURI={(source.chain ?? source.availableChains[0])?.logoURI}
        onClick={() => setView("selectToken")}
        ariaLabel="Change source token"
      />
    ) : undefined;

  const { lockDestinationToken } = engine;
  const destinationPill = (
    <TokenChainPill
      tokenSymbol={destination.requiredToken.symbol}
      tokenLogoURI={destination.tokenMeta?.logoURI}
      chainName={
        lockDestinationToken
          ? (resolvedIntent.destinationChainName ?? destination.chain?.name ?? "")
          : (destination.chain?.name ?? resolvedIntent.destinationChainName ?? "")
      }
      chainLogoURI={destination.chain?.logoURI}
      onClick={
        lockDestinationToken ? undefined : () => setView("selectDestToken")
      }
      ariaLabel={lockDestinationToken ? undefined : "Change destination token"}
    />
  );

  // One <Modal> renders every view — swapping to a different modal component per
  // view would remount the <dialog> and replay its open animation (a flicker
  // when picking a token).
  const modalView = (() => {
    if (view === "selectToken") {
      return {
        title: "Select source token",
        onBack: backToMain,
        content: (
          <TokenSelector
            tokens={source.allTokens}
            selectedTokenAddress={source.tokenAddress}
            selectedChainId={source.chainId}
            onSelect={(addr, cid) => {
              source.select(cid, addr);
              backToMain();
            }}
            onBack={backToMain}
          />
        ),
      };
    }
    if (view === "selectDestToken") {
      return {
        title: "Select destination token",
        onBack: backToMain,
        content: (
          <TokenSelector
            tokens={destination.allTokens}
            selectedTokenAddress={destination.tokenAddress}
            selectedChainId={destination.chainId}
            onSelect={(addr, cid) => {
              destination.select(cid, addr);
              backToMain();
            }}
            onBack={backToMain}
          />
        ),
      };
    }
    return {
      title: engine.modalTitle,
      footer,
      headerAction: engine.allowNetworkToggle ? (
        <NetworkToggle
          isTestnet={engine.isTestnet}
          onChange={engine.applyNetwork}
        />
      ) : undefined,
      content: (
        <PaySwapMainView
          engine={engine}
          payAmount={payAmountStr}
          receiveAmount={receiveAmountStr}
          payTokenPill={sourcePill}
          receiveTokenPill={destinationPill}
          balanceStr={
            source.token && engine.balance !== null
              ? `Balance: ${formatAmount(engine.balance, source.token.decimals)} ${source.token.symbol}`
              : undefined
          }
          usdEquivalent={formatUsdEquivalent(payAmountStr, priceUsd)}
          classNames={cn}
        />
      ),
    };
  })();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      theme={theme}
      classNames={cn}
      renderInline={renderInline}
      title={modalView.title}
      footer={modalView.footer}
      onBack={modalView.onBack}
      headerAction={modalView.headerAction}
    >
      {modalView.content}
    </Modal>
  );
}
