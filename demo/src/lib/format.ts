export function fmtAmount(amount: bigint, decimals: number): string {
  return (Number(amount) / 10 ** decimals).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });
}
