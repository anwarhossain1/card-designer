import {
  DEFAULT_LOCALE,
  readStoredLocale,
  storeLocale,
  type Locale,
} from "./config";

/**
 * The active locale, held outside React so components can read it with
 * `useSyncExternalStore`.
 *
 * That hook is the point: it takes a separate server snapshot, and React uses
 * it for every component that is *hydrating* — including a Suspense boundary
 * that hydrates after the rest of the page. A locale kept in context state
 * cannot do that: by the time a late boundary hydrates, the provider has
 * already switched to the stored choice, and the boundary's English render
 * meets Bangla server HTML.
 */

let current: Locale | null = null;
const listeners = new Set<() => void>();

/** Read lazily, so nothing touches localStorage during server rendering. */
export function getLocale(): Locale {
  if (current === null) current = readStoredLocale();
  return current;
}

/** What the server rendered with; it has no access to the visitor's choice. */
export const getServerLocale = (): Locale => DEFAULT_LOCALE;

export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setLocale(next: Locale): void {
  storeLocale(next);
  if (next === current) return;
  current = next;
  listeners.forEach((listener) => listener());
}
