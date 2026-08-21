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
    // What the wallet actually holds, passed through as-is. The widget decides
    // which faucets it can offer (graph tokens) and overlays these balances by
    // faucet id, falling back to symbol. Pre-mapping to the graph here would
    // drop the wallet's symbol — and with it that fallback — so a faucet id the
    // widget couldn't match would silently read as a zero balance.
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
