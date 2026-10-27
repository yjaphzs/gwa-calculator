"use client";

import { useEffect, useRef } from "react";

/**
 * A ref that always holds the latest `value` (updated after each render), for
 * reading current state inside long-lived callbacks/subscriptions without
 * making them re-subscribe when the value changes.
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
