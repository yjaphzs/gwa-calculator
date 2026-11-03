"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** The page's `?redirect=` value (null before hydration and when absent). */
export function useRedirectParam(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get("redirect"),
    () => null,
  );
}
