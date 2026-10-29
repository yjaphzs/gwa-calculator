"use client";

import { useEffect, useState } from "react";

/**
 * Tracks an element's rendered width (via ResizeObserver); `fallback` until
 * measured. Returns a callback ref, so it still works when the element mounts
 * after the component does.
 */
export function useElementWidth<T extends HTMLElement>(fallback: number) {
  const [element, setElement] = useState<T | null>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (next > 0) setWidth(next);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return { ref: setElement, width };
}
