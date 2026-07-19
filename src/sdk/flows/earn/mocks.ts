import type { EpochEarnMarket, EpochEarnPosition } from '../../types.js';

export const MOCK_MAINNET_MARKETS: EpochEarnMarket[] = [
  {
    id: 'base-usdc-stable',
    displayName: 'Stable Yield USDC',
    chainLabel: 'Base',
    aprDecimal: 0.042,
    vaultAddress: '0x00000000000000000000000000000000000000a1',
    token: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      decimals: 6,
    },
    destinationChainName: 'Base',
    testnet: false,
  },
  {
    id: 'base-dai-growth',
    displayName: 'Growth DAI Pool',
    chainLabel: 'Base',
    aprDecimal: 0.067,
    vaultAddress: '0x00000000000000000000000000000000000000a2',
    token: {
      address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      symbol: 'DAI',
      decimals: 18,
    },
    destinationChainName: 'Base',
    testnet: false,
  },
  {
    id: 'arbitrum-usdc-blue',
    displayName: 'Blue Chip USDC',
    chainLabel: 'Arbitrum',
    aprDecimal: 0.038,
    vaultAddress: '0x00000000000000000000000000000000000000a3',
    token: {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      symbol: 'USDC',
      decimals: 6,
    },
    destinationChainName: 'Arbitrum',
    testnet: false,
  },
  {
    id: 'optimism-weth-eth',
    displayName: 'ETH Reserves',
    chainLabel: 'Optimism',
    aprDecimal: 0.029,
    vaultAddress: '0x00000000000000000000000000000000000000a4',
    token: {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      decimals: 18,
    },
    destinationChainName: 'Optimism',
    testnet: false,
  },
];

export const MOCK_TESTNET_MARKETS: EpochEarnMarket[] = [
  {
    id: 'sepolia-usdc-lab',
    displayName: 'Lab USDC (Sepolia)',
    chainLabel: 'Base Sepolia',
    aprDecimal: 0.12,
    vaultAddress: '0x00000000000000000000000000000000000000b1',
    token: {
      address: '0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69',
      symbol: 'USDC',
      decimals: 18,
    },
    destinationChainName: 'Base Sepolia',
    testnet: true,
  },
];

const ZERO_ADDRESS_USER = '0x0000000000000000000000000000000000000000';

export function mockPositionsForAddress(
  address: string | undefined,
  network: 'mainnet' | 'testnet',
): EpochEarnPosition[] {
  if (!address || address.toLowerCase() === ZERO_ADDRESS_USER) return [];
  const pool = network === 'testnet' ? MOCK_TESTNET_MARKETS : MOCK_MAINNET_MARKETS;
  return pool.slice(0, 2).map((market, idx) => {
    const underlyingHuman = idx === 0 ? 125.45 : 0.842;
    const decimals = market.token.decimals;
    const raw = BigInt(Math.floor(underlyingHuman * 10 ** Math.min(decimals, 9)));
    const scaled = raw * BigInt(10 ** Math.max(0, decimals - 9));
    return {
      id: `${market.id}-pos-${idx}`,
      market,
      shareBalanceRaw: scaled.toString(),
      underlyingBalanceRaw: scaled.toString(),
      underlyingUsdValue: idx === 0 ? underlyingHuman : underlyingHuman * 3500,
      testnet: market.testnet,
    };
  });
}
