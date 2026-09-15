import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { type EarnMidenAdapter } from '@epoch-protocol/epoch-intent-widget';
import { useMidenWalletAdapter } from '../miden/hooks/useMidenWalletAdapter';
import { useMidenP2IDNoteFactory } from '../miden/hooks/useMidenP2IDNoteFactory';

/**
 * Bridges the demo's Miden wallet adapter into {@link EarnMidenAdapter}, shared by
 * the earn and pay/swap flows.
 */
export function useEarnMidenAdapter(): EarnMidenAdapter {
  const midenWallet = useMidenWalletAdapter({ enabled: true });

  const assets = useMemo(() => {
    // Keep the wallet's exact faucet ids. The widget matches these against graph
    // faucets after normalizing hex and bech32 forms; symbols are not identities.
    return midenWallet.assets.map((a) => ({
      faucetId: a.assetId,
      symbol: a.symbol ?? '',
      decimals: a.decimals ?? 6,
      balance: a.amount,
    }));
  }, [midenWallet.assets]);

  // The SDK also hands this callback a relative `recallBlocks` and the
  // mandate-binding attachment felts; both have to make it into the note, so the
  // minting lives in the shared factory rather than a plain wallet send.
  const createP2IDNote = useMidenP2IDNoteFactory({
    midenAccountId: midenWallet.accountId?.hex ?? null,
  });

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
