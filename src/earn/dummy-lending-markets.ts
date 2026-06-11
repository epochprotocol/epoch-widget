import type { OneDeltaConfig, OneDeltaMarketRow } from '../types';
export const DUMMY_LENDING_CHAIN_IDS = ['84532', '11155111', '11155420'] as const;

export const TESTNET_CHAIN_IDS = new Set<string>(DUMMY_LENDING_CHAIN_IDS);

export function isTestnetChainId(chainId: string): boolean {
  return TESTNET_CHAIN_IDS.has(chainId);
}

interface TokenDef {
  symbol: string;
  name: string;
  address: string;
}

const STANDARD_TOKENS: TokenDef[] = [
  { symbol: 'USDC', name: 'USD Coin', address: '0x3b8bA5DF76689f704d4C16f2011223AEf525F288' },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x64B02aA7C8befBc814505BB94Ea616bCA1B381d9' },
  { symbol: 'USDT', name: 'Tether USD', address: '0x2591d4C1760CDa6FC4fb51eAc1c4B0998D1F295A' },
  { symbol: 'WETH', name: 'Wrapped Ether', address: '0x7946dd86eE310D0aC16804A37787289Fa5b88A8A' },
  { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x9b2a2754a9182fD65360E23afCDf3BeFF51796E9' },
];

const OP_SEPOLIA_TOKENS: TokenDef[] = [
  { symbol: 'USDC', name: 'USD Coin', address: '0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69' },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: '0xc30f1Ce05d1434d484E9A47283aA925fc8A8699a' },
  { symbol: 'USDT', name: 'Tether USD', address: '0xc04d2869665Be874881133943523723Be5782720' },
  ...STANDARD_TOKENS.filter((t) => !['USDC', 'DAI', 'USDT'].includes(t.symbol)),
];

function tokensForChain(chainId: string): TokenDef[] {
  return chainId === '11155420' ? OP_SEPOLIA_TOKENS : STANDARD_TOKENS;
}

function collateralRow(
  chainId: string,
  token: TokenDef,
  depositRate = 2,
): OneDeltaMarketRow {
  const marketUid = `DUMMY_LENDING:${chainId}:${token.address}`;
  return {
    marketUid,
    depositRate,
    variableBorrowRate: 0,
    utilization: 0.5,
    totalDepositsUsd: 0,
    totalLiquidityUsd: 0,
    borrowLiquidityUsd: 0,
    collateralFactor: 1,
    intrinsicYield: null,
    underlyingInfo: {
      asset: {
        name: token.name,
        symbol: token.symbol,
        address: token.address,
        chainId,
        logoURI: null,
        decimals: 18,
        assetGroup: token.symbol,
        intrinsicYield: null,
      },
      prices: {
        priceUsd: 1,
      },
      tokenRisk: { riskLabel: 'low', riskScore: 1 },
      oraclePrice: { oraclePrice: 1, oraclePriceUsd: 1 },
    },
  };
}

function configForChain(chainId: string, label: string): OneDeltaConfig {
  return {
    lenderKey: 'DUMMY_LENDING',
    chainId,
    configId: chainId,
    label,
    category: 'test',
    collaterals: tokensForChain(chainId).map((token) => collateralRow(chainId, token)),
    borrowables: [],
    configRiskLabel: 'low',
    configRiskScore: 1,
  };
}

/** Dummy-lending market configs for all supported testnets. */
export const DUMMY_LENDING_CONFIGS: OneDeltaConfig[] = [
  configForChain('84532', 'Dummy Lending · Base Sepolia'),
  configForChain('11155111', 'Dummy Lending · Sepolia'),
  configForChain('11155420', 'Dummy Lending · Optimism Sepolia'),
];

/** @deprecated Use DUMMY_LENDING_CONFIGS — kept for single-config imports. */
export const DUMMY_LENDING_CONFIG = DUMMY_LENDING_CONFIGS[0];
