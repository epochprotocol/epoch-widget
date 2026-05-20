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
  /** Tinted accent background used for soft pills and selected rows. */
  colorAccentSoft?: string;
  /** Modal background. */
  colorBackground?: string;
  /** Card / input / muted surface background. */
  colorSurface?: string;
  /** Slightly stronger surface used for raised cards on dense layouts. */
  colorSurfaceMuted?: string;
  /** Raised surface used for elevated rows (token avatar bg, etc). */
  colorSurfaceRaised?: string;
  /** Border colour for cards and inputs. */
  colorBorder?: string;
  /** Stronger border used for focused / selected elements. */
  colorBorderStrong?: string;
  /** Primary text colour (titles, values). */
  colorTextPrimary?: string;
  /** Secondary text colour (labels, subtitles). */
  colorTextSecondary?: string;
  /** Muted text colour (hints, placeholders). */
  colorTextMuted?: string;
  /** Success accent. */
  colorSuccess?: string;
  /** Soft success background for pills. */
  colorSuccessSoft?: string;
  /** Error accent. */
  colorError?: string;
  /** Soft error background for pills. */
  colorErrorSoft?: string;
  /** Warning accent. */
  colorWarning?: string;
  /** Soft warning background for pills. */
  colorWarningSoft?: string;
  /** Danger accent (high-severity warnings). */
  colorDanger?: string;
  /** Soft danger background. */
  colorDangerSoft?: string;
  /** Info accent. */
  colorInfo?: string;
  /** Backdrop overlay colour. */
  colorOverlay?: string;
  /** Tightest border radius — pills, chips. */
  radiusXs?: string;
  /** Card/input border radius. */
  radiusSm?: string;
  /** Section radius. */
  radiusMd?: string;
  /** Modal container radius. */
  radiusLg?: string;
  /** Outermost radius for hero shapes. */
  radiusXl?: string;
  /** Small drop shadow. */
  shadowSm?: string;
  /** Medium drop shadow used by cards on hover. */
  shadowMd?: string;
  /** Large drop shadow used by modal. */
  shadowLg?: string;
  /** Strong font weight used for numeric values. */
  fontWeightStrong?: string;
  /** Font family applied to the widget root. */
  fontFamily?: string;
}

// ---- Defaults -------------------------------------------------------------

