import { useCallback, useState } from 'react';

/**
 * A value that follows `derive(prop)` until the user overrides it, then
 * re-follows the prop the moment `prop` changes.
 *
 * The override is tagged with the prop value it was set against, so a new prop
 * evicts it automatically — no reset effect, and the user's choice never
 * silently ignores a fresh prop from the integrator.
 */
export function usePropOverride<P, V>(
  prop: P,
  derive: (prop: P) => V,
): [V, (value: V) => void] {
  const [override, setOverride] = useState<{ forProp: P; value: V } | null>(
    null,
  );
  const value =
    override && override.forProp === prop ? override.value : derive(prop);
  const set = useCallback(
    (next: V) => setOverride({ forProp: prop, value: next }),
    [prop],
  );
  return [value, set];
}
