import { useEffect, useRef, useState } from 'react';

function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `epoch-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

/**
 * Returns a stable session ID for the current `isOpen=true` cycle. The ID
 * changes every time the widget transitions from closed → open, so callbacks
 * fired within a single open share one ID.
 */
export function useSessionId(isOpen: boolean): string {
  const [id, setId] = useState<string>(() => makeId());
  const wasOpenRef = useRef<boolean>(isOpen);
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setId(makeId());
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);
  return id;
}
