"use client";

import { useEffect, useState } from "react";

/**
 * Matches a media query on the client only — returns `false` during SSR and the
 * first paint so server and client markup agree.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);

    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** The editor needs a desktop-sized viewport to be usable. */
export const useIsSmallScreen = () => useMediaQuery("(max-width: 1023px)");
