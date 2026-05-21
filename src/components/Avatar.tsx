import type { CSSProperties } from 'react';

interface AvatarProps {
  /** Image URL — when provided, rendered as an <img>. */
  src?: string;
  /** Fallback text (usually a 1-2 char initial) if `src` is absent. */
  label: string;
  size?: number;
}

const BASE_CLASSES =
  'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface font-semibold leading-none -tracking-[0.02em] text-fg-secondary';

/**
 * Small round avatar for chains/tokens. Falls back to a coloured circle with
 * the first 1–2 letters of the label.
 *
 * Width / height / font-size scale with `size`, so we keep those as inline
 * styles — Tailwind utilities cover the rest.
 */
export function Avatar({ src, label, size = 24 }: AvatarProps) {
  const sizeStyle: CSSProperties = {
    width: size,
    height: size,
    fontSize: `${Math.round(size * 0.42)}px`,
  };

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${BASE_CLASSES} object-cover`}
        style={sizeStyle}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  return (
    <span className={BASE_CLASSES} style={sizeStyle}>
      {label.slice(0, 2).toUpperCase()}
    </span>
  );
}
