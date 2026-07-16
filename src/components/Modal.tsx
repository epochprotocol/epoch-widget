import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/cn';
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

// The <dialog> itself is the overlay, so `classNames.overlay` keeps applying.
// The leading resets undo the UA's dialog defaults (auto margins, fit-content
// sizing, border, its own ::backdrop) — we paint the scrim ourselves.
const OVERLAY_CLASSES =
  'm-0 max-w-none max-h-none w-full h-full border-0 p-4 fixed inset-0 z-[9999] flex items-center justify-center bg-overlay backdrop-blur-md animate-overlay-in [&::backdrop]:bg-transparent';

const CONTAINER_CLASSES =
  'flex w-full max-w-[480px] max-h-[90vh] flex-col overflow-hidden rounded-lg border border-line bg-canvas font-sans text-sm text-fg shadow-lg animate-modal-in';

const HEADER_CLASSES = 'flex items-center justify-between px-6 pt-5 pb-3';

const HEADER_TITLE_CLASSES = 'm-0 text-lg font-semibold text-fg -tracking-[0.01em]';

const ICON_BUTTON_CLASSES =
  'inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-fg-muted transition-colors hover:bg-line hover:text-fg';

const BODY_CLASSES =
  'flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto px-6 pt-1 pb-5';

const FOOTER_CLASSES = 'px-6 pt-4 pb-5';

const POWERED_CLASSES =
  'mt-2.5 flex items-center justify-center gap-1.5 text-[11px] tracking-[0.01em] text-fg-muted opacity-60';

/**
 * Minimal modal shell: overlay → container → header → body → footer.
 * Supports full className overrides for every slot.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  theme,
  classNames: cs,
  children,
  footer,
  headerAction,
  onBack,
  renderInline = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // showModal() is what buys the focus trap, Escape, and the top layer — none of
  // which a plain div gets. Opening happens on mount because the component
  // returns null while closed.
  useEffect(() => {
    if (renderInline) return;
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    return () => dialog.close();
  }, [renderInline]);

  useEffect(() => {
    if (!isOpen || renderInline) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, renderInline]);

  if (!isOpen) return null;

  const cssVars = themeToCssVars(theme);

  const headerEl = (
    <div className={cn(HEADER_CLASSES, cs?.header)}>
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className={ICON_BUTTON_CLASSES}
          >
            <ChevronLeftIcon />
          </button>
        )}
        <h2 id="epoch-widget-title" className={HEADER_TITLE_CLASSES}>
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {headerAction}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className={ICON_BUTTON_CLASSES}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );

  const bodyEl = <div className={cn(BODY_CLASSES, cs?.body)}>{children}</div>;

  const footerEl = footer && (
    <div className={cn(FOOTER_CLASSES, cs?.footer)}>
      {footer}
      <div className={POWERED_CLASSES}>
        <PoweredIcon />
        Powered by Epoch Protocol
      </div>
    </div>
  );

  if (renderInline) {
    return (
      <div
        className={cn(CONTAINER_CLASSES, 'relative max-w-full', cs?.container)}
        style={cssVars}
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
    <dialog
      ref={dialogRef}
      className={cn(OVERLAY_CLASSES, cs?.overlay)}
      style={cssVars}
      aria-labelledby="epoch-widget-title"
      onCancel={(e) => {
        // Escape: let the widget own closing so state unwinds the same way it
        // does for the close button.
        e.preventDefault();
        onClose();
      }}
    >
      {/* Pointer-only convenience: a real close button lives in the header and
          Escape is handled natively, so this is hidden from assistive tech
          rather than duplicated as a second tab stop. */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div className={cn(CONTAINER_CLASSES, 'relative', cs?.container)}>
        {headerEl}
        {bodyEl}
        {footerEl}
      </div>
    </dialog>
  );

  return createPortal(modal, document.body);
}
