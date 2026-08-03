export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "cardcraft.theme";
export const DEFAULT_THEME: ThemePreference = "system";

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== "system") return preference;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function readStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(preference: ThemePreference) {
  document.documentElement.dataset.theme = resolveTheme(preference);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Private browsing — the theme still applies for this session.
  }
}

/**
 * Runs before first paint, inlined in <head>.
 *
 * Kept as a string rather than a component so it executes ahead of hydration:
 * resolving the theme in React would paint the light theme first and flash.
 */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var pref = stored === 'light' || stored === 'dark' ? stored : null;
    var dark = pref
      ? pref === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
`.trim();
