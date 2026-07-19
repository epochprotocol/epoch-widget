import type { EpochChain } from "../types.js";

const TW =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains";

const CHAIN_LOGOS: Record<number, string> = {
  137: `${TW}/polygon/info/logo.png`,
  10: `${TW}/optimism/info/logo.png`,
  8453: "https://raw.githubusercontent.com/base-org/brand-kit/001c0e9b40b8090405a31c0096235e0fcf3cb74d/logo/symbol/Base_Symbol_Blue.svg",
  42161: `${TW}/arbitrum/info/logo.png`,
  1: `${TW}/ethereum/info/logo.png`,
  84532:
    "https://raw.githubusercontent.com/base-org/brand-kit/001c0e9b40b8090405a31c0096235e0fcf3cb74d/logo/symbol/Base_Symbol_Blue.svg",
  11155111: `${TW}/ethereum/info/logo.png`,
  11155420: `${TW}/optimism/info/logo.png`,
};

function chainLogo(chainId: number): string | undefined {
  return CHAIN_LOGOS[chainId];
}

export const EPOCH_SUPPORTED_CHAINS: EpochChain[] = [
  { id: 1, name: "Ethereum", network: "mainnet", logoURI: chainLogo(1) },
  { id: 137, name: "Polygon", network: "polygon", logoURI: chainLogo(137) },
  { id: 10, name: "Optimism", network: "optimism", logoURI: chainLogo(10) },
  { id: 8453, name: "Base", network: "base", logoURI: chainLogo(8453) },
  {
    id: 42161,
    name: "Arbitrum",
    network: "arbitrum",
    logoURI: chainLogo(42161),
  },
];

export const EPOCH_TESTNET_CHAINS: EpochChain[] = [
  {
    id: 84532,
    name: "Base Sepolia",
    network: "base-sepolia",
    logoURI: chainLogo(84532),
  },
  {
    id: 11155111,
    name: "Ethereum Sepolia",
    network: "sepolia",
    logoURI: chainLogo(11155111),
  },
  {
    id: 11155420,
    name: "Optimism Sepolia",
    network: "optimism-sepolia",
    logoURI: chainLogo(11155420),
  },
];

export const getEpochChains = (useTestnet: boolean): EpochChain[] =>
  useTestnet ? EPOCH_TESTNET_CHAINS : EPOCH_SUPPORTED_CHAINS;

export const getEpochChainById = (chainId: number): EpochChain | undefined =>
  [...EPOCH_SUPPORTED_CHAINS, ...EPOCH_TESTNET_CHAINS].find(
    (c) => c.id === chainId,
  );

export const getChainName = (chainId: number): string => {
  const all = [...EPOCH_SUPPORTED_CHAINS, ...EPOCH_TESTNET_CHAINS];
  return all.find((c) => c.id === chainId)?.name ?? `Chain ${chainId}`;
};
