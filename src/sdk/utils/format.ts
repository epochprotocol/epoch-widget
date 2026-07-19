export function formatAmount(amount: bigint, decimals: number, maxFrac = 6): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  if (remainder === 0n) return whole.toString();
  const fracStr = remainder.toString().padStart(decimals, '0').replace(/0+$/, '');
  const trimmed = fracStr.slice(0, Math.min(maxFrac, fracStr.length));
  return `${whole}.${trimmed}`;
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function trimAmountInput(s: string): string {
  if (!s.includes('.')) return s;
  return s.replace(/\.?0+$/, '') || '0';
}

export function formatBalancePortionForInput(
  balance: bigint,
  numerator: number,
  denominator: number,
  decimals: number,
): string {
  if (denominator <= 0) return '0';
  const part = (balance * BigInt(numerator)) / BigInt(denominator);
  return trimAmountInput(formatAmount(part, decimals, Math.min(18, decimals)));
}

/** Same as formatAmount but allows internal callers to share one impl. */
export function formatRawAmount(amount: bigint, decimals: number, maxFrac = 6): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  if (remainder === 0n) return whole.toString();
  const fracStr = remainder
    .toString()
    .padStart(decimals, '0')
    .replace(/0+$/, '')
    .slice(0, Math.min(maxFrac, decimals));
  return `${whole}.${fracStr}`;
}

export function formatTokenIn(raw: string, decimals: number): string {
  try {
    if (/^\d+$/.test(raw)) {
      return formatRawAmount(BigInt(raw), decimals);
    }
    return raw;
  } catch {
    return raw;
  }
}
