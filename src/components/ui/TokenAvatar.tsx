import { useState, type CSSProperties } from 'react';
import { t } from '../../theme';

interface Props {
  src?: string | null;
  symbol: string;
  size?: number;
  /** Optional small chain badge in the corner. */
  chainSrc?: string | null;
  chainAlt?: string;
  style?: CSSProperties;
}

const ACCENT_PALETTE = ['#5b6cff', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#22c55e'];

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
  return ACCENT_PALETTE[Math.abs(h) % ACCENT_PALETTE.length];
}

export function TokenAvatar({ src, symbol, size = 32, chainSrc, chainAlt, style }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = !!src && !imgFailed;
  const bg = colorFor(symbol);

  const root: CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
    flexShrink: 0,
    ...style,
  };

  const avatar: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: showImg ? t.surfaceRaised : bg,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: Math.max(10, Math.round(size * 0.36)),
    fontWeight: 700,
    letterSpacing: '0.01em',
    overflow: 'hidden',
    border: `1px solid ${t.border}`,
    boxSizing: 'border-box',
  };

  const badgeSize = Math.max(12, Math.round(size * 0.4));
  const badge: CSSProperties = {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: badgeSize,
    height: badgeSize,
    borderRadius: '50%',
    background: t.bg,
    border: `1.5px solid ${t.bg}`,
    overflow: 'hidden',
    boxShadow: '0 0 0 1px var(--epoch-color-border)',
  };

  return (
    <span style={root}>
      <span style={avatar}>
        {showImg ? (
          <img
            src={src as string}
            alt={symbol}
            width={size}
            height={size}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          symbol.slice(0, 3).toUpperCase()
        )}
      </span>
      {chainSrc ? (
        <span style={badge}>
          <img src={chainSrc} alt={chainAlt ?? 'chain'} width={badgeSize} height={badgeSize} style={{ display: 'block' }} />
        </span>
      ) : null}
    </span>
  );
}
