import type { CSSProperties } from 'react';
import { t } from '../theme';

interface ShimmerProps {
  /** Width of the shimmer bar. Default: "120px". */
  width?: string;
  /** Height of the shimmer bar. Default: "28px". */
  height?: string;
  /** Border radius. Default: "8px". */
  radius?: string;
}

/**
 * Animated shimmer / skeleton placeholder used while a quote is loading.
 * Pure CSS animation — no extra dependencies.
 */
export function Shimmer({ width = '120px', height = '28px', radius = '8px' }: ShimmerProps) {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: radius,
    background: `linear-gradient(
      90deg,
      ${t.surface} 25%,
      ${t.border} 50%,
      ${t.surface} 75%
    )`,
    backgroundSize: '200% 100%',
    animation: 'epoch-shimmer 1.5s ease-in-out infinite',
  };

  return <div style={style} aria-hidden="true" />;
}

// Inject keyframes for the shimmer (idempotent)
let _shimmerInjected = false;
export function injectShimmerKeyframes(): void {
  if (_shimmerInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = `
    @keyframes epoch-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  el.setAttribute('data-epoch-widget', 'shimmer');
  document.head.appendChild(el);
  _shimmerInjected = true;
}
