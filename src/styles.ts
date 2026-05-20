import type { CSSProperties } from 'react';
import { t } from './theme';

// ---------------------------------------------------------------------------
// Style objects — clean, minimal pay-widget design
//
// Every value references CSS custom properties from theme.ts so consumers
// can rebrand with a `theme` prop. For full structural control, consumers
// pass `classNames` and these styles are skipped entirely.
// ---------------------------------------------------------------------------

export const s = {
  // ---- Layout ---------------------------------------------------------------

  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: t.overlay,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    animation: 'epoch-overlay-in 0.2s ease-out',
  } satisfies CSSProperties,

  container: {
    backgroundColor: t.bg,
    borderRadius: t.radiusLg,
    boxShadow: t.shadowLg,
    border: `1px solid ${t.border}`,
    width: '100%',
    maxWidth: '420px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: t.font,
    fontSize: '14px',
    color: t.text,
    animation: 'epoch-modal-in 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
  } satisfies CSSProperties,

  header: {
    padding: '20px 24px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } satisfies CSSProperties,

  headerTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: t.text,
    letterSpacing: '-0.01em',
  } satisfies CSSProperties,

  closeBtn: {
    all: 'unset',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: t.textMuted,
    transition: 'background 0.15s, color 0.15s',
    flexShrink: 0,
  } satisfies CSSProperties,

  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: 0,
  } satisfies CSSProperties,

  footer: {
    padding: '16px 24px 20px',
  } satisfies CSSProperties,

  // ---- Receive card (top) ---------------------------------------------------

  receiveCard: {
    padding: '24px',
    borderRadius: t.radiusMd,
    backgroundColor: t.surface,
    border: `1px solid ${t.border}`,
    textAlign: 'center',
  } satisfies CSSProperties,

  receiveAmount: {
    fontSize: '32px',
    fontWeight: 700,
    color: t.text,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    margin: 0,
  } satisfies CSSProperties,

  receiveLabel: {
    fontSize: '13px',
    color: t.textMuted,
    marginTop: '6px',
  } satisfies CSSProperties,

  // ---- Pay card (bottom) ----------------------------------------------------

  payCard: {
    padding: '16px 20px',
    borderRadius: t.radiusMd,
    border: `1px solid ${t.border}`,
    backgroundColor: t.bg,
    boxShadow: t.shadowSm,
  } satisfies CSSProperties,

  payHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  } satisfies CSSProperties,

  payLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: t.textMuted,
  } satisfies CSSProperties,

  payAmountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  } satisfies CSSProperties,

  payAmount: {
    fontSize: '24px',
    fontWeight: 700,
    color: t.text,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    margin: 0,
    flex: 1,
    minWidth: 0,
  } satisfies CSSProperties,

  payMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    fontSize: '12px',
    color: t.textMuted,
  } satisfies CSSProperties,

  // ---- Token selector pill --------------------------------------------------

  tokenPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '999px',
    border: `1px solid ${t.border}`,
    backgroundColor: t.surfaceRaised,
    boxShadow: t.shadowSm,
    cursor: 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
    fontSize: '14px',
    fontWeight: 600,
    color: t.text,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  } satisfies CSSProperties,

  tokenPillChain: {
    fontSize: '11px',
    fontWeight: 500,
    color: t.textMuted,
  } satisfies CSSProperties,

  chevron: {
    width: '16px',
    height: '16px',
    color: t.textMuted,
    flexShrink: 0,
  } satisfies CSSProperties,

  // ---- Button ---------------------------------------------------------------

  button: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: t.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: t.radiusSm,
    fontSize: '15px',
    fontWeight: 650,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: t.shadowMd,
    transition: 'background-color 0.15s, box-shadow 0.15s, transform 0.1s',
    fontFamily: 'inherit',
    letterSpacing: '-0.005em',
  } satisfies CSSProperties,

  buttonDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  } satisfies CSSProperties,

  // ---- Banners --------------------------------------------------------------

  banner: {
    padding: '12px 14px',
    borderRadius: t.radiusSm,
    fontSize: '13px',
    lineHeight: 1.5,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  } satisfies CSSProperties,

  // ---- Progress -------------------------------------------------------------

  progressContainer: {
    padding: '16px',
    borderRadius: t.radiusSm,
    backgroundColor: t.surface,
    border: `1px solid ${t.border}`,
  } satisfies CSSProperties,

  progressTitle: {
    margin: '0 0 12px',
    fontSize: '13px',
    fontWeight: 600,
    color: t.text,
  } satisfies CSSProperties,

  progressStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  } satisfies CSSProperties,

  progressConnector: {
    width: '2px',
    height: '12px',
    marginLeft: '10px',
    backgroundColor: t.border,
  } satisfies CSSProperties,

  progressConnectorActive: {
    width: '2px',
    height: '12px',
    marginLeft: '10px',
    backgroundColor: t.success,
  } satisfies CSSProperties,

  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: t.border,
    borderRadius: '999px',
    overflow: 'hidden',
    marginTop: '6px',
  } satisfies CSSProperties,

  // ---- Misc -----------------------------------------------------------------

  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid currentColor',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'epoch-spin 0.8s linear infinite',
    flexShrink: 0,
  } satisfies CSSProperties,

  networkSwitchBtn: {
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: 'transparent',
    border: `1px solid ${t.error}`,
    borderRadius: t.radiusSm,
    color: t.error,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    fontFamily: 'inherit',
    transition: 'background-color 0.15s',
  } satisfies CSSProperties,

  powered: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: t.textMuted,
    opacity: 0.6,
    letterSpacing: '0.01em',
  } satisfies CSSProperties,

  // ---- Source picker (dropdowns) --------------------------------------------

  pickerGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } satisfies CSSProperties,

  pickerLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: t.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  } satisfies CSSProperties,

  balanceText: {
    fontSize: '12px',
    fontWeight: 500,
  } satisfies CSSProperties,
} as const;
