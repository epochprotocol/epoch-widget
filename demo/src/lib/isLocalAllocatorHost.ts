/** True when `baseUrl` points at a loopback host (typical local smallocator). */
export function isLocalAllocatorHost(baseUrl: string): boolean {
  try {
    const { hostname } = new URL(baseUrl);
    const h = hostname.toLowerCase();
    return h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0';
  } catch {
    return false;
  }
}
