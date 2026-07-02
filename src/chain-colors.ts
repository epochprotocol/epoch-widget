/** Brand colors for chain filter dots and token-picker chain badges. */
export const CHAIN_DOT: Record<number, string> = {
  1: '#627eea', // Ethereum
  10: '#ff0420', // Optimism
  137: '#8247e5', // Polygon
  8453: '#0052ff', // Base
  42161: '#28a0f0', // Arbitrum
  84532: '#0052ff', // Base Sepolia
  11155111: '#627eea', // Ethereum Sepolia
  11155420: '#ff0420', // Optimism Sepolia
};

export function chainDotColor(chainId: number): string {
  return CHAIN_DOT[chainId] ?? 'var(--epoch-color-primary)';
}
