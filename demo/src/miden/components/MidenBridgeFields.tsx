import { useId } from "react";
import type { MidenWalletAsset } from "../hooks/useMidenWalletAdapter";

interface OutputToken {
  symbol: string;
  address: string;
  decimals: number;
}

interface MidenBridgeFieldsProps {
  assets: MidenWalletAsset[];
  isLoadingAssets: boolean;
  outputTokens: ReadonlyArray<OutputToken>;
  selectedAssetId: string;
  setSelectedAssetId: (v: string) => void;
  outputToken: string;
  setOutputToken: (v: string) => void;
  minTokenOut: string;
  setMinTokenOut: (v: string) => void;
  chainId: string;
  setChainId: (v: string) => void;
  evmAddress: string;
  setEvmAddress: (v: string) => void;
  /** The connected EVM wallet, offered as a one-click recipient. */
  connectedAddress?: string;
  selectedAssetBalance?: bigint;
  /** Any edit invalidates an outstanding quote. */
  onDirty: () => void;
}

/**
 * The bridge form: source asset, output token, minimum output, destination.
 *
 * Every field calls `onDirty` so a pending quote can't survive an edit that
 * would change it — the panel drops the quote rather than letting the user
 * confirm terms they can no longer see.
 */
export function MidenBridgeFields({
  assets,
  isLoadingAssets,
  outputTokens,
  selectedAssetId,
  setSelectedAssetId,
  outputToken,
  setOutputToken,
  minTokenOut,
  setMinTokenOut,
  chainId,
  setChainId,
  evmAddress,
  setEvmAddress,
  connectedAddress,
  selectedAssetBalance,
  onDirty,
}: MidenBridgeFieldsProps) {
  const sourceAssetId = useId();
  const outputTokenId = useId();
  const minOutputId = useId();
  const destChainId = useId();
  const destAddressId = useId();

  return (
    <>
          <div>
            <label
              htmlFor={sourceAssetId}
              className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-wide text-fg-muted"
            >
              Source asset (Miden)
            </label>
            <select
              id={sourceAssetId}
              className="box-border w-full rounded-lg border border-line px-2.5 py-2 font-sans text-sm"
              value={selectedAssetId}
              onChange={(e) => {
                setSelectedAssetId(e.target.value);
                onDirty();
              }}
              disabled={isLoadingAssets}
            >
              <option value="">
                {isLoadingAssets ? "Loading…" : "Select asset"}
              </option>
              {assets.map((a) => (
                <option key={a.assetId} value={a.assetId}>
                  {a.symbol ?? a.assetId.slice(0, 16) + "…"} —{" "}
                  {a.amount.toString()}
                </option>
              ))}
            </select>
            <div className="mt-1 text-[0.6875rem] text-fg-muted">
              Balance: {selectedAssetBalance?.toString() ?? "—"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor={outputTokenId}
                className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-wide text-fg-muted"
              >
                Output token (Sepolia)
              </label>
              <select
                id={outputTokenId}
                className="box-border w-full rounded-lg border border-line px-2.5 py-2 font-sans text-sm"
                value={outputToken}
                onChange={(e) => {
                  setOutputToken(e.target.value);
                  onDirty();
                }}
              >
                {outputTokens.map((t) => (
                  <option key={t.address} value={t.address}>
                    {t.symbol}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor={minOutputId}
                className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-wide text-fg-muted"
              >
                Min output (wei)
              </label>
              <input
                id={minOutputId}
                className="box-border w-full rounded-lg border border-line px-2.5 py-2 font-mono text-sm"
                value={minTokenOut}
                onChange={(e) => {
                  setMinTokenOut(e.target.value);
                  onDirty();
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={destChainId}
              className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-wide text-fg-muted"
            >
              Destination chain ID
            </label>
            <input
              id={destChainId}
              className="box-border w-full rounded-lg border border-line px-2.5 py-2 font-mono text-sm"
              value={chainId}
              onChange={(e) => {
                setChainId(e.target.value);
                onDirty();
              }}
            />
          </div>

          <div>
            <label
              htmlFor={destAddressId}
              className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-wide text-fg-muted"
            >
              Destination EVM address
            </label>
            <input
              id={destAddressId}
              className="box-border w-full rounded-lg border border-line px-2.5 py-2 font-mono text-sm"
              value={evmAddress}
              onChange={(e) => {
                setEvmAddress(e.target.value);
                onDirty();
              }}
              placeholder={connectedAddress ?? "0x…"}
            />
            {connectedAddress && (
              <button
                type="button"
                className="mt-1.5 cursor-pointer border-none bg-transparent p-0 text-[0.6875rem] text-blue-600 underline"
                onClick={() => setEvmAddress(connectedAddress)}
              >
                Use connected wallet
              </button>
            )}
          </div>
    </>
  );
}
