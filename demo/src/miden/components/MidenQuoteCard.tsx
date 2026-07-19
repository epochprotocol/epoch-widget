import { formatQuoteTokenIn } from "../services/epoch-bridge";

interface MidenQuoteCardProps {
  /** Raw `tokenIn` from the solver quote. */
  tokenInRaw: string | undefined;
  /** Undefined when the faucet isn't in the bundled decimals map. */
  faucetDecimals: number | undefined;
  assetSymbol: string | undefined;
  onClear: () => void;
}

/** What the user must deposit on Miden for the quoted intent. */
export function MidenQuoteCard({
  tokenInRaw,
  faucetDecimals,
  assetSymbol,
  onClear,
}: MidenQuoteCardProps) {
  // A reverse quote leaves tokenIn empty — the solver settles it at execution.
  const required = !tokenInRaw
    ? "calculated at execution"
    : faucetDecimals === undefined
      ? tokenInRaw
      : `${formatQuoteTokenIn(tokenInRaw, faucetDecimals)} ${assetSymbol ?? "tokens"}`;

  return (
    <div className="rounded-xl border border-blue-400/35 bg-blue-500/[0.06] p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-fg">Quote</span>
        <button
          type="button"
          className="cursor-pointer border-none bg-transparent text-[0.6875rem] text-fg-muted underline"
          onClick={onClear}
        >
          Clear quote
        </button>
      </div>
      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <div className="text-[0.625rem] font-semibold uppercase text-amber-900">
          Required Miden deposit
        </div>
        <div className="mt-1 font-mono text-lg font-semibold text-warning">
          {required}
        </div>
      </div>
    </div>
  );
}
