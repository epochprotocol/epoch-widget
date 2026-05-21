import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Concatenate class strings and resolve conflicting Tailwind utilities.
 *
 * Pass consumer-supplied classes last so they win over library defaults via
 * `tailwind-merge`'s last-utility-wins semantics:
 *
 *     <button className={cn('bg-primary text-white px-4', classNames?.button)} />
 *
 * Internally: `clsx` flattens conditionals/arrays; `twMerge` collapses
 * conflicting utility classes (e.g., `bg-primary bg-red-500` → `bg-red-500`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
