"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether a CSS media query matches. False during server rendering and the
 * first hydration pass, so prefer CSS breakpoints for layout and use this only
 * for choices made on interaction (e.g. which overlay to open).
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Below the md breakpoint (768px), where overlays open as bottom sheets. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
