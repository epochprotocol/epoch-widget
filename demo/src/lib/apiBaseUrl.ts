export function getApiBaseUrl(): string {
  return import.meta.env.VITE_EPOCH_API_BASE_URL ?? import.meta.env.VITE_ALLOCATOR_URL ?? 'http://0.0.0.0:3000';
}
