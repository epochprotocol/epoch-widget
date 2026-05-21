import type { CSSProperties } from 'react';

interface ShimmerProps {
  /** Width of the shimmer bar. Default: `120px`. */
  width?: string;
  /** Height of the shimmer bar. Default: `28px`. */
  height?: string;
  /** Border radius. Default: `8px`. */
  radius?: string;
}

/**
 * Animated shimmer / skeleton placeholder used while a quote is loading.
 *
 * The gradient is composed from `--epoch-color-surface` and
 * `--epoch-color-border` so the placeholder picks up consumer theme overrides
 * automatically. Animation comes from the `animate-shimmer` utility defined in
 * the library's Tailwind entry CSS.
 */
export function Shimmer({ width = '120px', height = '28px', radius = '8px' }: ShimmerProps) {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: radius,
    backgroundImage:
      'linear-gradient(90deg, var(--epoch-color-surface) 25%, var(--epoch-color-border) 50%, var(--epoch-color-surface) 75%)',
    backgroundSize: '200% 100%',
  };
  return <div className="animate-shimmer" style={style} aria-hidden="true" />;
}

/**
 * @deprecated Keyframes now ship in `epoch-intent-widget/styles.css`. This
 * function is a no-op kept only for one release cycle to avoid breaking
 * consumers that import it directly.
 */
export function injectShimmerKeyframes(): void {
  /* no-op: keyframes are in the bundled CSS */
}
