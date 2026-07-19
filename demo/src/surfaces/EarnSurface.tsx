import { useState } from 'react';
import type { ScenarioProps } from '../pay/scenarios';
import { EARN_DEPOSIT_PROPS, EARN_WITHDRAW_PROPS } from '../earn/earnMarkets';
import {
  MultiSelectDropdown,
  type MultiSelectOption,
} from '../components/MultiSelectDropdown';

interface Props {
  apiBaseUrl: string;
  onOpenWidget: (props: ScenarioProps) => void;
}

// Hardcoded list — matches widget's EARN_MAINNET_CHAIN_IDS allowlist.
const CHAIN_OPTIONS: MultiSelectOption[] = [
  { value: '1', label: 'Ethereum' },
  { value: '8453', label: 'Base' },
  { value: '42161', label: 'Arbitrum' },
  { value: '10', label: 'Optimism' },
  { value: '137', label: 'Polygon' },
];

// Hardcoded list — values forwarded as `lender=` CSV to /pools. 1delta keys
// (granular variants like `MORPHO_BLUE_<hash>` still resolve via prefix match
// against the family entry). Sourced from 1delta's `/lenders` endpoint
// (manual snapshot — refresh by re-pasting if upstream adds new lenders).
const LENDER_KEYS = [
  'AAVE_V3', 'AAVE_V3_PRIME', 'AAVE_V3_ETHER_FI', 'AAVE_V3_HORIZON', 'AAVE_V2',
  'AURELIUS', 'LENDLE', 'LENDLE_CMETH', 'LENDLE_SUSDE', 'LENDLE_PT_CMETH',
  'MERIDIAN', 'TAKOTAKO', 'TAKOTAKO_ETH', 'HANA', 'YLDR', 'MAGSIN', 'SPARK',
  'NEREUS', 'KINZA', 'GRANARY', 'LORE', 'LENDOS', 'IRONCLAD', 'MOLEND',
  'SEISMIC', 'POLTER', 'AGAVE', 'MOOLA', 'XLEND', 'KLAP', 'RHOMBUS', 'RMM',
  'KLAYBANK', 'SAKE', 'SAKE_ASTAR', 'LAYERBANK_V3', 'COLEND', 'COLEND_LSTBTC',
  'PAC', 'VALAS', 'HYPERLEND', 'HYPURRFI', 'HYPERYIELD', 'MOONCAKE', 'PHIAT',
  'RADIANT_V2', 'FATHOM', 'U235', 'QUOKKA_LEND', 'PRIME_FI', 'PLOUTOS', 'YEI',
  'YEI_SOLV', 'NEVERLAND', 'KONA_LEND', 'EDEL', 'VOLTAGE_LENDING', 'AQUALOAN',
  'BETTER_BANK', 'BETTER_BANK_ATROPA', 'ZEROLEND', 'ZEROLEND_STABLECOINS_RWA',
  'ZEROLEND_ETH_LRTS', 'ZEROLEND_BTC_LRTS', 'ZEROLEND_CROAK', 'ZEROLEND_FOXY',
  'LENDLE_SUSDE_USDT', 'LENDLE_METH_WETH', 'LENDLE_METH_USDE',
  'LENDLE_CMETH_WETH', 'LENDLE_CMETH_USDE', 'LENDLE_CMETH_WMNT',
  'LENDLE_FBTC_WETH', 'LENDLE_FBTC_USDE', 'LENDLE_FBTC_WMNT',
  'LENDLE_WMNT_WETH', 'LENDLE_WMNT_USDE', 'AVALON', 'AVALON_SOLVBTC',
  'AVALON_SWELLBTC', 'AVALON_PUMPBTC', 'AVALON_UNIBTC', 'AVALON_EBTC_LBTC',
  'AVALON_USDA', 'AVALON_SKAIA', 'AVALON_LORENZO', 'AVALON_INNOVATION',
  'AVALON_UBTC', 'AVALON_OBTC', 'AVALON_BEETS', 'AVALON_UNIIOTX', 'AVALON_BOB',
  'AVALON_STBTC', 'AVALON_WBTC', 'AVALON_LBTC', 'AVALON_XAUM', 'AVALON_LISTA',
  'AVALON_USDX', 'COMPOUND_V2', 'VENUS', 'VENUS_ETH', 'VENUS_BNB', 'VENUS_BTC',
  'VENUS_MEME', 'VENUS_DEFI', 'VENUS_GAMEFI', 'VENUS_STABLE', 'VENUS_TRON',
  'VENUS_ETHENA', 'VENUS_CURVE', 'SEGMENT', 'ENCLABS', 'ENCLABS_LST',
  'ENCLABS_PT_USD', 'ENCLABS_PT_ETH', 'ENCLABS_SONIC_ECO', 'TAKARA', 'UNITUS',
  'BENQI', 'BENQI_AVALANCHE_ECOSYSTEM', 'KEOM', 'OVIX', 'MOONWELL', 'LODESTAR',
  'ORBITER_ONE', 'MENDI', 'SUMER', 'TECTONIC', 'TECTONIC_VENO', 'TECTONIC_DEFI',
  'SHOEBILL', 'DFORCE', 'TENDER', 'FLUX_FINANCE', 'WE_PIGGY', 'GAMMA',
  'CREAM_FINANCE', 'CAPY_FI', 'COMPOUND_V3_USDC', 'COMPOUND_V3_USDT',
  'COMPOUND_V3_USDE', 'COMPOUND_V3_USDBC', 'COMPOUND_V3_USDCE',
  'COMPOUND_V3_USDS', 'COMPOUND_V3_WETH', 'COMPOUND_V3_WRON', 'COMPOUND_V3_AERO',
  'COMPOUND_V3_WSTETH', 'COMPOUND_V3_WBTC', 'INIT', 'MORPHO_BLUE', 'LISTA_DAO',
  'FLUID', 'GEARBOX_V3', 'SILO_V2', 'SILO_V3', 'EULER_V2', 'SWAYLEND_USDC',
] as const;

