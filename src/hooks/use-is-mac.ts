"use client";

import { useEffect, useState } from "react";

/** True on macOS/iOS, for showing ⌘ instead of Ctrl. False until mounted (no hydration mismatch). */
export function useIsMac(): boolean {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent));
  }, []);
  return isMac;
}
