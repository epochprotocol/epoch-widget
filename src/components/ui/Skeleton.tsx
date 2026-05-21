import type { CSSProperties } from 'react';

interface Props {
  width?: number | string;
  height?: number | string;
  radius?: string;
  style?: CSSProperties;
}

/**
 * Inline shimmer placeholder. The keyframe + utility class come from the
 * bundled `epoch-intent-widget/styles.css` — no JS-side keyframe injection.
 */
export function Skeleton({ width = '100%', height = 12, radius, style }: Props) {
  const base: CSSProperties = {
    display: 'inline-block',
    width,
    height,
    borderRadius: radius ?? '8px',
    backgroundImage:
      'linear-gradient(90deg, var(--epoch-color-surface) 25%, var(--epoch-color-surface-muted) 50%, var(--epoch-color-surface) 75%)',
    backgroundSize: '200% 100%',
  };
  return <span className="animate-shimmer" style={{ ...base, ...style }} aria-hidden="true" />;
}
