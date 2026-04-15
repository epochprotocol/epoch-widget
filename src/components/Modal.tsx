import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { s } from '../styles';
import { themeToCssVars, t, type EpochTheme } from '../theme';
import type { EpochClassNames } from '../types';
import { CloseIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  theme?: EpochTheme;
  classNames?: EpochClassNames;
  children: ReactNode;
  footer?: ReactNode;
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
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Autofocus container
  useEffect(() => {
    if (isOpen) containerRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const cssVars = themeToCssVars(theme);

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
        {/* Header */}
        <div
          className={cn?.header}
          style={cn?.header ? undefined : s.header}
        >
          <h2 id="epoch-widget-title" style={s.headerTitle}>
            {title}
          </h2>
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

        {/* Body (scrollable) */}
        <div
          className={cn?.body}
          style={cn?.body ? undefined : s.body}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cn?.footer}
            style={cn?.footer ? undefined : s.footer}
          >
            {footer}
            {/* Branding */}
            <div style={s.powered}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M5 8h6M8 5l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Powered by Epoch Protocol
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
