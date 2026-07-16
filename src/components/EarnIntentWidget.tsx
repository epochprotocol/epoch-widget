import { useEarnEngine } from "../earn/use-earn-engine";
import { EarnMainView } from "./earn/EarnMainView";
import { TokenPickerModal } from "./TokenPickerModal";
import { EarnWithdrawDetailView } from "./earn/EarnWithdrawDetailView";
import { DEFAULT_MIDEN_FAUCET } from "../earn/miden";
import { MarketPickerPage } from "./MarketPickerPage";
import { Modal } from "./Modal";
import { NetworkToggle } from "./NetworkToggle";
import { MidenAssetPicker } from "./earn/MidenAssetPicker";
import { EarnCtaButton } from "./earn/EarnCtaButton";
import {
  WithdrawFundsButton,
} from "./WithdrawDetailPanel";

export type { EarnIntentWidgetProps } from "../earn/earn-props";
import type { EarnIntentWidgetProps } from "../earn/earn-props";

/**
 * Earn flow. `useEarnEngine` owns the state and SDK wiring; this file decides
 * what the user sees.
 */

export function EarnIntentWidget(props: EarnIntentWidgetProps) {
  const engine = useEarnEngine(props);
  const {
    allTokens,
    ctaEnabled,
    ctaState,
    earnFlow,
    earnSelectedMarket,
    earnTab,
    fundingSource,
    handleCtaClick,
    isBusy,
    isTestnet,
    miden,
    midenEnabled,
    modalTitle,
    picker,
    selectPosition,
    selectedChainId,
    selectedPosition,
    selectedTokenAddress,
    setEarnSelectedMarket,
    setSelectedChainId,
    setSelectedMidenFaucetId,
    setSmartWithdraw,
    setTokenAddressPick,
    setWithdrawAmount,
    smartWithdraw,
    view,
    setView,
    applyNetwork,
    allowNetworkToggle,
    cn,
    theme,
    renderInline,
    isOpen,
    onClose,
  } = engine;

  const headerAction = allowNetworkToggle ? (
    <NetworkToggle isTestnet={isTestnet} onChange={applyNetwork} />
  ) : null;


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
    // Miden assets are keyed by faucet id, not a contract address, so they get
    // their own picker rather than the shared EVM one.
    if (fundingSource === "miden" && midenEnabled) {
      return (
        <Modal {...modalChrome} title="Select Miden asset" onBack={backToMain}>
          <MidenAssetPicker
            assets={
              miden.assets.length > 0 ? miden.assets : [DEFAULT_MIDEN_FAUCET]
            }
            onSelect={(faucetId) => {
              setSelectedMidenFaucetId(faucetId);
              backToMain();
            }}
          />
        </Modal>
      );
    }
    return (
      <TokenPickerModal
        chrome={modalChrome}
        title="Select source token"
        tokens={allTokens}
        selectedTokenAddress={selectedTokenAddress}
        selectedChainId={selectedChainId}
        onSelect={(cid, addr) => {
          setSelectedChainId(cid);
          setTokenAddressPick(addr);
          backToMain();
        }}
        onBack={backToMain}
      />
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
        <EarnWithdrawDetailView
          engine={engine}
          position={selectedPosition}
          onPickAnotherPosition={backToMain}
        />
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
      <EarnMainView
        engine={engine}
        onPickToken={() => setView("selectToken")}
        onPickMarket={() => setView("selectMarket")}
        onOpenPosition={() => setView("withdrawDetail")}
      />
    </Modal>
  );
}