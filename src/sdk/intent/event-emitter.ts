type Listener<T> = (payload: T) => void;

/**
 * Minimal typed event emitter. No Node dependency, no `EventEmitter` import.
 * Each `on()` returns an unsubscribe function — friendly to React `useEffect`
 * cleanups but works from any caller.
 */
export class TypedEventEmitter<EventMap extends Record<string, any>> {
  private listeners: { [K in keyof EventMap]?: Set<Listener<EventMap[K]>> } = {};

  on<K extends keyof EventMap>(event: K, fn: Listener<EventMap[K]>): () => void {
    const set = (this.listeners[event] ??= new Set());
    set.add(fn);
    return () => set.delete(fn);
  }

  off<K extends keyof EventMap>(event: K, fn: Listener<EventMap[K]>): void {
    this.listeners[event]?.delete(fn);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const set = this.listeners[event];
    if (!set) return;
    for (const fn of set) {
      try {
        fn(payload);
      } catch (err) {
        // Swallow — one bad listener should not break others or the emitter.
        // Surface in console so it's not silently lost.
        // eslint-disable-next-line no-console
        console.error('[TypedEventEmitter] listener threw for event', event, err);
      }
    }
  }

  removeAllListeners(): void {
    this.listeners = {};
  }
}
