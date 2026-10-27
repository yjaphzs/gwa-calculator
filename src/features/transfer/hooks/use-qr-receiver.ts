"use client";

import { useCallback, useRef, useState } from "react";

import {
  assembleChunks,
  decodeTransferPayload,
  parseTransferFrame,
} from "@/features/transfer/lib/qr-frames";
import type { CalculatorState } from "@/types";

const DECODE_ERROR =
  "Failed to decode QR data. Make sure you scanned all codes from the sending device.";

/**
 * Collects scanned QR frames (single or multi-code) and calls `onComplete`
 * with the decoded, validated state once every chunk has arrived.
 */
export function useQrReceiver(onComplete: (state: CalculatorState) => void) {
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ received: number; total: number } | null>(null);
  const chunksRef = useRef(new Map<number, string>());

  const finish = useCallback(
    (compressed: string) => {
      try {
        onComplete(decodeTransferPayload(compressed));
      } catch {
        setError(DECODE_ERROR);
      }
    },
    [onComplete],
  );

  const handleScan = useCallback(
    (text: string) => {
      setError(null);
      const frame = parseTransferFrame(text);
      if (!frame) {
        setError("Unrecognized QR code format.");
        return;
      }
      if (frame.kind === "single") {
        finish(frame.data);
        return;
      }

      chunksRef.current.set(frame.index, frame.data);
      setProgress({ received: chunksRef.current.size, total: frame.total });
      if (chunksRef.current.size === frame.total) {
        // All chunks received — reassemble
        finish(assembleChunks(chunksRef.current, frame.total));
      }
    },
    [finish],
  );

  const reset = useCallback(() => {
    chunksRef.current = new Map();
    setProgress(null);
    setError(null);
  }, []);

  return { error, progress, handleScan, reset };
}
