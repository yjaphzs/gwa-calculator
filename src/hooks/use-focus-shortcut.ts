"use client";

import { useCallback, useRef } from "react";

import { useEventListener } from "@/hooks/use-event-listener";

/**
 * Focus the returned input ref on Ctrl/⌘ + `key` (default "f"), overriding the
 * browser's own shortcut for that key.
 */
export function useFocusShortcut(key = "f") {
  const ref = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === key) {
        event.preventDefault();
        ref.current?.focus();
      }
    },
    [key],
  );
  useEventListener("keydown", handleKeyDown);

  return ref;
}
