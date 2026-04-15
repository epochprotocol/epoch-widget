import { t } from '../theme';

interface AvatarProps {
  /** Image URL — when provided, rendered as an <img>. */
  src?: string;
  /** Fallback text (usually a 1-2 char initial) if `src` is absent. */
  label: string;
  size?: number;
}

/**
 * Small round avatar for chains/tokens. Falls back to a coloured circle with
 * the first 1–2 letters of the label.
 */
export function Avatar({ src, label, size = 24 }: AvatarProps) {
  const initial = label.slice(0, 2).toUpperCase();

  const base: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '999px',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${Math.round(size * 0.42)}px`,
    fontWeight: 600,
    backgroundColor: t.surface,
    color: t.textSecondary,
    border: `1px solid ${t.border}`,
    overflow: 'hidden',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  };

  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{ ...base, objectFit: 'cover' }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  return <span style={base}>{initial}</span>;
}
