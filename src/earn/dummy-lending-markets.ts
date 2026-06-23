import type { OneDeltaConfig } from '../types';

/** CREATE2 dummy-lending vault — same address on all testnet deployments. */
export const DUMMY_LENDING_VAULT_ADDRESS =
  '0xa73c1ae0e4e9116020dba0a419f91585d73459ee';

/** CREATE2 dummy-staking contract — same address on all testnet deployments. */
export const DUMMY_STAKING_CONTRACT_ADDRESS =
  '0xA25A981bc027E1f13aC70882a323B8B8EE880B9C';

/** EVM source chains for dummy-lending deposits (Miden is a separate funding path). */
export const DUMMY_LENDING_SOURCE_EVM_CHAIN_IDS = [
  84532, // Base Sepolia
  11155111, // Ethereum Sepolia
  11155420, // Optimism Sepolia
  80002, // Polygon Amoy
] as const;

/** Chains where dummy-lending earn markets can be selected (deposit destination). */
export const DUMMY_LENDING_DESTINATION_CHAIN_IDS = [
  84532, // Base Sepolia
  11155111, // Ethereum Sepolia
  11155420, // Optimism Sepolia
  80002, // Polygon Amoy
] as const;

/** @deprecated Alias — markets are deployed only on destination chains. */
export const DUMMY_LENDING_CHAIN_IDS = DUMMY_LENDING_DESTINATION_CHAIN_IDS;

const TW = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains';

const TOKEN_LOGOS: Record<string, string> = {
  USDC: `${TW}/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png`,
  WETH: `${TW}/ethereum/info/logo.png`,
  WBTC: `${TW}/bitcoin/info/logo.png`,
};

interface DummyTokenDef {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  depositRate: number;
  totalDepositsUsd: number;
}

/** Unified CREATE2 token addresses — identical on every dummy-lending chain. */
const DUMMY_TOKENS: DummyTokenDef[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69',
    decimals: 18,
    depositRate: 4.2,
    totalDepositsUsd: 1_250_000,
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0x7946dd86eE310D0aC16804A37787289Fa5b88A8A',
    decimals: 18,
    depositRate: 2.1,
    totalDepositsUsd: 2_100_000,
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x9b2a2754a9182fD65360E23afCDf3BeFF51796E9',
    decimals: 18,
    depositRate: 1.4,
    totalDepositsUsd: 890_000,
  },
  {
    symbol: 'PENGU',
    name: 'PENGU',
    address: '0xEA7dC9849206Ce73b11c465d37b85eC06B11Cf2C',
    decimals: 18,
    depositRate: 8.5,
    totalDepositsUsd: 45_000,
  },
  {
    symbol: 'OSWALD',
    name: 'OSWALD',
    address: '0xB588418c0f90F07Bc9587d0050845a90C23C7502',
    decimals: 18,
    depositRate: 7.2,
    totalDepositsUsd: 38_000,
  },
  {
    symbol: 'KICK',
    name: 'Kick Buttowski',
    address: '0x512Ee6Bd7A4be5Ba4796F15Df080c4D0F89a38eD',
    decimals: 18,
    depositRate: 9.1,
    totalDepositsUsd: 52_000,
  },
  {
    symbol: 'FERB',
    name: 'Ferb',
    address: '0x145e03A80c19ad1b9d0429d06b6d52707de724A0',
    decimals: 18,
    depositRate: 6.8,
    totalDepositsUsd: 41_000,
  },
];

/** @deprecated Retired CREATE2 USDC — must never surface in dummy-lending UI or paths. */
export const DEPRECATED_DUMMY_LENDING_USDC_ADDRESS =
  '0x3b8bA5DF76689f704d4C16f2011223AEf525F288';

/** Lowercase addresses allowed for dummy-lending (source EVM picker + markets). */
export const DUMMY_LENDING_SUPPORTED_ADDRESSES: readonly string[] = DUMMY_TOKENS.map(
  (t) => t.address.toLowerCase(),
);

function buildMarket(token: DummyTokenDef, chainId: string) {
  const marketUid = `DUMMY_LENDING:${chainId}:${token.address.toLowerCase()}`;
  const logoURI = TOKEN_LOGOS[token.symbol];
  return {
    marketUid,
    depositRate: token.depositRate,
    utilization: 0.42,
    borrowFactor: 1,
    totalDebtUsd: token.totalDepositsUsd * 0.35,
    intrinsicYield: null,
    totalLiquidity: token.totalDepositsUsd * 0.65,
    underlyingInfo: {
      asset: {
        name: token.name,
        props: null,
        symbol: token.symbol,
        address: token.address,
        chainId,
        logoURI,
        decimals: token.decimals,
        assetGroup: token.symbol,
        currencyId: `${token.name}::${token.symbol}`,
        intrinsicYield: null,
      },
      prices: {
        priceTs: new Date().toISOString(),
        priceUsd: token.symbol === 'USDC' ? 1 : 0,
        priceTs24h: new Date().toISOString(),
        priceUsd24h: token.symbol === 'USDC' ? 1 : 0,
      },
      tokenRisk: { riskLabel: 'low', riskScore: 2 },
      oraclePrice: {
        oraclePrice: token.symbol === 'USDC' ? 1 : 0,
        oraclePriceUsd: token.symbol === 'USDC' ? 1 : 0,
      },
    },
    borrowLiquidity: 0,
    collateralFactor: 0.75,
    stableBorrowRate: 0,
    totalDepositsUsd: token.totalDepositsUsd,
    totalLiquidityUsd: token.totalDepositsUsd * 0.65,
    borrowLiquidityUsd: 0,
    variableBorrowRate: 0,
    borrowCollateralFactor: 0,
  };
}

function buildConfigForChain(chainId: number): OneDeltaConfig {
  const chainIdStr = String(chainId);
  const collaterals = DUMMY_TOKENS.map((t) => buildMarket(t, chainIdStr));
  return {
    lenderKey: 'DUMMY_LENDING',
    chainId: chainIdStr,
    configId: '0',
    label: 'Dummy Lending',
    category: '0',
    collaterals,
    borrowables: [],
    chainRiskScore: 2,
    lenderRiskScore: 1,
    maxTokenRiskScore: 2,
    configRiskScore: 2,
    configRiskLabel: 'low',
    tokenRisks: collaterals.map((c) => ({
      marketUid: c.marketUid,
      isCollateral: true,
      tokenRiskLabel: 'low',
      tokenRiskScore: 2,
      oracleRiskScore: 1,
      tokenRiskScores: {
        label: c.underlyingInfo.asset.name,
        source: 'whitelist',
        symbol: null,
        category: null,
        riskScore: 2,
        assetGroup: c.underlyingInfo.asset.symbol,
      },
      underlyingAddress: c.underlyingInfo.asset.address,
    })),
  };
}

/** Hardcoded dummy-lending earn configs for all testnet deployments. */
export const DUMMY_LENDING_CONFIGS: OneDeltaConfig[] = DUMMY_LENDING_CHAIN_IDS.map(
  buildConfigForChain,
);

export function isTestnetChainId(chainId: string | number): boolean {
  const id = typeof chainId === 'string' ? Number(chainId) : chainId;
  return (DUMMY_LENDING_CHAIN_IDS as readonly number[]).includes(id);
}
