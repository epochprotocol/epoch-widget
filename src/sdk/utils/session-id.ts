/** Generate a fresh session ID. Uses `crypto.randomUUID()` when available. */
export function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `epoch-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}
