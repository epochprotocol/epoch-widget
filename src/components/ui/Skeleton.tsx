import type { CSSProperties } from 'react';
import { t } from '../../theme';

interface Props {
  width?: number | string;
  height?: number | string;
  radius?: string;
  style?: CSSProperties;
}

let _shimmerInjected = false;
function ensureShimmerKeyframes() {
  if (_shimmerInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes epoch-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  style.setAttribute('data-epoch-widget', 'shimmer');
  document.head.appendChild(style);
  _shimmerInjected = true;
}

export function Skeleton({ width = '100%', height = 12, radius, style }: Props) {
  if (typeof window !== 'undefined') ensureShimmerKeyframes();
  const base: CSSProperties = {
    display: 'inline-block',
    width,
    height,
    borderRadius: radius ?? '8px',
    background: `linear-gradient(90deg, ${t.surface} 25%, ${t.surfaceMuted} 50%, ${t.surface} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'epoch-shimmer 1.4s ease-in-out infinite',
  };
  return <span style={{ ...base, ...style }} aria-hidden="true" />;
}
