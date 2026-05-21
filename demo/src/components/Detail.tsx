export function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-fg-muted">{label}</div>
      <div className="mt-0.5 font-medium text-fg">{value}</div>
    </div>
  );
}
