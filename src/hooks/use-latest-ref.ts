import { useEffect, useRef, type MutableRefObject } from 'react';

/**
 * Keeps a ref pointed at the newest value without forcing consumers to
 * re-subscribe.
 *
 * Long-lived subscriptions — a PaySession, a poll loop, a DOM listener — close
 * over their callbacks once but must always invoke the *current* one. Reading
 * `ref.current` from inside those callbacks gives that, while keeping the
 * callback out of effect dependency arrays (where it would tear the
 * subscription down and rebuild it on every render).
 *
 * The write lands after commit, never during render: React may render a
 * component and throw the work away, which would otherwise leave the ref
 * holding a value from UI that never shipped. Readers must therefore run after
 * commit too — event handlers, effects, and async callbacks all qualify. Do not
 * read `.current` during render.
 */
export function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
