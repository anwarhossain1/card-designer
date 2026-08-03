"use client";

import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  DEFAULT_THEME,
  readStoredTheme,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme/theme";

/**
 * Theme preference and the theme actually showing.
 *
 * Starts from the default rather than reading storage during render, so server
 * and client markup agree; the real preference lands in the first effect. The
 * inline head script has already painted the correct theme by then, so this
 * never causes a visible flash.
 */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(DEFAULT_THEME);
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const stored = readStoredTheme();
    setPreference(stored);
    setResolved(resolveTheme(stored));
  }, []);

  /* Follow the OS while the preference is "system". */
  useEffect(() => {
    if (preference !== "system") return;

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      applyTheme("system");
      setResolved(resolveTheme("system"));
    };

    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [preference]);

  const setTheme = useCallback((next: ThemePreference) => {
    applyTheme(next);
    setPreference(next);
    setResolved(resolveTheme(next));
  }, []);

  return { preference, resolved, setTheme };
}
