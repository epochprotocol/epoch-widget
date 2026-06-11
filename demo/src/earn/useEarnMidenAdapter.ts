import { useCallback, useMemo } from 'react';
import { SendTransaction } from '@miden-sdk/miden-wallet-adapter-base';
import { useMidenFiWallet } from '@miden-sdk/miden-wallet-adapter-react';
import { DEFAULT_MIDEN_FAUCET, isDefaultMidenFaucet, type EarnMidenAdapter } from 'epoch-intent-widget';
import { useMidenWalletAdapter } from '../miden/hooks/useMidenWalletAdapter';

/**
 * Bridges the demo's Miden wallet adapter into {@link EarnMidenAdapter} for the earn widget.
 * Surfaces only {@link DEFAULT_MIDEN_FAUCET} (Miden USDC) for now.
 */
export function useEarnMidenAdapter(): EarnMidenAdapter {
  const midenWallet = useMidenWalletAdapter({ enabled: true });
  const { requestSend, waitForTransaction, connect } = useMidenFiWallet();

  const assets = useMemo(() => {
    const walletAsset = midenWallet.assets.find((a) => isDefaultMidenFaucet(a.assetId));
    return [
      {
        faucetId: DEFAULT_MIDEN_FAUCET.faucetId,
        symbol: DEFAULT_MIDEN_FAUCET.symbol,
        decimals: DEFAULT_MIDEN_FAUCET.decimals,
        balance: walletAsset?.amount ?? 0n,
      },
    ];
  }, [midenWallet.assets]);

  const createP2IDNote = useCallback<EarnMidenAdapter['createP2IDNote']>(
    async (faucetIdParam, amountParam, allocatorId) => {
      try {
        if (!midenWallet.accountId?.hex) {
          throw new Error('Connect Miden wallet first');
        }
        if (!requestSend) {
          throw new Error('Miden wallet adapter not available');
        }

        const normalizedAmount = BigInt(amountParam);
        if (normalizedAmount > BigInt(Number.MAX_SAFE_INTEGER)) {
          throw new Error('Amount too large for wallet adapter send');
        }

        const payload = new SendTransaction(
          midenWallet.accountId.hex,
          allocatorId,
          faucetIdParam,
          'public',
          Number(normalizedAmount),
        );
        const txId = await requestSend(payload);
        if (!waitForTransaction) {
          throw new Error('waitForTransaction not available in adapter');
        }
        const finalized = await waitForTransaction(txId, 120_000);
        const first = finalized.outputNotes?.[0];
        const noteId = first ? first.id().toString() : '';
        if (!noteId) {
          throw new Error(`Could not read output note id for tx ${txId}`);
        }
        return { success: true, noteId };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
    [midenWallet.accountId?.hex, requestSend, waitForTransaction],
  );

  return {
    enabled: true,
    connected: midenWallet.connected,
    accountId: midenWallet.accountId?.hex ?? null,
    assets,
    connect,
    createP2IDNote,
    reclaimHeight: 1000,
  };
}