export const LIGHT_THEME: Required<EpochTheme> = {
  colorPrimary: '#5b6cff',
  colorPrimaryHover: '#4452f0',
  colorAccentSoft: 'rgba(91,108,255,0.10)',
  colorBackground: '#ffffff',
  colorSurface: '#f5f6fa',
  colorSurfaceMuted: '#eef0f6',
  colorSurfaceRaised: '#ffffff',
  colorBorder: '#e7e9f0',
  colorBorderStrong: '#cfd3df',
  colorTextPrimary: '#0f1424',
  colorTextSecondary: '#3b4156',
  colorTextMuted: '#8a90a3',
  colorSuccess: '#16a34a',
  colorSuccessSoft: 'rgba(22,163,74,0.12)',
  colorError: '#dc2626',
  colorErrorSoft: 'rgba(220,38,38,0.10)',
  colorWarning: '#d97706',
  colorWarningSoft: 'rgba(217,119,6,0.12)',
  colorDanger: '#e11d48',
  colorDangerSoft: 'rgba(225,29,72,0.10)',
  colorInfo: '#5b6cff',
  colorOverlay: 'rgba(7, 10, 22, 0.55)',
  radiusXs: '8px',
  radiusSm: '12px',
  radiusMd: '16px',
  radiusLg: '22px',
  radiusXl: '28px',
  shadowSm: '0 1px 2px rgba(15,20,36,0.06)',
  shadowMd: '0 8px 24px rgba(15,20,36,0.10)',
  shadowLg: '0 24px 60px rgba(15,20,36,0.20)',
  fontWeightStrong: '650',
  fontFamily:
    "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

export const DARK_THEME: Required<EpochTheme> = {
  colorPrimary: '#8c9bff',
  colorPrimaryHover: '#6b7cff',
  colorAccentSoft: 'rgba(140,155,255,0.16)',
  colorBackground: '#0a0d18',
  colorSurface: '#131826',
  colorSurfaceMuted: '#1a2034',
  colorSurfaceRaised: '#1f2540',
  colorBorder: '#252b40',
  colorBorderStrong: '#3a4264',
  colorTextPrimary: '#f4f5fb',
  colorTextSecondary: '#c4c9da',
  colorTextMuted: '#737a91',
  colorSuccess: '#34d399',
  colorSuccessSoft: 'rgba(52,211,153,0.16)',
  colorError: '#f87171',
  colorErrorSoft: 'rgba(248,113,113,0.14)',
  colorWarning: '#fbbf24',
  colorWarningSoft: 'rgba(251,191,36,0.14)',
  colorDanger: '#fb7185',
  colorDangerSoft: 'rgba(251,113,133,0.14)',
  colorInfo: '#8c9bff',
  colorOverlay: 'rgba(0, 0, 0, 0.72)',
  radiusXs: '8px',
  radiusSm: '12px',
  radiusMd: '16px',
  radiusLg: '22px',
  radiusXl: '28px',
  shadowSm: '0 1px 2px rgba(0,0,0,0.4)',
  shadowMd: '0 8px 24px rgba(0,0,0,0.45)',
  shadowLg: '0 32px 80px rgba(0,0,0,0.55)',
  fontWeightStrong: '650',
  fontFamily: LIGHT_THEME.fontFamily,
};

/** Back-compat alias — old default. */
export const DEFAULT_THEME = LIGHT_THEME;

/** Accept `"light"` / `"dark"` / `EpochTheme` / undefined and return the resolved theme tokens. */
export function resolveTheme(
  input: 'light' | 'dark' | EpochTheme | undefined,
): EpochTheme {
  if (input === 'dark') return DARK_THEME;
  if (input === 'light' || input == null) return LIGHT_THEME;
  return input;
}

// ---- CSS variable projection -----------------------------------------------

const VAR_MAP: Record<keyof typeof LIGHT_THEME, string> = {
  colorPrimary: '--epoch-color-primary',
  colorPrimaryHover: '--epoch-color-primary-hover',
  colorAccentSoft: '--epoch-color-accent-soft',
  colorBackground: '--epoch-color-bg',
  colorSurface: '--epoch-color-surface',
  colorSurfaceMuted: '--epoch-color-surface-muted',
  colorSurfaceRaised: '--epoch-color-surface-raised',
  colorBorder: '--epoch-color-border',
  colorBorderStrong: '--epoch-color-border-strong',
  colorTextPrimary: '--epoch-color-text',
  colorTextSecondary: '--epoch-color-text-secondary',
  colorTextMuted: '--epoch-color-text-muted',
  colorSuccess: '--epoch-color-success',
  colorSuccessSoft: '--epoch-color-success-soft',
  colorError: '--epoch-color-error',
  colorErrorSoft: '--epoch-color-error-soft',
  colorWarning: '--epoch-color-warning',
  colorWarningSoft: '--epoch-color-warning-soft',
  colorDanger: '--epoch-color-danger',
  colorDangerSoft: '--epoch-color-danger-soft',
  colorInfo: '--epoch-color-info',
  colorOverlay: '--epoch-color-overlay',
  radiusXs: '--epoch-radius-xs',
  radiusSm: '--epoch-radius-sm',
  radiusMd: '--epoch-radius-md',
  radiusLg: '--epoch-radius-lg',
  radiusXl: '--epoch-radius-xl',
  shadowSm: '--epoch-shadow-sm',
  shadowMd: '--epoch-shadow-md',
  shadowLg: '--epoch-shadow-lg',
  fontWeightStrong: '--epoch-font-weight-strong',
  fontFamily: '--epoch-font',
};

/**
 * Project a (possibly partial) theme onto a CSS-variable style object.
 * Accepts `"light"` / `"dark"` presets or an explicit `EpochTheme` token map.
 * Unset tokens fall back to `LIGHT_THEME`.
 */
export function themeToCssVars(
  theme?: 'light' | 'dark' | EpochTheme,
): CSSProperties {
  const resolved = resolveTheme(theme);
  const base = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
  const merged = { ...base, ...resolved };
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
  accentSoft: 'var(--epoch-color-accent-soft)',
  bg: 'var(--epoch-color-bg)',
  surface: 'var(--epoch-color-surface)',
  surfaceMuted: 'var(--epoch-color-surface-muted)',
  surfaceRaised: 'var(--epoch-color-surface-raised)',
  border: 'var(--epoch-color-border)',
  borderStrong: 'var(--epoch-color-border-strong)',
  text: 'var(--epoch-color-text)',
  textSecondary: 'var(--epoch-color-text-secondary)',
  textMuted: 'var(--epoch-color-text-muted)',
  success: 'var(--epoch-color-success)',
  successSoft: 'var(--epoch-color-success-soft)',
  error: 'var(--epoch-color-error)',
  errorSoft: 'var(--epoch-color-error-soft)',
  warning: 'var(--epoch-color-warning)',
  warningSoft: 'var(--epoch-color-warning-soft)',
  danger: 'var(--epoch-color-danger)',
  dangerSoft: 'var(--epoch-color-danger-soft)',
  info: 'var(--epoch-color-info)',
  overlay: 'var(--epoch-color-overlay)',
  radiusXs: 'var(--epoch-radius-xs)',
  radiusSm: 'var(--epoch-radius-sm)',
  radiusMd: 'var(--epoch-radius-md)',
  radiusLg: 'var(--epoch-radius-lg)',
  radiusXl: 'var(--epoch-radius-xl)',
  shadowSm: 'var(--epoch-shadow-sm)',
  shadowMd: 'var(--epoch-shadow-md)',
  shadowLg: 'var(--epoch-shadow-lg)',
  fontWeightStrong: 'var(--epoch-font-weight-strong)',
  font: 'var(--epoch-font)',
} as const;
