import type { CSSProperties } from 'react';
import { t } from '../theme';
import { Avatar } from './Avatar';

interface TokenChainPillProps {
  tokenSymbol: string;
  tokenLogoURI?: string;
  chainName: string;
  chainLogoURI?: string;
  /** Click handler. When omitted the pill renders in read-only mode. */
  onClick?: () => void;
  /** Optional aria-label for interactive mode. */
  ariaLabel?: string;
}

/**
 * Compact token+chain pill used inside the pay/receive cards.
 *
 * When `onClick` is provided the pill is a real button (hover + chevron).
 * Otherwise it renders as a non-interactive tag — visually highlighted as a
 * "locked" selection so the user understands it's the destination target.
 */
export function TokenChainPill({
  tokenSymbol,
  tokenLogoURI,
  chainName,
  chainLogoURI,
  onClick,
  ariaLabel,
}: TokenChainPillProps) {
  const readOnly = !onClick;

  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 9px 3px 3px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 600,
    color: t.text,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    lineHeight: 1,
    backgroundColor: t.bg,
    border: `1px solid ${readOnly ? `${t.primary}33` : t.border}`,
    boxShadow: readOnly
      ? `0 0 0 2px ${t.primary}14`
      : '0 1px 3px rgba(0,0,0,0.06)',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    cursor: readOnly ? 'default' : 'pointer',
  };

  const content = (
    <>
      {/* Token logo with chain badge overlay */}
      <div style={{ position: 'relative', width: '22px', height: '22px', flexShrink: 0 }}>
        <Avatar src={tokenLogoURI} label={tokenSymbol} size={22} />
        {chainName && (
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-3px',
              borderRadius: '50%',
              border: `1.5px solid ${t.bg}`,
              lineHeight: 0,
            }}
          >
            <Avatar src={chainLogoURI} label={chainName} size={11} />
          </div>
        )}
      </div>

      {/* Symbol + chain text — flex-grow so the trailing icon pins to the edge */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1px',
          flex: '1 1 auto',
          minWidth: 0,
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 700, color: t.text, lineHeight: 1 }}>
          {tokenSymbol}
        </span>
        <span style={{ fontSize: '10px', color: t.textMuted, lineHeight: 1, fontWeight: 500 }}>
          {chainName}
        </span>
      </div>

      {/* Trailing icon slot — fixed-size box keeps the glyph locked to the same spot
          across chevron/lock modes and regardless of text width changes. */}
      <div
        style={{
          width: '14px',
          height: '14px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: readOnly ? t.primary : t.textMuted,
        }}
        aria-hidden="true"
      >
        {readOnly ? (
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path
              d="M5 7V5a3 3 0 0 1 6 0v2M4 7h8v6H4z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </>
  );

  if (readOnly) {
    return (
      <div
        style={baseStyle}
        role="img"
        aria-label={`${tokenSymbol} on ${chainName} (destination, not changeable)`}
        title={`${tokenSymbol} on ${chainName} — destination`}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = t.primary;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${t.primary}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = t.border;
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
      }}
    >
      {content}
    </button>
  );
}
