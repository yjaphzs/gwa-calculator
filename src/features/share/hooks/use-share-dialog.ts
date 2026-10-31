"use client";

import { useCallback, useState } from "react";

import type { ShareOptions } from "@/features/share/lib/share-options";

/**
 * Open state for the share studio, plus where it was opened from (the preset:
 * scope and mood). `used` stays true after the first open so the studio's code
 * loads only once someone shares.
 */
export function useShareDialog() {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);
  const [preset, setPreset] = useState<Partial<ShareOptions>>({});

  const openShare = useCallback((next: Partial<ShareOptions> = {}) => {
    setPreset(next);
    setUsed(true);
    setOpen(true);
  }, []);

  return { open, setOpen, used, preset, openShare };
}
