import type { ApiConfig } from './types';

/** Default smallocator / SIO entrypoint for local testnet dev. */
export const DEFAULT_TESTNET_API_BASE_URL = 'http://localhost:3000';

/** Default dummy-lending positions service for local testnet dev. */
export const DEFAULT_TESTNET_POSITIONS_BASE_URL = 'http://localhost:4024';

/**
 * Pick API endpoints for the active network. Mainnet uses `api` as passed;
 * testnet defaults to local smallocator (3000) and dummy-lending positions (4024)
 * unless `testnetBaseUrl` / `testnetPositionsBaseUrl` are set.
 */
export function resolveApiForNetwork(
  api: ApiConfig,
  network: 'mainnet' | 'testnet',
): ApiConfig {
  if (network === 'mainnet') {
    return api;
  }
  return {
    ...api,
    baseUrl: api.testnetBaseUrl ?? DEFAULT_TESTNET_API_BASE_URL,
    positionsBaseUrl: api.testnetPositionsBaseUrl ?? DEFAULT_TESTNET_POSITIONS_BASE_URL,
  };
}
