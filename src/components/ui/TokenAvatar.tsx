import { useState, type CSSProperties } from 'react';

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
  const fallbackBg = colorFor(symbol);

  const avatarStyle: CSSProperties = {
    width: size,
    height: size,
    fontSize: Math.max(10, Math.round(size * 0.36)),
    background: showImg ? 'var(--epoch-color-surface-raised)' : fallbackBg,
  };

  const badgeSize = Math.max(12, Math.round(size * 0.4));
  const badgeStyle: CSSProperties = {
    width: badgeSize,
    height: badgeSize,
  };

  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size, ...style }}
    >
      <span
        className="box-border flex items-center justify-center overflow-hidden rounded-full border border-line font-bold tracking-[0.01em] text-white"
        style={avatarStyle}
      >
        {showImg ? (
          <img
            src={src as string}
            alt={symbol}
            width={size}
            height={size}
            className="block h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          symbol.slice(0, 3).toUpperCase()
        )}
      </span>
      {chainSrc ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 overflow-hidden rounded-full border-[1.5px] border-canvas bg-canvas shadow-[0_0_0_1px_var(--epoch-color-border)]"
          style={badgeStyle}
        >
          <img
            src={chainSrc}
            alt={chainAlt ?? 'chain'}
            width={badgeSize}
            height={badgeSize}
            className="block"
          />
        </span>
      ) : null}
    </span>
  );
}
