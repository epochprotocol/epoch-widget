import type { EarnEngine } from "../../earn/use-earn-engine";
import { ArrowDownIcon } from "../Icons";
import { SegmentedTabs } from "../ui/SegmentedTabs";
import { EarnFlowPanel } from "../EarnFlowPanel";
import { GaslessSection } from "../GaslessSection";
import {
  IntentProgress,
  EARN_PROGRESS_STATUSES,
} from "../IntentProgress";
import { WithdrawPanel } from "../WithdrawPanel";

interface EarnMainViewProps {
  engine: EarnEngine;
  onPickToken: () => void;
  onPickMarket: () => void;
  onOpenPosition: () => void;
}

/** Deposit / Withdraw tabs — the widget's landing view. */
export function EarnMainView({
  engine,
  onPickToken,
  onPickMarket,
  onOpenPosition,
}: EarnMainViewProps) {
  const {
    address,
    walletIcon,
    balance,
    cn,
    depositBuildError,
    earnAmount,
    earnFlow,
    earnHideTabs,
    earnMiden,
    earnSelectedMarket,
    earnTab,
    effectiveAllowGasless,
    fundingSource,
    gasless,
    gaslessWallet,
    handleConnectMiden,
    isBalanceLoading,
    isConnected,
    isTestnet,
    miden,
    midenEnabled,
    pillChain,
    pillToken,
    positionsChainId,
    positionsLenderKey,
    positionsState,
    selectPosition,
    selectedPosition,
    selectedToken,
    setEarnAmount,
    setEarnTab,
    setFundingSource,
    setGasless,
    setPositionsChainId,
    setPositionsLenderKey,
    setSmartWithdraw,
    setWithdrawAmount,
  } = engine;

  return (
    <>
      {!earnHideTabs && (
        <SegmentedTabs<"deposit" | "withdraw">
          tabs={[
            {
              value: "deposit",
              label: "Deposit",
              icon: <ArrowDownIcon width={14} height={14} />,
            },
            {
              value: "withdraw",
              label: "Withdraw",
              icon: (
                <span
                  style={{
                    display: "inline-flex",
                    transform: "rotate(180deg)",
                  }}
                >
                  <ArrowDownIcon width={14} height={14} />
                </span>
              ),
            },
          ]}
          value={earnTab}
          onChange={setEarnTab}
          size="md"
          style={{ marginBottom: "4px" }}
        />
      )}

      {earnTab === "deposit" ? (
        <>
          <GaslessSection
            allowed={effectiveAllowGasless && fundingSource === "evm"}
            wallet={gaslessWallet}
            gasless={gasless}
            onChange={setGasless}
            className="mb-1"
          />
          <EarnFlowPanel
            selected={earnSelectedMarket}
            onPickMarket={onPickMarket}
            amount={earnAmount}
            onAmountChange={setEarnAmount}
            buildError={depositBuildError}
            walletConnected={isConnected}
            walletAddress={isConnected ? address : undefined}
            walletIcon={isConnected ? walletIcon : undefined}
            sourceTokenSymbol={pillToken?.symbol ?? "-"}
            sourceChainName={pillChain?.name ?? ""}
            sourceTokenLogoURI={pillToken?.logoURI}
            sourceChainLogoURI={pillChain?.logoURI}
            onSelectSourceToken={onPickToken}
            walletBalance={
              fundingSource === "miden"
                ? miden.balance
                : isConnected
                  ? balance
                  : null
            }
            sourceTokenDecimals={
              fundingSource === "miden"
                ? (miden.selectedAsset?.decimals ?? 18)
                : (selectedToken?.decimals ?? 18)
            }
            balanceLoading={
              fundingSource === "miden"
                ? false
                : isConnected && !!selectedToken && isBalanceLoading
            }
            midenEnabled={midenEnabled}
            fundingSource={fundingSource}
            onFundingSourceChange={setFundingSource}
            midenConnected={!!earnMiden?.connected}
            onConnectMiden={handleConnectMiden}
          />
        </>
      ) : (
        <>
          <GaslessSection
            allowed={effectiveAllowGasless}
            wallet={gaslessWallet}
            gasless={gasless}
            onChange={setGasless}
            className="mb-1"
          />
          <WithdrawPanel
          positions={positionsState.positions}
          isLoading={positionsState.isLoading}
          error={positionsState.error}
          walletConnected={isConnected}
          isTestnet={isTestnet}
          selectedPositionId={selectedPosition?.id ?? null}
          onPickPosition={(p) => {
            selectPosition(p);
            setWithdrawAmount("");
            setSmartWithdraw(false);
            onOpenPosition();
          }}
          chainFilter={positionsChainId}
          onChainFilterChange={(v) => {
            setPositionsChainId(v);
            selectPosition(null);
            setWithdrawAmount("");
          }}
          lenderFilter={positionsLenderKey}
          onLenderFilterChange={(v) => {
            setPositionsLenderKey(v);
            selectPosition(null);
            setWithdrawAmount("");
          }}
          />
        </>
      )}

      <IntentProgress
        status={earnFlow.status}
        showFor={EARN_PROGRESS_STATUSES}
        activeStep={earnFlow.activeStep}
        statusProgress={earnFlow.statusProgress}
        successMessage="Deposit completed successfully."
        classNames={cn}
      />
    </>
  );
}
