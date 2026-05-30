import { SECTION_LABEL } from '../lib/styles';
import type { EpochEarnPosition } from '../types';
import { Banner } from './Banner';
import { PositionRow } from './PositionRow';
import { Shimmer } from './Shimmer';
import { FilterDropdown, type FilterOption } from './ui/FilterDropdown';

const ALL_GRADIENT = 'linear-gradient(135deg, #b6509e 0%, #2ebac6 100%)';

// First option = empty value → hook falls back to derived all-chains CSV.
const POSITIONS_CHAIN_OPTIONS: FilterOption[] = [
  { value: '', label: 'All chains', dotBackground: ALL_GRADIENT },
  { value: '8453', label: 'Base', dotColor: '#0052ff' },
  { value: '1', label: 'Ethereum', dotColor: '#627eea' },
  { value: '42161', label: 'Arbitrum', dotColor: '#28a0f0' },
  { value: '10', label: 'Optimism', dotColor: '#ff0420' },
  { value: '137', label: 'Polygon', dotColor: '#8247e5' },
];

const POSITIONS_LENDER_OPTIONS: FilterOption[] = [
  { value: '', label: 'All lenders', dotBackground: ALL_GRADIENT },
  { value: 'AAVE_V3', label: 'Aave V3', dotColor: '#b6509e' },
  { value: 'COMPOUND_V3', label: 'Compound V3', dotColor: '#00d395' },
  { value: 'MORPHO', label: 'Morpho', dotColor: '#2b5cff' },
  { value: 'EULER_V2', label: 'Euler V2', dotColor: '#4d9aff' },
];

interface Props {
  positions: EpochEarnPosition[];
  isLoading: boolean;
  error: Error | null;
  walletConnected: boolean;
  selectedPositionId: string | null;
  onPickPosition: (p: EpochEarnPosition) => void;
  chainFilter: string;
  onChainFilterChange: (v: string) => void;
  lenderFilter: string;
  onLenderFilterChange: (v: string) => void;
}


export function WithdrawPanel({
  positions,
  isLoading,
  error,
  walletConnected,
  selectedPositionId,
  onPickPosition,
  chainFilter,
  onChainFilterChange,
  lenderFilter,
  onLenderFilterChange,
}: Props) {
  const positionsCount = positions.length;

  const headerRow = (
    <div className="mb-3 flex items-center justify-between gap-2">
      <span className={SECTION_LABEL}>
        Your positions
        {!isLoading && positionsCount > 0 && (
          <span className="ml-1.5 normal-case tracking-normal text-fg-muted/80">
            · {positionsCount}
          </span>
        )}
      </span>
      <div className="flex gap-1.5">
        <FilterDropdown
          ariaLabel="Filter positions by chain"
          size="sm"
          align="end"
          menuWidth={180}
          value={chainFilter}
          onChange={onChainFilterChange}
          options={POSITIONS_CHAIN_OPTIONS}
        />
        <FilterDropdown
          ariaLabel="Filter positions by lender"
          size="sm"
          align="end"
          menuWidth={180}
          value={lenderFilter}
          onChange={onLenderFilterChange}
          options={POSITIONS_LENDER_OPTIONS}
        />
      </div>
    </div>
  );

  if (!walletConnected) {
    return <Banner variant="info">Connect your wallet to load your positions.</Banner>;
  }
  if (error) {
    return (
      <>
        {headerRow}
        <Banner variant="error">Failed to load positions: {error.message}</Banner>
      </>
    );
  }
  if (isLoading) {
    return (
      <>
        {headerRow}
        <div className="flex flex-col gap-2">
          <Shimmer width="100%" height="76px" radius="var(--epoch-radius-md)" />
          <Shimmer width="100%" height="76px" radius="var(--epoch-radius-md)" />
          <Shimmer width="100%" height="76px" radius="var(--epoch-radius-md)" />
        </div>
      </>
    );
  }
  if (positions.length === 0) {
    return (
      <>
        {headerRow}
        <div className="animate-overlay-in rounded-md border border-line bg-canvas px-5 py-4 shadow-sm text-[13px] leading-relaxed">
          <p className="m-0 font-semibold text-fg">No active positions</p>
          <p className="mt-2 mb-0 text-fg-muted">
            Deposit into a market first and your withdrawable positions will show up here.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {headerRow}
      <div className="flex animate-overlay-in flex-col gap-2">
        {positions.map((p, i) => (
          <PositionRow
            key={p.id}
            position={p}
            expanded={selectedPositionId === p.id}
            onWithdrawClick={() => onPickPosition(p)}
            entryDelayMs={Math.min(i, 5) * 40}
          />
        ))}
      </div>
    </>
  );
}
