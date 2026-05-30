import { type InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  hint?: string;
  onChange: (next: string) => void;
}

export function EditableField({ label, hint, onChange, value, ...rest }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-fg-muted">
        {label}
      </span>
      <input
        {...rest}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-sm border border-line bg-canvas px-2.5 py-1.5 text-[13px] font-medium text-fg outline-none transition-colors focus:border-primary"
      />
      {hint ? (
        <span className="text-[10px] text-fg-muted">{hint}</span>
      ) : null}
    </label>
  );
}
