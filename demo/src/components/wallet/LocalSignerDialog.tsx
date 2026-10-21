import { useEffect, useId, useRef, type ReactNode } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function LocalSignerDialog({ title, onClose, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-[480px] max-h-[90vh] overflow-y-auto rounded-lg border border-line bg-canvas p-6 font-sans text-sm text-fg shadow-lg backdrop:bg-black/40 backdrop:backdrop-blur-md"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={titleId} className="m-0 text-lg font-semibold">{title}</h2>
        <button type="button" aria-label="Close" onClick={onClose} className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent text-lg text-fg-muted hover:bg-surface">×</button>
      </div>
      {children}
    </dialog>
  );
}
