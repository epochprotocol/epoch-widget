import { parseUnits } from 'viem';
import type {
  EarnWithdrawIntentDefaults,
  EpochEarnPosition,
  IntentProps,
} from '../types';

export type EarnWithdrawBuild =
  | {
      ok: true;
      intent: IntentProps;
      title: string;
      submitButtonText: string;
    }
  | { ok: false; error: string };

/**
 * Build a vault-style withdraw intent from a user position + human amount.
 */
export function buildEarnWithdrawIntent(
  position: EpochEarnPosition,
  amountHuman: string,
  defaults?: EarnWithdrawIntentDefaults,
): EarnWithdrawBuild {
  const market = position.market;
  const s = amountHuman.trim().replace(/,/g, '');
  if (!/^\d*\.?\d+$/.test(s) || Number.parseFloat(s) <= 0) {
    return { ok: false, error: 'Enter a valid positive amount.' };
  }
  let raw: bigint;
  try {
    raw = parseUnits(s, market.token.decimals);
  } catch {
    return { ok: false, error: 'Could not parse amount.' };
  }

  let availableRaw: bigint;
  try {
    availableRaw = BigInt(position.underlyingBalanceRaw);
  } catch {
    availableRaw = 0n;
  }
  if (raw > availableRaw) {
    return { ok: false, error: 'Amount exceeds position balance.' };
  }

  const n = Number.parseFloat(s);
  const protocol = defaults?.protocol ?? 'my-dapp';
  const action = defaults?.action ?? 'withdraw';
  const extraDataTypestring =
    defaults?.extraDataTypestring ?? 'address vault,uint256 shares';

  const intent: IntentProps = {
    requiredToken: {
      address: market.token.address,
      symbol: market.token.symbol,
      decimals: market.token.decimals,
    },
    requiredAmount: raw,
    destinationChainName: market.destinationChainName,
    positionLabel: `${n} ${market.token.symbol} withdraw`,
    config: {
      protocol,
      action,
      extraDataTypestring,
      extraData: { vault: market.vaultAddress, shares: raw.toString() },
      fixedOutput: false,
      destinationChainId: (market.chainId ?? 8453) as number,
    },
  };

  return {
    ok: true,
    intent,
    title: `Withdraw from ${market.displayName}`,
    submitButtonText: 'Withdraw via Epoch',
  };
}
