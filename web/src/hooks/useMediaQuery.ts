"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * One MediaQueryList per query, kept for the page's lifetime, so `getSnapshot`
 * reads the same object rather than allocating one per call.
 */
const lists = new Map<string, MediaQueryList>();

function mediaQueryList(query: string): MediaQueryList {
  let list = lists.get(query);
  if (!list) {
    list = window.matchMedia(query);
    lists.set(query, list);
  }
  return list;
}

/**
 * Matches a media query, resolved on the client's very first render.
 *
 * `useSyncExternalStore` rather than state-in-an-effect: an effect would paint
 * one frame at the wrong breakpoint, and the canvas mounts in that frame — it
 * would measure the desktop layout, fit the card to a squeezed workspace and
 * keep that zoom afterwards.
 */
export function useMediaQuery(query: string): boolean {
  /*
   * Three signals for one fact, because each can be missing on its own:
   * `change` is the spec answer, `resize` covers viewports that resize without
   * re-evaluating the query, and the ResizeObserver catches environments that
   * change the viewport with no events at all — emulated devices and some
   * embedded webviews do exactly that. Redundant notifications are free:
   * React drops any whose snapshot is unchanged.
   */
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = mediaQueryList(query);
      list.addEventListener("change", onChange);
      window.addEventListener("resize", onChange);
      window.addEventListener("orientationchange", onChange);

      const observer = new ResizeObserver(onChange);
      observer.observe(document.documentElement);

      return () => {
        list.removeEventListener("change", onChange);
        window.removeEventListener("resize", onChange);
        window.removeEventListener("orientationchange", onChange);
        observer.disconnect();
      };
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => mediaQueryList(query).matches,
    /* Prerender assumes desktop; the editor is client-only so this never ships. */
    () => false,
  );
}

/**
 * Below this the desktop chrome no longer fits: a 72px rail, a 288px drawer and
 * a 288px properties sidebar leave nothing for the card. Compact viewports get
 * the bottom-sheet shell instead.
 */
export const useIsCompactScreen = () => useMediaQuery("(max-width: 1023px)");
