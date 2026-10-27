"use client";

import { useCallback, useState } from "react";

/**
 * Submission state for a form inside a dialog: `processing` while the submit
 * runs, `success` once it resolves, `dirty` mirrored from the form so the
 * dialog can disable Submit until something changed. `run` always closes the
 * dialog afterwards, even when the action throws.
 */
export function useFormSubmitState(close: () => void) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dirty, setDirty] = useState(true);

  const run = useCallback(
    async (action: () => void | Promise<void>) => {
      setProcessing(true);
      setSuccess(false);
      try {
        await action();
        setSuccess(true);
      } finally {
        setProcessing(false);
        close();
      }
    },
    [close],
  );

  return { processing, success, dirty, setDirty, run };
}
