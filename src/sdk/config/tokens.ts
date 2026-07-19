import type { EpochToken } from "../types.js";

const TW =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains";

const TOKEN_LOGOS: Record<string, string> = {
  USDC: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  USDT: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
  DAI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
  WETH: `${TW}/ethereum/info/logo.png`,
};

function tokenLogo(symbol: string): string | undefined {
  return TOKEN_LOGOS[symbol.toUpperCase()];
}

export const EPOCH_SUPPORTED_TOKENS: EpochToken[] = [
  // Ethereum
  {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    chainId: 1,
    logoURI: tokenLogo("USDC"),
  },
  {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    chainId: 1,
    logoURI: tokenLogo("USDT"),
  },
  {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    chainId: 1,
    logoURI: tokenLogo("DAI"),
  },
  {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    chainId: 1,
    logoURI: tokenLogo("WETH"),
  },
  // Base
  {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    chainId: 8453,
    logoURI: tokenLogo("USDC"),
  },
  {
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    chainId: 8453,
    logoURI: tokenLogo("DAI"),
  },
  {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    chainId: 8453,
    logoURI: tokenLogo("WETH"),
  },
  // Optimism
  {
    address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    chainId: 10,
    logoURI: tokenLogo("USDC"),
  },
  {
    address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    chainId: 10,
    logoURI: tokenLogo("USDT"),
  },
  {
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    chainId: 10,
    logoURI: tokenLogo("DAI"),
  },
  {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    chainId: 10,
    logoURI: tokenLogo("WETH"),
  },
  // Polygon
  {
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    chainId: 137,
    logoURI: tokenLogo("USDC"),
  },
  {
    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    chainId: 137,
    logoURI: tokenLogo("USDT"),
  },
  {
    address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    chainId: 137,
    logoURI: tokenLogo("DAI"),
  },
  {
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    chainId: 137,
    logoURI: tokenLogo("WETH"),
  },
  // Arbitrum
  {
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    chainId: 42161,
    logoURI: tokenLogo("USDC"),
  },
  {
    address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    chainId: 42161,
    logoURI: tokenLogo("USDT"),
  },
  {
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    chainId: 42161,
    logoURI: tokenLogo("DAI"),
  },
];

export const EPOCH_TESTNET_TOKENS: EpochToken[] = [
  // Ethereum Sepolia
  {
    address: "0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 18,
    chainId: 11155111,
    logoURI: tokenLogo("USDC"),
  },
  {
    address: "0xc04d2869665Be874881133943523723Be5782720",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 18,
    chainId: 11155111,
    logoURI: tokenLogo("USDT"),
  },
  {
    address: "0xc30f1Ce05d1434d484E9A47283aA925fc8A8699a",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    chainId: 11155111,
    logoURI: tokenLogo("DAI"),
  },
  // Base Sepolia
  {
    address: "0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 18,
    chainId: 84532,
    logoURI: tokenLogo("USDC"),
  },
  {
    address: "0xc04d2869665Be874881133943523723Be5782720",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 18,
    chainId: 84532,
    logoURI: tokenLogo("USDT"),
  },
  {
    address: "0xc30f1Ce05d1434d484E9A47283aA925fc8A8699a",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    chainId: 84532,
    logoURI: tokenLogo("DAI"),
  },
  {
    address: "0x7946dd86eE310D0aC16804A37787289Fa5b88A8A",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    chainId: 84532,
    logoURI: tokenLogo("WETH"),
  },
  // Optimism Sepolia
  {
    address: "0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 18,
    chainId: 11155420,
    logoURI: tokenLogo("USDC"),
  },
  {
    address: "0xc04d2869665Be874881133943523723Be5782720",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 18,
    chainId: 11155420,
    logoURI: tokenLogo("USDT"),
  },
  {
    address: "0xc30f1Ce05d1434d484E9A47283aA925fc8A8699a",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    chainId: 11155420,
    logoURI: tokenLogo("DAI"),
  },
];

export const getEpochTokensByChainEnv = (
  chainId: number,
  useTestnet: boolean,
): EpochToken[] =>
  (useTestnet ? EPOCH_TESTNET_TOKENS : EPOCH_SUPPORTED_TOKENS).filter(
    (t) => t.chainId === chainId,
  );

export const getEpochTokensBySymbol = (
  symbol: string,
  useTestnet = false,
): EpochToken[] =>
  (useTestnet ? EPOCH_TESTNET_TOKENS : EPOCH_SUPPORTED_TOKENS).filter(
    (t) => t.symbol.toUpperCase() === symbol.toUpperCase(),
  );
