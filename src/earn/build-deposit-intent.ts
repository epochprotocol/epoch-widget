import { parseUnits } from 'viem';
import type { EarnDepositIntentDefaults, EpochEarnMarket, IntentProps } from '../types';

export type EarnDepositBuild =
  | {
      ok: true;
      intent: IntentProps;
      title: string;
      submitButtonText: string;
    }
  | { ok: false; error: string };

/**
 * Build a vault-style deposit intent from a market row + human amount string.
 */
export function buildEarnDepositIntent(
  market: EpochEarnMarket,
  amountHuman: string,
  defaults?: EarnDepositIntentDefaults,
): EarnDepositBuild {
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
  const n = Number.parseFloat(s);
  const protocol = defaults?.protocol ?? 'my-dapp';
  const action = defaults?.action ?? 'deposit';
  const extraDataTypestring = defaults?.extraDataTypestring ?? 'address vault';

  const intent: IntentProps = {
    requiredToken: {
      address: market.token.address,
      symbol: market.token.symbol,
      decimals: market.token.decimals,
    },
    requiredAmount: raw,
    destinationChainName: market.destinationChainName,
    positionLabel: `${n} ${market.token.symbol} deposit`,
    config: {
      protocol,
      action,
      extraDataTypestring,
      extraData: { vault: market.vaultAddress },
      fixedOutput: false,
      destinationChainId: (market.chainId ?? 8453) as number,
    },
  };

  return {
    ok: true,
    intent,
    title: `Deposit to ${market.displayName}`,
    submitButtonText: 'Deposit via Epoch',
  };
}
