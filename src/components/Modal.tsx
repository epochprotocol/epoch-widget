import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { s } from '../styles';
import { themeToCssVars, type EpochTheme } from '../theme';
import type { EpochClassNames } from '../types';
import { ChevronLeftIcon, CloseIcon, PoweredIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  theme?: 'light' | 'dark' | EpochTheme;
  classNames?: EpochClassNames;
  children: ReactNode;
  footer?: ReactNode;
  /**
   * Optional control rendered in the header row, between the title and the
   * close button. Use for settings / network-toggle style affordances.
   */
  headerAction?: ReactNode;
  /** When set, replaces the close button with a back chevron that calls this handler. */
  onBack?: () => void;
  /**
   * Render the children inline (no overlay, no portal, no fixed dialog chrome).
   * Useful for embedding the widget body inside a host page.
   */
  renderInline?: boolean;
}

/**
 * Minimal modal shell: overlay → container → header → body → footer.
 * Supports full className overrides for every slot.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  theme,
  classNames: cn,
  children,
  footer,
  headerAction,
  onBack,
  renderInline = false,
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape (modal only)
  useEffect(() => {
    if (!isOpen || renderInline) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, renderInline]);

  // Lock body scroll (modal only)
  useEffect(() => {
    if (!isOpen || renderInline) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, renderInline]);

  // Autofocus container (modal only)
  useEffect(() => {
    if (isOpen && !renderInline) containerRef.current?.focus();
  }, [isOpen, renderInline]);

  if (!isOpen) return null;

  const cssVars = themeToCssVars(theme);

  const headerEl = (
    <div className={cn?.header} style={cn?.header ? undefined : s.header}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onBack && (
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            style={s.closeBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--epoch-color-border)';
              e.currentTarget.style.color = 'var(--epoch-color-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--epoch-color-text-muted)';
            }}
          >
            <ChevronLeftIcon />
          </button>
        )}
        <h2 id="epoch-widget-title" style={s.headerTitle}>
          {title}
        </h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {headerAction}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={s.closeBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--epoch-color-border)';
            e.currentTarget.style.color = 'var(--epoch-color-text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--epoch-color-text-muted)';
          }}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );

  const bodyEl = (
    <div className={cn?.body} style={cn?.body ? undefined : s.body}>
      {children}
    </div>
  );

  const footerEl = footer && (
    <div className={cn?.footer} style={cn?.footer ? undefined : s.footer}>
      {footer}
      <div style={s.powered}>
        <PoweredIcon />
        Powered by Epoch Protocol
      </div>
    </div>
  );

  if (renderInline) {
    return (
      <div
        className={cn?.container}
        style={cn?.container ? cssVars : { ...s.container, ...cssVars, position: 'relative', maxWidth: '100%' }}
        role="region"
        aria-labelledby="epoch-widget-title"
      >
        {headerEl}
        {bodyEl}
        {footerEl}
      </div>
    );
  }

  const modal = (
    <div
      className={cn?.overlay}
      style={cn?.overlay ? cssVars : { ...s.overlay, ...cssVars }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="epoch-widget-title"
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className={cn?.container}
        style={cn?.container ? undefined : s.container}
        onClick={(e) => e.stopPropagation()}
      >
        {headerEl}
        {bodyEl}
        {footerEl}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
