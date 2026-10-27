"use client";

import { useCallback, useRef, type RefObject } from "react";

import { writeCalculatorState } from "@/lib/firebase/firestore";
import type { CalculatorState } from "@/types";

// Debounce window for cloud writes — coalesces rapid edits into one write.
const CLOUD_WRITE_DEBOUNCE_MS = 600;

/**
 * Cloud writes for the signed-in user. `schedule` debounces routine edits;
 * `writeNow` is for explicit actions and cancels any pending debounced write
 * first so a stale payload can't land after it.
 */
export function useDebouncedCloudWriter(uidRef: RefObject<string | null>) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // When autosave is off, subjects are omitted so the cloud keeps its last
  // saved set (mirrors guest behavior).
  const schedule = useCallback(
    (next: CalculatorState) => {
      const currentUid = uidRef.current;
      if (!currentUid) return;
      cancel();
      timerRef.current = setTimeout(() => {
        const payload: Partial<CalculatorState> = next.autosave
          ? next
          : { semesters: next.semesters, autosave: next.autosave };
        writeCalculatorState(currentUid, payload).catch((err) =>
          console.error("[useCalculatorData] cloud write failed:", err),
        );
      }, CLOUD_WRITE_DEBOUNCE_MS);
    },
    [cancel, uidRef],
  );

  const writeNow = useCallback(
    (state: CalculatorState, label: string) => {
      const currentUid = uidRef.current;
      if (!currentUid) return;
      cancel();
      writeCalculatorState(currentUid, state).catch((err) =>
        console.error(`[useCalculatorData] ${label} failed:`, err),
      );
    },
    [cancel, uidRef],
  );

  return { schedule, writeNow, cancel };
}
