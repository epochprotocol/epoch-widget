import { useCallback, useEffect, useState } from "react";
import { createPublicClient, http, type WalletClient } from "viem";
import {
  EpochIntentSDK,
  getWalletGaslessStatus,
  detectWalletAccountType,
  GASLESS_SUPPORTED_CHAIN_IDS,
  type DelegationState,
} from "@epoch-protocol/epoch-intents-sdk";
import { getEpochChainById } from "../epoch-config";

interface UseGaslessWalletParams {
  allowGasless: boolean;
  apiBaseUrl: string;
  gasless: boolean;
  setGasless: (next: boolean) => void;
  walletClient?: WalletClient;
  address?: string;
  /** Chain to probe for 7702 support (source / wallet chain). */
  chainIdForCheck?: number | null;
  /** Switch wallet chain before smart-account setup (required for MetaMask EIP-5792). */
  // Accepts wagmi's SwitchChainMutate (returns void) as well as a Promise-returning
  // variant — the call site awaits it, which is a no-op for the void form.
  switchChain?: (args: { chainId: number }) => unknown;
}

export type UseGaslessWalletResult = {
  unavailableReason: string | null;
  delegation: DelegationState | null;
  needsEpochSetup: boolean;
  is7702Capable: boolean;
  checking: boolean;
  setupBusy: boolean;
  setupError: string | null;
  switchToEpochSmartAccount: () => Promise<void>;
};

/**
 * Probes wallet + chain gasless support and exposes Epoch smart-account setup.
 * Local accounts only — injected wallets use wallet-paid EIP-5792 batching instead.
 */
export function useGaslessWallet({
  allowGasless,
  apiBaseUrl,
  gasless,
  setGasless,
  walletClient,
  address,
  chainIdForCheck,
  switchChain,
}: UseGaslessWalletParams): UseGaslessWalletResult {
  const [unavailableReason, setUnavailableReason] = useState<string | null>(null);
  const [delegation, setDelegation] = useState<DelegationState | null>(null);
  const [needsEpochSetup, setNeedsEpochSetup] = useState(false);
  const [is7702Capable, setIs7702Capable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [setupBusy, setSetupBusy] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const probe = useCallback(async () => {
    if (!allowGasless || !walletClient || !address || chainIdForCheck == null) {
      setUnavailableReason(null);
      setDelegation(null);
      setNeedsEpochSetup(false);
      setIs7702Capable(false);
      return;
    }

    // Gasless relay (7702 delegation) is only for local signers, not injected wallets.
    // `as never`: linked SDK bundles its own viem, so its WalletClient type is nominally
    // distinct from the widget's — identical runtime shape; vanishes once SDK is from npm.
    if (detectWalletAccountType(walletClient as never) !== "local") {
      setUnavailableReason(null);
      setDelegation(null);
      setNeedsEpochSetup(false);
      setIs7702Capable(false);
      return;
    }

    setChecking(true);
    try {
      const epochChain = getEpochChainById(chainIdForCheck);
      const rpcUrl =
        epochChain?.rpcUrl ??
        walletClient.chain?.rpcUrls?.default?.http?.[0] ??
        "";

      const publicClient = createPublicClient({
        chain: walletClient.chain ?? undefined,
        transport: http(rpcUrl),
      });

      const status = await getWalletGaslessStatus({
        publicClient: publicClient as never,
        walletClient: walletClient as never,
        chainId: chainIdForCheck,
        user: address as `0x${string}`,
      });

      setDelegation(status.delegation);
      setIs7702Capable(status.is7702Capable);
      setNeedsEpochSetup(status.needsSetup);

      if (status.delegation === "other") {
        setUnavailableReason(
          "Wallet delegated to an unsupported smart account — use a different address",
        );
      } else if (!GASLESS_SUPPORTED_CHAIN_IDS.includes(chainIdForCheck)) {
        setUnavailableReason(
          `Gasless is not enabled on chain ${chainIdForCheck} — switch to Base Sepolia (84532), Optimism Sepolia (11155420), or another supported testnet`,
        );
      } else if (!status.is7702Capable) {
        setUnavailableReason("Gasless not available for this wallet or chain");
      } else {
        setUnavailableReason(null);
      }
    } catch {
      setUnavailableReason(null);
      setDelegation(null);
      setNeedsEpochSetup(false);
      setIs7702Capable(false);
    } finally {
      setChecking(false);
    }
  }, [allowGasless, walletClient, address, chainIdForCheck]);

  useEffect(() => {
    void probe();
  }, [probe]);

  useEffect(() => {
    if (gasless && unavailableReason) {
      setGasless(false);
    }
  }, [gasless, unavailableReason, setGasless]);

  const switchToEpochSmartAccount = useCallback(async () => {
    if (!walletClient || !address || chainIdForCheck == null) {
      return;
    }

    setSetupBusy(true);
    setSetupError(null);

    try {
      if (
        chainIdForCheck != null &&
        walletClient.chain?.id !== chainIdForCheck &&
        switchChain
      ) {
        try {
          await switchChain({ chainId: chainIdForCheck });
        } catch (switchErr) {
          const switchMsg =
            switchErr instanceof Error ? switchErr.message : String(switchErr);
          setSetupError(
            switchMsg.includes("User rejected") ||
              switchMsg.includes("User denied")
              ? "Network switch declined in wallet"
              : `Could not switch wallet to chain ${chainIdForCheck}. Switch manually in MetaMask, then try again.`,
          );
          return;
        }
      }

      const sdk = new EpochIntentSDK({
        apiBaseUrl,
        walletClient: walletClient as never,
      });
      const setup = sdk as EpochIntentSDK & {
        setupSmartAccount?: (params: {
          chainId: number;
        }) => Promise<{ ok: boolean; reason?: string }>;
        setupGaslessWallet?: (params: {
          chainId: number;
        }) => Promise<{ ok: boolean; reason?: string }>;
      };

      const result =
        typeof setup.setupSmartAccount === "function"
          ? await setup.setupSmartAccount({ chainId: chainIdForCheck })
          : typeof setup.setupGaslessWallet === "function"
            ? await setup.setupGaslessWallet({ chainId: chainIdForCheck })
            : null;

      if (!result) {
        setSetupError(
          "Update @epoch-protocol/epoch-intents-sdk — smart account setup is unavailable",
        );
        return;
      }

      if (!result.ok) {
        setSetupError(
          result.reason ?? "Could not switch to Epoch smart account",
        );
        return;
      }
      await probe();
      setGasless(true);
    } catch (err) {
      setSetupError(
        err instanceof Error ? err.message : "Smart account setup failed",
      );
    } finally {
      setSetupBusy(false);
    }
  }, [
    apiBaseUrl,
    walletClient,
    address,
    chainIdForCheck,
    probe,
    setGasless,
    switchChain,
  ]);

  return {
    unavailableReason,
    delegation,
    needsEpochSetup,
    is7702Capable,
    checking,
    setupBusy,
    setupError,
    switchToEpochSmartAccount,
  };
}

/** @deprecated Use {@link useGaslessWallet} */
export function useGaslessWalletCheck(
  params: Omit<UseGaslessWalletParams, "apiBaseUrl"> & { apiBaseUrl?: string },
): string | null {
  const result = useGaslessWallet({
    ...params,
    apiBaseUrl: params.apiBaseUrl ?? "",
  });
  return result.unavailableReason;
}
