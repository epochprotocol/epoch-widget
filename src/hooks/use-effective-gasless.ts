import { useMemo } from 'react';
import { detectWalletAccountType } from '@epoch-protocol/epoch-intents-sdk';

/**
 * Gasless is only offered for local (EOA) signers the SDK can 7702-relay for;
 * smart-account / injected wallets fall back to user-paid.
 */
export function useEffectiveGasless(
  allowGasless: boolean,
  walletClient: unknown,
): boolean {
  return useMemo(
    () =>
      allowGasless &&
      walletClient != null &&
      detectWalletAccountType(walletClient as never) === 'local',
    [allowGasless, walletClient],
  );
}
