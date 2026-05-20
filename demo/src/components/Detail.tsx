export function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.625rem] font-bold uppercase tracking-[0.05em] text-demo-text-faint">{label}</div>
      <div className="mt-0.5 font-medium text-demo-text">{value}</div>
    </div>
  );
}
