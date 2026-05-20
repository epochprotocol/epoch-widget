export function fmtAmount(amount: bigint, decimals: number): string {
  return (Number(amount) / 10 ** decimals).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });
}

export function shorten(s: string): string {
  if (s.length <= 12) return s;
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}
