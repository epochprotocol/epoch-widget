import { resolveEpochApiBaseUrl } from "../config/miden-mainnet";

export function getApiBaseUrl(): string {
  return resolveEpochApiBaseUrl(import.meta.env);
}
