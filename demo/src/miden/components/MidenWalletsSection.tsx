interface MidenWalletsSectionProps {
  midenConnected: boolean;
  midenAccountIdHex: string | undefined;
  onConnectMiden: () => void;
}

const LABEL =
  "mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-wide text-fg-muted";
const CARD = "rounded-lg border border-line bg-canvas p-3";

/** The EVM wallet is owned by the page header (RainbowKit), not this panel. */
function ConnectButtonPlaceholder() {
  return (
    <p className="m-0 text-xs leading-normal text-fg-muted">
      Use <strong>Connect</strong> in the page header (RainbowKit). This wallet
      pays gas and receives status polls for{" "}
      <code className="font-mono text-[0.6875rem]">getIntentStatus</code>.
    </p>
  );
}

export function MidenWalletsSection({
  midenConnected,
  midenAccountIdHex,
  onConnectMiden,
}: MidenWalletsSectionProps) {
  return (
    <section className="rounded-[0.875rem] border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-3 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-fg-muted">
        Wallets
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={CARD}>
          <div className={LABEL}>EVM (gas + recipient)</div>
          <ConnectButtonPlaceholder />
        </div>
        <div className={CARD}>
          <div className={LABEL}>Miden</div>
          <div className="mb-2 break-all font-mono text-xs text-fg-secondary">
            {midenConnected
              ? (midenAccountIdHex ?? "connected")
              : "Not connected"}
          </div>
          <button
            type="button"
            className={`cursor-pointer rounded-lg border-none bg-primary px-3 py-1.5 text-[0.8125rem] font-semibold text-white ${midenConnected ? "opacity-60" : ""}`}
            disabled={midenConnected}
            onClick={onConnectMiden}
          >
            {midenConnected ? "Connected" : "Connect Miden"}
          </button>
        </div>
      </div>
    </section>
  );
}
