"use client";

import { useCallback, useState } from "react";

/** Open state for Wrapped. `used` stays true after the first open, so its code loads only then. */
export function useWrappedDialog() {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);

  const openWrapped = useCallback(() => {
    setUsed(true);
    setOpen(true);
  }, []);

  return { open, setOpen, used, openWrapped };
}
