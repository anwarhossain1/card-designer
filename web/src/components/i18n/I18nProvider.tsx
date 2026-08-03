"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  readStoredLocale,
  storeLocale,
  type Locale,
} from "@/lib/i18n/config";
import { en, type Dictionary } from "@/lib/i18n/dictionaries/en";
import { bn } from "@/lib/i18n/dictionaries/bn";

const DICTIONARIES: Record<Locale, Dictionary> = { en, bn };

interface I18nValue {
  locale: Locale;
  /** The active dictionary. Accessed by property, so keys are type-checked. */
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Client-side localisation.
 *
 * Renders the default locale first and adopts the stored choice in an effect,
 * so server and client markup match. A visitor who chose English therefore
 * sees one frame of Bangla — the accepted cost of switching without changing
 * the URL. Moving to /en later means adding a route segment, not rewriting
 * these dictionaries.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    storeLocale(next);
    setLocaleState(next);
  }, []);

  const value = useMemo(
    () => ({ locale, t: DICTIONARIES[locale], setLocale }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return context;
}

/** Shorthand for components that only need the strings. */
export const useT = (): Dictionary => useI18n().t;
