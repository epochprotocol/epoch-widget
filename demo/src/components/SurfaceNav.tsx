import { Row } from './Row';
import type { DemoSurface } from '../types/surface';

interface Props {
  surface: DemoSurface;
  onChange: (s: DemoSurface) => void;
}

export function SurfaceNav({ surface, onChange }: Props) {
  const tab = (id: DemoSurface, label: string) => {
    const active = surface === id;
    return (
      <button
        type="button"
        onClick={() => onChange(id)}
        className={[
          'cursor-pointer rounded-full px-4 py-2 text-[0.8125rem] font-semibold',
          active ? 'bg-demo-accent text-white shadow-[0_1px_2px_rgba(15,23,42,0.12)]' : 'bg-demo-badge-bg text-demo-badge-text',
        ].join(' ')}
      >
        {label}
      </button>
    );
  };
  return (
    <Row className="flex-wrap gap-2">
      {tab('pay', 'Pay')}
      {tab('swap', 'Swap')}
      {tab('earn', 'Earn')}
    </Row>
  );
}
