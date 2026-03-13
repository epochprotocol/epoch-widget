import type { CSSProperties } from 'react';

export const defaultStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  } satisfies CSSProperties,

  container: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '28rem',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    color: '#111827',
  } satisfies CSSProperties,

  header: {
    padding: '1.25rem 1.5rem 1rem',
    borderBottom: '1px solid #e5e7eb',
  } satisfies CSSProperties,

  title: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#111827',
    lineHeight: 1.4,
  } satisfies CSSProperties,

  description: {
    margin: '0.375rem 0 0',
    fontSize: '0.8125rem',
    color: '#6b7280',
    lineHeight: 1.5,
  } satisfies CSSProperties,

  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    minHeight: 0,
  } satisfies CSSProperties,

  label: {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '0.375rem',
  } satisfies CSSProperties,

  select: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    backgroundColor: '#f9fafb',
    fontSize: '0.875rem',
    color: '#111827',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'auto',
  } satisfies CSSProperties,

  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    backgroundColor: '#f3f4f6',
    fontSize: '0.875rem',
    color: '#6b7280',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  alert: {
    padding: '0.625rem 0.875rem',
    borderRadius: '0.5rem',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    fontSize: '0.8125rem',
    color: '#1e40af',
    lineHeight: 1.5,
  } satisfies CSSProperties,

  alertDestructive: {
    padding: '0.625rem 0.875rem',
    borderRadius: '0.5rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    fontSize: '0.8125rem',
    color: '#991b1b',
    lineHeight: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
  } satisfies CSSProperties,

  balanceBox: {
    padding: '0.625rem 0.875rem',
    borderRadius: '0.5rem',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    fontSize: '0.8125rem',
  } satisfies CSSProperties,

  arrowSeparator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    fontSize: '1.25rem',
    padding: '0.25rem 0',
  } satisfies CSSProperties,

  progressContainer: {
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
  } satisfies CSSProperties,

  progressTitle: {
    margin: '0 0 1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#111827',
  } satisfies CSSProperties,

  progressStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.625rem',
  } satisfies CSSProperties,

  progressConnector: {
    width: '2px',
    height: '1rem',
    marginLeft: '0.625rem',
    backgroundColor: '#e5e7eb',
  } satisfies CSSProperties,

  progressConnectorActive: {
    width: '2px',
    height: '1rem',
    marginLeft: '0.625rem',
    backgroundColor: '#22c55e',
  } satisfies CSSProperties,

  progressBar: {
    width: '100%',
    height: '0.5rem',
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginTop: '0.375rem',
  } satisfies CSSProperties,

  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e5e7eb',
  } satisfies CSSProperties,

  button: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.15s',
  } satisfies CSSProperties,

  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  } satisfies CSSProperties,

  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } satisfies CSSProperties,

  switchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.8125rem',
    color: '#6b7280',
  } satisfies CSSProperties,

  networkSwitchButton: {
    padding: '0.25rem 0.625rem',
    fontSize: '0.75rem',
    backgroundColor: 'transparent',
    border: '1px solid #fca5a5',
    borderRadius: '0.375rem',
    color: '#991b1b',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  } satisfies CSSProperties,
} as const;
