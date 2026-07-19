import { useEffect, useRef } from 'react';
import { useLatestRef } from './use-latest-ref';

/**
 * Fires `onOpen` once on each closed → open transition.
 *
 * Guards on the previous value rather than just `isOpen` so unrelated re-renders
 * (or a parent handing down a fresh `onOpen` identity) don't re-fire the
 * integrator's callback while the widget is already open.
 */
export function useOnOpen(isOpen: boolean, onOpen?: () => void): void {
  const onOpenRef = useLatestRef(onOpen);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) onOpenRef.current?.();
    wasOpenRef.current = isOpen;
  }, [isOpen, onOpenRef]);
}
