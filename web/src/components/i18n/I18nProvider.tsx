"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/i18n/config";
import { en, type Dictionary } from "@/lib/i18n/dictionaries/en";
import { bn } from "@/lib/i18n/dictionaries/bn";
import {
  getLocale,
  getServerLocale,
  setLocale,
  subscribeLocale,
} from "@/lib/i18n/store";

const DICTIONARIES: Record<Locale, Dictionary> = { en, bn };

interface I18nValue {
  locale: Locale;
  /** The active dictionary. Accessed by property, so keys are type-checked. */
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

/** Only marks that the provider is present; the locale lives in the store. */
const I18nContext = createContext(false);

/**
 * Client-side localisation.
 *
 * The server renders the default locale. Each component reads the locale
 * itself through `useSyncExternalStore`, so anything hydrating — however late,
 * Suspense boundaries included — hydrates with the server's locale and then
 * switches, instead of hydrating straight into the stored choice and failing
 * to match the HTML. A visitor who chose English therefore still sees one
 * frame of Bangla on a full page load (the accepted cost of switching without
 * changing the URL); client-side navigations render their choice directly.
 * Moving to /en later means adding a route segment, not rewriting these
 * dictionaries.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nContext.Provider value>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  if (!useContext(I18nContext)) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }

  const locale = useSyncExternalStore(subscribeLocale, getLocale, getServerLocale);

  return useMemo(
    () => ({ locale, t: DICTIONARIES[locale], setLocale }),
    [locale],
  );
}

/** Shorthand for components that only need the strings. */
export const useT = (): Dictionary => useI18n().t;
