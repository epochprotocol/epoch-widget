import type { CSSProperties } from 'react';

// ---------------------------------------------------------------------------
// Design tokens
//
// Consumers override colours / spacing / typography via the `theme` prop.
// Tokens are projected onto CSS custom properties on the widget root so every
// style references `var(--epoch-…)` — no threading required.
// ---------------------------------------------------------------------------

/**
 * Visual tokens for the widget. Any token you omit falls back to the default.
 * These are pure colour / spacing overrides — for structural CSS control, use
 * the `classNames` prop on the widget instead.
 */
export interface EpochTheme {
  /** Primary accent colour — button, toggles, active progress. */
  colorPrimary?: string;
  /** Primary on-hover / pressed colour. */
  colorPrimaryHover?: string;
  /** Modal background. */
  colorBackground?: string;
  /** Card / input / muted surface background. */
  colorSurface?: string;
  /** Border colour for cards and inputs. */
  colorBorder?: string;
  /** Primary text colour (titles, values). */
  colorTextPrimary?: string;
  /** Secondary text colour (labels, subtitles). */
  colorTextSecondary?: string;
  /** Muted text colour (hints, placeholders). */
  colorTextMuted?: string;
  /** Success accent. */
  colorSuccess?: string;
  /** Error accent. */
  colorError?: string;
  /** Warning accent. */
  colorWarning?: string;
  /** Info accent. */
  colorInfo?: string;
  /** Backdrop overlay colour. */
  colorOverlay?: string;
  /** Card/input border radius. */
  radiusSm?: string;
  /** Modal container radius. */
  radiusLg?: string;
  /** Font family applied to the widget root. */
  fontFamily?: string;
}

// ---- Defaults -------------------------------------------------------------

export const DEFAULT_THEME: Required<EpochTheme> = {
  colorPrimary: '#3b82f6',
  colorPrimaryHover: '#2563eb',
  colorBackground: '#ffffff',
  colorSurface: '#f5f6f8',
  colorBorder: '#e8eaed',
  colorTextPrimary: '#111827',
  colorTextSecondary: '#374151',
  colorTextMuted: '#9ca3af',
  colorSuccess: '#16a34a',
  colorError: '#dc2626',
  colorWarning: '#d97706',
  colorInfo: '#3b82f6',
  colorOverlay: 'rgba(0, 0, 0, 0.45)',
  radiusSm: '12px',
  radiusLg: '20px',
  fontFamily:
    "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

// ---- CSS variable projection -----------------------------------------------

const VAR_MAP: Record<keyof typeof DEFAULT_THEME, string> = {
  colorPrimary: '--epoch-color-primary',
  colorPrimaryHover: '--epoch-color-primary-hover',
  colorBackground: '--epoch-color-bg',
  colorSurface: '--epoch-color-surface',
  colorBorder: '--epoch-color-border',
  colorTextPrimary: '--epoch-color-text',
  colorTextSecondary: '--epoch-color-text-secondary',
  colorTextMuted: '--epoch-color-text-muted',
  colorSuccess: '--epoch-color-success',
  colorError: '--epoch-color-error',
  colorWarning: '--epoch-color-warning',
  colorInfo: '--epoch-color-info',
  colorOverlay: '--epoch-color-overlay',
  radiusSm: '--epoch-radius-sm',
  radiusLg: '--epoch-radius-lg',
  fontFamily: '--epoch-font',
};

/**
 * Project a (possibly partial) theme onto a CSS-variable style object.
 * Unset tokens use `DEFAULT_THEME`.
 */
export function themeToCssVars(theme?: EpochTheme): CSSProperties {
  const merged = { ...DEFAULT_THEME, ...(theme ?? {}) };
  const vars: Record<string, string> = {};
  for (const key of Object.keys(VAR_MAP) as Array<keyof typeof VAR_MAP>) {
    vars[VAR_MAP[key]] = merged[key];
  }
  return vars as CSSProperties;
}

// ---- Short aliases for use in styles.ts -----------------------------------

export const t = {
  primary: 'var(--epoch-color-primary)',
  primaryHover: 'var(--epoch-color-primary-hover)',
  bg: 'var(--epoch-color-bg)',
  surface: 'var(--epoch-color-surface)',
  border: 'var(--epoch-color-border)',
  text: 'var(--epoch-color-text)',
  textSecondary: 'var(--epoch-color-text-secondary)',
  textMuted: 'var(--epoch-color-text-muted)',
  success: 'var(--epoch-color-success)',
  error: 'var(--epoch-color-error)',
  warning: 'var(--epoch-color-warning)',
  info: 'var(--epoch-color-info)',
  overlay: 'var(--epoch-color-overlay)',
  radiusSm: 'var(--epoch-radius-sm)',
  radiusLg: 'var(--epoch-radius-lg)',
  font: 'var(--epoch-font)',
} as const;
