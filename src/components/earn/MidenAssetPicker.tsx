import type { MidenAsset } from '../../earn/use-earn-miden';
import { formatAmount } from '../../utils';

interface MidenAssetPickerProps {
  assets: MidenAsset[];
  onSelect: (faucetId: string) => void;
}

/**
 * Source-asset list for a Miden-funded deposit.
 *
 * Deliberately not the EVM `TokenSelector`: Miden assets are keyed by faucet id
 * rather than a contract address, and carry no chain to filter by. Balances are
 * shown here (the EVM picker doesn't) because the Miden faucet list comes from
 * the Epoch graph rather than from the wallet — without them there is nothing on
 * the row to tell a funded faucet apart from one the wallet has never held.
 */
export function MidenAssetPicker({ assets, onSelect }: MidenAssetPickerProps) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {assets.map((asset) => (
        <li key={asset.faucetId}>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between rounded-md border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-line-strong"
            onClick={() => onSelect(asset.faucetId)}
          >
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-fg">{asset.symbol}</span>
              <span className="text-xs text-fg-muted">Miden</span>
            </span>
            {asset.balance !== undefined && (
              <span className="text-xs font-semibold tabular-nums text-fg-secondary">
                {formatAmount(asset.balance, asset.decimals, 8)}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
