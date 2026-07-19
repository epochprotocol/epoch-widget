import { useEffect, useMemo } from 'react';
import type {
  EarnDepositIntentDefaults,
  EarnWithdrawIntentDefaults,
  EpochEarnMarket,
  EpochEarnPosition,
  EpochToken,
} from '../types';
import { buildEarnDepositIntent } from './build-deposit-intent';
import { buildEarnWithdrawIntent } from './build-withdraw-intent';
import { MIDEN_VIRTUAL_CHAIN_ID } from './miden';

export interface UseEarnQuoteTargetOptions {
  earnTab: 'deposit' | 'withdraw';
  fundingSource: 'evm' | 'miden';
  earnSelectedMarket: EpochEarnMarket | null;
  earnAmount: string;
  selectedPosition: EpochEarnPosition | null;
  withdrawAmount: string;
  earnDepositDefaults?: EarnDepositIntentDefaults;
  earnWithdrawDefaults?: EarnWithdrawIntentDefaults;
  /** The EVM chain the user picked as a deposit source. */
  selectedChainId: number | null;
  selectedToken: EpochToken | null;
  /** Miden source token, when funding from Miden. */
  midenSourceToken: EpochToken | null;
  smartWithdraw: boolean;
  smartDestChainId: number | null;
  smartDestTokenAddress: string;
  /** Called when withdraw pins the source chain to the position's chain. */
  onPinSourceChain: (chainId: number) => void;
}

export interface EarnQuoteTarget {
  /** The amount for the active tab. */
  activeAmount: string;
  /** The market for the active tab — the position's market when withdrawing. */
  activeMarket: EpochEarnMarket | null;
  /** The active tab's intent built cleanly. */
  activeBuildOk: boolean;
  depositBuildError: string | null;
  withdrawBuildError: string | null;
  /** Source chain the intent actually quotes from. */
  effectiveSourceChainId: number | null;
  /** Source token the intent actually quotes from. */
  effectiveSourceToken: EpochToken | null;
  /** Smart Withdraw destination still equals the position's own chain + token. */
  isSmartWithdrawDegenerate: boolean;
}

/**
 * Resolves *what* the widget would quote: the active amount/market, whether its
 * intent builds, and the true source chain + token.
 *
 * The source is not simply "what the user picked". Withdraw pins it to the
 * position's own underlying and chain — the intent builder needs the right
 * decimals, and keeping tokenIn = underlying holds the flow single-chain with no
 * bridge inserted ahead of the withdraw. The position's underlying may not exist
 * in the epoch-config token list at all, so it is synthesised from the market
 * rather than looked up. Miden-funded deposits instead source from the Miden
 * virtual chain.
 */
export function useEarnQuoteTarget({
  earnTab,
  fundingSource,
  earnSelectedMarket,
  earnAmount,
  selectedPosition,
  withdrawAmount,
  earnDepositDefaults,
  earnWithdrawDefaults,
  selectedChainId,
  selectedToken,
  midenSourceToken,
  smartWithdraw,
  smartDestChainId,
  smartDestTokenAddress,
  onPinSourceChain,
}: UseEarnQuoteTargetOptions): EarnQuoteTarget {
  const withdrawSourceChainId =
    earnTab === 'withdraw' && selectedPosition?.market.chainId != null
      ? selectedPosition.market.chainId
      : null;

  const withdrawSourceToken = useMemo<EpochToken | null>(() => {
    if (
      earnTab !== 'withdraw' ||
      !selectedPosition ||
      selectedPosition.market.chainId == null
    ) {
      return null;
    }
    const { token, chainId } = selectedPosition.market;
    return {
      address: token.address,
      symbol: token.symbol,
      name: token.symbol,
      decimals: token.decimals,
      chainId,
      logoURI: token.logoURI,
    };
  }, [earnTab, selectedPosition]);

  // Withdraw has no source picker — the position dictates the chain, so mirror
  // it back into the picker state the rest of the widget reads.
  useEffect(() => {
    if (withdrawSourceChainId !== null) onPinSourceChain(withdrawSourceChainId);
  }, [withdrawSourceChainId, onPinSourceChain]);

  const depositBuild = useMemo(() => {
    if (earnTab !== 'deposit' || !earnSelectedMarket || !earnAmount.trim()) {
      return null;
    }
    return buildEarnDepositIntent(
      earnSelectedMarket,
      earnAmount,
      earnDepositDefaults,
    );
  }, [earnTab, earnSelectedMarket, earnAmount, earnDepositDefaults]);

  const withdrawBuild = useMemo(() => {
    if (earnTab !== 'withdraw' || !selectedPosition || !withdrawAmount.trim()) {
      return null;
    }
    return buildEarnWithdrawIntent(
      selectedPosition,
      withdrawAmount,
      earnWithdrawDefaults,
    );
  }, [earnTab, selectedPosition, withdrawAmount, earnWithdrawDefaults]);

  const effectiveSourceToken =
    earnTab === 'withdraw'
      ? withdrawSourceToken
      : fundingSource === 'miden'
        ? midenSourceToken
        : selectedToken;

  const effectiveSourceChainId =
    earnTab === 'withdraw'
      ? withdrawSourceChainId
      : fundingSource === 'miden'
        ? MIDEN_VIRTUAL_CHAIN_ID
        : selectedChainId;

  // Smart Withdraw pointing back at the position's own chain + token is a no-op:
  // there is nothing to bridge or swap, so the cross-chain quote is guaranteed
  // to fail with NO_QUOTE_AVAILABLE. It is also the default state the instant
  // the toggle flips on, so treat it as "not configured yet" rather than
  // letting a doomed quote drive a dead retry button.
  const isSmartWithdrawDegenerate =
    earnTab === 'withdraw' &&
    smartWithdraw &&
    selectedPosition != null &&
    smartDestChainId === selectedPosition.market.chainId &&
    smartDestTokenAddress.toLowerCase() ===
      selectedPosition.market.token.address.toLowerCase();

  return {
    activeAmount: earnTab === 'deposit' ? earnAmount : withdrawAmount,
    activeMarket:
      earnTab === 'deposit'
        ? earnSelectedMarket
        : (selectedPosition?.market ?? null),
    activeBuildOk:
      earnTab === 'deposit'
        ? depositBuild?.ok === true
        : withdrawBuild?.ok === true,
    depositBuildError:
      depositBuild && !depositBuild.ok ? depositBuild.error : null,
    withdrawBuildError:
      withdrawBuild && !withdrawBuild.ok ? withdrawBuild.error : null,
    effectiveSourceChainId,
    effectiveSourceToken,
    isSmartWithdrawDegenerate,
  };
}
