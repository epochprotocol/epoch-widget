import type { EarnEngine } from "../../earn/use-earn-engine";
import { MIDEN_VIRTUAL_CHAIN_ID, DEFAULT_MIDEN_FAUCET } from "../../earn/miden";
import { getEpochTokensByChainEnv } from "../../epoch-config";
import {
  IntentProgress,
  EARN_PROGRESS_STATUSES,
} from "../IntentProgress";
import { WithdrawDetailPanel } from "../WithdrawDetailPanel";
import type { EpochEarnPosition } from "../../types";

interface EarnWithdrawDetailViewProps {
  engine: EarnEngine;
  position: EpochEarnPosition;
  onPickAnotherPosition: () => void;
}

export function EarnWithdrawDetailView({
  engine,
  position,
  onPickAnotherPosition,
}: EarnWithdrawDetailViewProps) {
  const {
    cn,
    earnFlow,
    earnMiden,
    handleSmartWithdrawChange,
    isTestnet,
    miden,
    setSmartDestChainId,
    setSmartDestTokenAddress,
    setWithdrawAmount,
    smartDestChainId,
    smartDestTokenAddress,
    smartWithdraw,
    withdrawAmount,
    withdrawBuildError,
  } = engine;

  return (
    <>
        <WithdrawDetailPanel
          position={position}
          amount={withdrawAmount}
          onAmountChange={(v) => {
            setWithdrawAmount(v);
          }}
          onPickFraction={(human) => {
            setWithdrawAmount(human);
          }}
          // Opens the picker without discarding the current selection — backing
          // out returns to the same amount + position.
          onPickAnotherPosition={onPickAnotherPosition}
          smartWithdraw={smartWithdraw}
          onSmartWithdrawChange={handleSmartWithdrawChange}
          smartDestChainId={smartDestChainId}
          smartDestTokenAddress={smartDestTokenAddress}
          onPickDestChain={(id) => {
            setSmartDestChainId(id);
            // Reset receive token to first option on the new chain so we never
            // surface a stale token from another network. Miden → default faucet.
            if (id === MIDEN_VIRTUAL_CHAIN_ID) {
              setSmartDestTokenAddress(
                miden.destFaucets[0]?.faucetId ?? DEFAULT_MIDEN_FAUCET.faucetId,
              );
            } else {
              const firstTok = getEpochTokensByChainEnv(id, isTestnet)[0];
              setSmartDestTokenAddress(firstTok?.address ?? "");
            }
          }}
          onPickDestToken={setSmartDestTokenAddress}
          isTestnet={isTestnet}
          midenDestEnabled={miden.destEnabled}
          midenRecipientAccount={earnMiden?.accountId}
          midenFaucets={miden.destFaucets}
          buildError={withdrawBuildError}
          quoteError={earnFlow.quoteError}
          isQuoting={earnFlow.isQuoting}
          approxUsd={(() => {
            const usd = position.underlyingUsdValue;
            const bal = (() => {
              try {
                return (
                  Number(position.underlyingBalanceRaw) /
                  10 ** position.market.token.decimals
                );
              } catch {
                return 0;
              }
            })();
            const n = Number(withdrawAmount);
            if (!Number.isFinite(n) || n <= 0 || !usd || bal <= 0) return null;
            return (n / bal) * usd;
          })()}
        />
        <IntentProgress
          status={earnFlow.status}
          showFor={EARN_PROGRESS_STATUSES}
          activeStep={earnFlow.activeStep}
          statusProgress={earnFlow.statusProgress}
          successMessage="Withdraw completed successfully."
          classNames={cn}
        />
    </>
  );
}