// Segments kept upper-case in the readable label (tickers, version suffixes).
// Anything else gets title-case so families like `BENQI_AVALANCHE_ECOSYSTEM`
// read as "Benqi Avalanche Ecosystem" instead of an all-caps wall.
const KEEP_UPPER = new Set([
  'LP', 'PT', 'RWA', 'LST', 'LRTS', 'DAO',
  'USDC', 'USDT', 'USDS', 'USDE', 'USDA', 'USDX', 'USDBC', 'USDCE', 'PYUSD',
  'GHO', 'DAI',
  'ETH', 'WETH', 'CMETH', 'METH', 'WSTETH',
  'BTC', 'WBTC', 'LBTC', 'EBTC', 'UBTC', 'OBTC', 'STBTC', 'CBBTC', 'FBTC',
  'SOLVBTC', 'SWELLBTC', 'PUMPBTC', 'UNIBTC', 'LSTBTC',
  'BNB', 'MNT', 'WMNT', 'AERO', 'WRON', 'BOB', 'XAUM',
  'SUSDE', 'SOLV', 'BEETS', 'LISTA', 'UNIIOTX', 'VENO', 'SKAIA', 'EDEL',
  'CROAK', 'FOXY', 'ATROPA', 'LORENZO', 'TRON', 'CURVE',
]);

function prettifyLender(key: string): string {
  return key
    .split('_')
    .map((seg) => {
      if (KEEP_UPPER.has(seg)) return seg;
      if (/^V\d+$/i.test(seg)) return seg.toUpperCase();
      return seg.charAt(0) + seg.slice(1).toLowerCase();
    })
    .join(' ');
}

const LENDER_OPTIONS: MultiSelectOption[] = LENDER_KEYS.map((k) => ({
  value: k,
  label: prettifyLender(k),
}));

export function EarnSurface({ onOpenWidget }: Props) {
  const [chains, setChains] = useState<string[]>([]);
  const [lenders, setLenders] = useState<string[]>([]);

  const earnChainIds = chains.length
    ? chains.flatMap((c) => {
        const id = Number(c);
        return Number.isFinite(id) ? [id] : [];
      })
    : undefined;
  const earnLenderFilter = lenders.length ? lenders.join(',') : undefined;

  const open = (base: ScenarioProps) => {
    onOpenWidget({
      ...base,
      ...(earnChainIds ? { earnChainIds } : {}),
      ...(earnLenderFilter ? { earnLenderFilter } : {}),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="m-0 text-3xl font-[650] -tracking-tight text-fg">Earn</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-fg-secondary">
          Deposit into yield markets, withdraw on demand.
        </p>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-fg-muted">
          Show a list of lending and yield markets right inside your app. Users deposit with any
          token they hold; withdrawals come back to the same wallet. Use the Mainnet / Testnet toggle
          in the modal header to try dummy-lending on Base Sepolia and Ethereum Sepolia (fund from
          Optimism Sepolia, Ethereum Sepolia, Base Sepolia, or Miden on testnet), with
          optional Miden as a deposit source on testnet.
        </p>
      </header>

      <section className="rounded-md border border-line bg-surface p-5 shadow-sm">
        <div className="mb-3 text-base font-semibold text-fg">Filters</div>
        <p className="mb-4 text-sm text-fg-muted">
          Leave empty to include all. Selections forward to the widget as
          <code className="ml-1 rounded bg-canvas px-1 py-0.5 text-[12px]">earnChainIds</code>{' '}
          and
          <code className="ml-1 rounded bg-canvas px-1 py-0.5 text-[12px]">earnLenderFilter</code>.
        </p>
        <div className="flex flex-wrap gap-4">
          <MultiSelectDropdown
            label="Chains"
            options={CHAIN_OPTIONS}
            selected={chains}
            onChange={setChains}
            placeholder="All chains"
            emptyLabel="All chains"
          />
          <MultiSelectDropdown
            label="Lenders"
            options={LENDER_OPTIONS}
            selected={lenders}
            onChange={setLenders}
            placeholder="All lenders"
            emptyLabel="All lenders"
          />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-line bg-surface p-5 shadow-sm">
          <div className="mb-2 text-base font-semibold text-fg">Deposit</div>
          <p className="mb-4 text-[13px] text-fg-muted">
            Pick a lending market and deposit from an EVM wallet or Miden (testnet). Toggle{' '}
            <strong>Testnet</strong> in the modal, then use the EVM / Miden source switch on the
            deposit form.
          </p>
          <button
            type="button"
            onClick={() => open(EARN_DEPOSIT_PROPS)}
            className="cursor-pointer rounded-md border-0 bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Open deposit flow →
          </button>
        </div>
        <div className="rounded-md border border-line bg-surface p-5 shadow-sm">
          <div className="mb-4 text-base font-semibold text-fg">Withdraw</div>
          <button
            type="button"
            onClick={() => open(EARN_WITHDRAW_PROPS)}
            className="cursor-pointer rounded-md border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-fg shadow-sm transition-colors hover:border-line-strong"
          >
            Open withdraw flow →
          </button>
        </div>
      </section>
    </div>
  );
}
