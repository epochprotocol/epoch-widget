import type { EpochChain, EpochToken } from './types';

export const EPOCH_SUPPORTED_CHAINS: EpochChain[] = [
  { id: 137, name: 'Polygon', network: 'polygon' },
  { id: 10, name: 'Optimism', network: 'optimism' },
  { id: 8453, name: 'Base', network: 'base' },
  { id: 42161, name: 'Arbitrum', network: 'arbitrum' },
];

export const EPOCH_TESTNET_CHAINS: EpochChain[] = [
  { id: 84532, name: 'Base Sepolia', network: 'base-sepolia' },
  { id: 11155111, name: 'Ethereum Sepolia', network: 'sepolia' },
];

export const EPOCH_SUPPORTED_TOKENS: EpochToken[] = [
  // Base
  { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', name: 'USD Coin', decimals: 6, chainId: 8453 },
  { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, chainId: 8453 },
  { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, chainId: 8453 },
  // Optimism
  { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', symbol: 'USDC', name: 'USD Coin', decimals: 6, chainId: 10 },
  { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', symbol: 'USDT', name: 'Tether USD', decimals: 6, chainId: 10 },
  { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, chainId: 10 },
  { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, chainId: 10 },
  // Polygon
  { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', symbol: 'USDC', name: 'USD Coin', decimals: 6, chainId: 137 },
  { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether USD', decimals: 6, chainId: 137 },
  { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, chainId: 137 },
  { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, chainId: 137 },
  // Arbitrum
  { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', name: 'USD Coin', decimals: 6, chainId: 42161 },
  { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', name: 'Tether USD', decimals: 6, chainId: 42161 },
  { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, chainId: 42161 },
];

export const EPOCH_TESTNET_TOKENS: EpochToken[] = [
  { address: '0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69', symbol: 'USDC', name: 'USD Coin', decimals: 18, chainId: 11155111 },
  { address: '0xc04d2869665Be874881133943523723Be5782720', symbol: 'USDT', name: 'Tether USD', decimals: 18, chainId: 11155111 },
  { address: '0xc30f1Ce05d1434d484E9A47283aA925fc8A8699a', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, chainId: 11155111 },
];

export const getEpochChains = (useTestnet: boolean): EpochChain[] =>
  useTestnet ? EPOCH_TESTNET_CHAINS : EPOCH_SUPPORTED_CHAINS;

export const getEpochTokensByChainEnv = (chainId: number, useTestnet: boolean): EpochToken[] =>
  (useTestnet ? EPOCH_TESTNET_TOKENS : EPOCH_SUPPORTED_TOKENS).filter(t => t.chainId === chainId);

export const getEpochTokensBySymbol = (symbol: string, useTestnet = false): EpochToken[] =>
  (useTestnet ? EPOCH_TESTNET_TOKENS : EPOCH_SUPPORTED_TOKENS)
    .filter(t => t.symbol.toUpperCase() === symbol.toUpperCase());

export const getEpochChainById = (chainId: number): EpochChain | undefined =>
  [...EPOCH_SUPPORTED_CHAINS, ...EPOCH_TESTNET_CHAINS].find(c => c.id === chainId);

export const getChainName = (chainId: number): string => {
  const all = [...EPOCH_SUPPORTED_CHAINS, ...EPOCH_TESTNET_CHAINS];
  return all.find(c => c.id === chainId)?.name ?? `Chain ${chainId}`;
};
