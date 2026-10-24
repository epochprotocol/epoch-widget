import { useCallback, useEffect, useMemo, useState } from "react";
import type { SolanaAdapter } from "@epoch-protocol/epoch-intent-widget";
import {
  Connection,
  PublicKey,
  SendTransactionError,
  VersionedTransaction,
  type Transaction,
} from "@solana/web3.js";
import { buildOpenEscrowTransaction } from "../solana/escrow";

/** Devnet USDC, the only Solana asset enabled by this temporary demo rail. */
const SOLANA_DEVNET_USDC = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: PublicKey | null;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{
    publicKey: PublicKey;
  }>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    listener: (...args: unknown[]) => void,
  ) => void;
}

declare global {
  interface Window {
    phantom?: { solana?: PhantomProvider };
    solana?: PhantomProvider;
  }
}

function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  const provider = window.phantom?.solana ?? window.solana;
  return provider?.isPhantom ? provider : null;
}

async function describeSolanaError(
  error: unknown,
  connection: Connection,
): Promise<string> {
  if (error instanceof SendTransactionError) {
    // `getLogs()` is especially useful for simulated program failures. It can
    // itself fail for preflight errors without a signature, so preserve the
    // original RPC message in that case.
    const logs = error.logs ?? (await error.getLogs(connection).catch(() => []));
    const detail = logs.length > 0 ? ` Logs: ${logs.join(" | ")}` : "";
    return `${error.message}${detail}`;
  }
  return error instanceof Error ? error.message : "Escrow deposit failed";
}

/**
 * Demo host integration for the widget's wallet-neutral Solana boundary.
 *
 * It intentionally owns Phantom discovery, RPC reads, and escrow signing
 * rather than putting a Solana wallet dependency in the widget bundle.
 */
