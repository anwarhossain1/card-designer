export const LOCALES = ["bn", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** Bangla is the product's primary audience, so it is what a new visitor sees. */
export const DEFAULT_LOCALE: Locale = "bn";

export const LOCALE_STORAGE_KEY = "cardcraft.locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  bn: "বাংলা",
  en: "English",
};

const isLocale = (value: unknown): value is Locale =>
  LOCALES.includes(value as Locale);

export function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function storeLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Private browsing — the choice still applies for this session.
  }
  document.documentElement.lang = locale;
}

/**
 * Sets <html lang> before first paint so screen readers and the browser's own
 * font matching pick the right language immediately. The visible strings still
 * come from React, so an English visitor sees one frame of Bangla — the known
 * cost of switching client-side rather than by URL.
 */
export const LOCALE_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('${LOCALE_STORAGE_KEY}');
    document.documentElement.lang = stored === 'en' ? 'en' : '${DEFAULT_LOCALE}';
  } catch (e) {
    document.documentElement.lang = '${DEFAULT_LOCALE}';
  }
})();
`.trim();
