import { useCallback, useMemo } from 'react';
import { SendTransaction } from '@miden-sdk/miden-wallet-adapter-base';
import { useMidenFiWallet } from '@miden-sdk/miden-wallet-adapter-react';
import { toast } from 'sonner';
import {
  DEFAULT_MIDEN_FAUCET,
  isDefaultMidenFaucet,
  type EarnMidenAdapter,
} from '@epoch-protocol/epoch-intent-widget';
import { useMidenWalletAdapter } from '../miden/hooks/useMidenWalletAdapter';

/**
 * Bridges the demo's Miden wallet adapter into {@link EarnMidenAdapter} for the earn widget.
 * Surfaces only {@link DEFAULT_MIDEN_FAUCET} (Miden USDC) for now.
 */
export function useEarnMidenAdapter(): EarnMidenAdapter {
  const midenWallet = useMidenWalletAdapter({ enabled: true });
  const { requestSend, waitForTransaction } = useMidenFiWallet();

  const assets = useMemo(() => {
    // Prefer the asset whose faucet id matches the default faucet. The wallet
    // can report faucet ids in a different encoding (bech32 vs hex), so a strict
    // match may miss even when the balance exists — fall back to the wallet's
    // first asset so the default token balance is still surfaced.
    const walletAsset =
      midenWallet.assets.find((a) => isDefaultMidenFaucet(a.assetId)) ??
      midenWallet.assets[0];
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

  const connect = useCallback(async () => {
    try {
      await midenWallet.connect();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Miden connect failed: ${message}`);
      throw err;
    }
  }, [midenWallet.connect]);

  return useMemo(
    (): EarnMidenAdapter => ({
      enabled: true,
      connected: midenWallet.connected,
      accountId: midenWallet.accountId?.hex ?? null,
      assets,
      connect,
      createP2IDNote,
    }),
    [
      assets,
      connect,
      createP2IDNote,
      midenWallet.accountId?.hex,
      midenWallet.connected,
    ],
  );
}