export function useDemoSolanaAdapter(
  network: "mainnet" | "testnet",
): SolanaAdapter {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | undefined>();
  const provider = useMemo(() => getPhantomProvider(), []);
  const isDevnet = network === "testnet";
  const mint = SOLANA_DEVNET_USDC;
  // A no-key public endpoint is appropriate for the demo's read-only balance
  // check. Production hosts should set VITE_SOLANA_RPC_URL to their own RPC.
  const rpcUrl =
    (import.meta.env.VITE_SOLANA_RPC_URL as string | undefined)?.trim() ||
    "https://api.devnet.solana.com";
  const connection = useMemo(
    // The escrow is simulated and signed within one short-lived blockhash
    // window. `processed` avoids a confirmed-node lag making a freshly-issued
    // Devnet blockhash unavailable to the simulator.
    () => (isDevnet ? new Connection(rpcUrl, "processed") : null),
    [isDevnet, rpcUrl],
  );

  useEffect(() => {
    if (!provider) return;

    void provider
      .connect({ onlyIfTrusted: true })
      .then(({ publicKey }) => setAccountId(publicKey.toBase58()))
      .catch(() => undefined);

    const onAccountChanged = (...args: unknown[]) => {
      const key = args[0] as PublicKey | null;
      setAccountId(key?.toBase58() ?? null);
    };
    const onDisconnect = () => setAccountId(null);
    provider.on?.("accountChanged", onAccountChanged);
    provider.on?.("disconnect", onDisconnect);
    return () => {
      provider.removeListener?.("accountChanged", onAccountChanged);
      provider.removeListener?.("disconnect", onDisconnect);
    };
  }, [provider]);

  useEffect(() => {
    if (!accountId || !rpcUrl) {
      setBalance(undefined);
      return;
    }

    const controller = new AbortController();
    void fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [accountId, { mint }, { encoding: "jsonParsed" }],
      }),
    })
      .then((response) => response.json())
      .then((result: {
        result?: { value?: Array<{ account?: { data?: { parsed?: { info?: { tokenAmount?: { amount?: string } } } } } }> };
      }) => {
        const amount = result.result?.value?.reduce(
          (total, account) =>
            total + BigInt(account.account?.data?.parsed?.info?.tokenAmount?.amount ?? "0"),
          0n,
        );
        setBalance(amount);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setBalance(undefined);
        }
      });

    return () => controller.abort();
  }, [accountId, mint, rpcUrl]);

  const connect = useCallback(async () => {
    if (!provider) {
      window.alert("Phantom was not found. Install or unlock Phantom to use Solana.");
      return;
    }
    const { publicKey } = await provider.connect();
    setAccountId(publicKey.toBase58());
  }, [provider]);

  const openEscrow = useCallback<NonNullable<SolanaAdapter["openEscrow"]>>(
    async ({ mint: escrowMint, amount, bindingHash, reclaimAfter, programId }) => {
      if (!isDevnet || !connection) {
        return { success: false, error: "Solana escrow is enabled on Devnet only" };
      }
      if (!provider || !accountId) {
        return { success: false, error: "Connect Phantom before depositing" };
      }
      if (escrowMint !== mint) {
        return {
          success: false,
          error: `Unsupported Solana mint ${escrowMint}; this Devnet adapter only allows ${mint}`,
        };
      }

      let derivedEscrow: string | undefined;
      let submittedSignature: string | undefined;

      try {
        const currentPublicKey = provider.publicKey;
        if (!currentPublicKey || currentPublicKey.toBase58() !== accountId) {
          throw new Error(
            "Phantom account changed after quoting. Reconnect it and fetch a fresh quote.",
          );
        }
        const { transaction, escrow } = await buildOpenEscrowTransaction(
          connection,
          {
            programId: new PublicKey(programId),
            depositor: currentPublicKey,
            mint: new PublicKey(escrowMint),
            amount: BigInt(amount),
            bindingHash,
            reclaimAfter,
          },
        );
        derivedEscrow = escrow.toBase58();

        // Legacy web3.js simulation silently overwrites `transaction`'s
        // blockhash with a cached one. Simulate a versioned copy instead so
        // Helius replaces it server-side, then obtain the user-signable
        // blockhash immediately below.
        const simulation = await connection.simulateTransaction(
          new VersionedTransaction(transaction.compileMessage()),
          {
            commitment: "processed",
            replaceRecentBlockhash: true,
          },
        );
        if (simulation.value.err) {
          const logs = simulation.value.logs?.join(" | ");
          throw new Error(
            `Escrow simulation failed: ${JSON.stringify(simulation.value.err)}${
              logs ? ` Logs: ${logs}` : ""
            }`,
          );
        }

        // A signature commits to the blockhash. Fetch it only after a
        // successful simulation, immediately before Phantom opens, to leave
        // the user the largest possible validity window.
        const latestBlockhash = await connection.getLatestBlockhash("processed");
        transaction.recentBlockhash = latestBlockhash.blockhash;
        const signed = await provider.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(
          signed.serialize(),
          {
            preflightCommitment: "processed",
          },
        );
        submittedSignature = signature;
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed",
        );
        if (confirmation.value.err) {
          throw new Error(
            `Escrow failed on-chain: ${JSON.stringify(confirmation.value.err)}`,
          );
        }

        const deadline = Date.now() + 90_000;
        while (Date.now() < deadline) {
          const { value } = await connection.getSignatureStatuses([signature]);
          const status = value[0];
          if (status?.err) {
            throw new Error(`Escrow failed on-chain: ${JSON.stringify(status.err)}`);
          }
          if (status?.confirmationStatus === "finalized") {
            return { success: true, escrow: derivedEscrow, signature };
          }
          await new Promise((resolve) => window.setTimeout(resolve, 2_000));
        }
        throw new Error("Escrow transaction did not finalize within 90 seconds");
      } catch (error) {
        const recoveryContext = submittedSignature
          ? ` Transaction ${submittedSignature} was submitted; verify it before retrying. Derived escrow: ${derivedEscrow ?? "unknown"}.`
          : "";
        return {
          success: false,
          error: `${await describeSolanaError(error, connection)}${recoveryContext}`,
        };
      }
    },
    [accountId, connection, isDevnet, provider],
  );

  return useMemo(
    () => ({
      connected: !!accountId,
      accountId,
      // Do not send mainnet users to a Devnet RPC. A mainnet integration must
      // provide its own network-specific adapter and escrow configuration.
      enabled: isDevnet,
      connect,
      openEscrow: isDevnet ? openEscrow : undefined,
      assets: isDevnet ? [
        {
          mint,
          symbol: "USDC",
          decimals: 6,
          balance,
        },
      ] : [],
    }),
    [accountId, balance, connect, isDevnet, mint, openEscrow],
  );
}
