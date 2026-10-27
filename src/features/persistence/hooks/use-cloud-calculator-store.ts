"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import { useDebouncedCloudWriter } from "@/features/persistence/hooks/use-debounced-cloud-writer";
import {
  EMPTY_CALCULATOR_STATE,
  hasData,
  isReconciled,
  markReconciled,
  mergeStates,
  sameState,
  type MergeConflict,
} from "@/features/persistence/lib/calculator-state";
import { useLatest } from "@/hooks/use-latest";
import { subscribeCalculatorState } from "@/lib/firebase/firestore";
import type { CalculatorState, Semester, Subject } from "@/types";

/**
 * Cloud store (Firestore) for a signed-in user: live subscription, debounced
 * writes, and the one-time first-sign-in reconciliation against `localRef`
 * (the guest data on this device).
 */
export function useCloudCalculatorStore(
  uid: string | null,
  localRef: RefObject<CalculatorState>,
) {
  const [cloud, setCloud] = useState<CalculatorState>(EMPTY_CALCULATOR_STATE);
  const [pendingMerge, setPendingMerge] = useState<MergeConflict | null>(null);
  // Whether the first cloud snapshot has arrived (only meaningful when signed in).
  const [ready, setReady] = useState(false);

  const uidRef = useLatest(uid);
  const autosaveRef = useLatest(cloud.autosave);
  const initedRef = useRef(false);
  const writer = useDebouncedCloudWriter(uidRef);
  const { schedule, writeNow, cancel } = writer;

  // ── Cloud subscription (per signed-in user) ────────────────────────────────
  useEffect(() => {
    setReady(false);
    if (!uid) {
      initedRef.current = false;
      setPendingMerge(null);
      return;
    }

    const unsub = subscribeCalculatorState(uid, (incoming, meta) => {
      if (!initedRef.current) {
        initedRef.current = true;
        setReady(true);
        const local = localRef.current;

        // Already reconciled on this device → adopt cloud, never prompt again.
        if (isReconciled(uid)) {
          setCloud(incoming);
          return;
        }

        if (hasData(incoming) && hasData(local) && !sameState(local, incoming)) {
          // Conflict — ask the user how to reconcile. The reconciled flag is
          // set once they resolve it (see resolveMerge).
          setPendingMerge({ local, cloud: incoming });
          setCloud(incoming);
        } else if (!hasData(incoming) && hasData(local)) {
          // Fresh account with local guest data — push it up.
          setCloud(local);
          writeNow(local, "initial push");
          markReconciled(uid);
        } else {
          // No conflict (cloud has data and local matches/empty, or both empty).
          setCloud(incoming);
          markReconciled(uid);
        }
        return;
      }

      // Subsequent live updates — real-time sync from OTHER devices. Skip the
      // echo of our own pending local writes (latency compensation) so a fresh
      // edit made between a write and its server-ack isn't transiently clobbered;
      // the local optimistic state already reflects our own changes.
      if (meta.hasPendingWrites) return;

      // Keep in-memory subjects when autosave is off.
      setCloud((prev) => ({
        subjects: autosaveRef.current ? incoming.subjects : prev.subjects,
        semesters: incoming.semesters,
        autosave: incoming.autosave,
      }));
    });

    return () => {
      unsub();
      cancel();
    };
  }, [uid, localRef, autosaveRef, writeNow, cancel]);

  // ── Setters (mirror the useState dispatcher API) ───────────────────────────
  const setField = useCallback(
    <K extends keyof CalculatorState>(key: K, value: SetStateAction<CalculatorState[K]>) => {
      setCloud((prev) => {
        const resolved =
          typeof value === "function"
            ? (value as (p: CalculatorState[K]) => CalculatorState[K])(prev[key])
            : value;
        const next = { ...prev, [key]: resolved };
        schedule(next);
        return next;
      });
    },
    [schedule],
  );

  const setSubjects = useCallback<Dispatch<SetStateAction<Subject[]>>>(
    (value) => setField("subjects", value),
    [setField],
  );
  const setSemesters = useCallback<Dispatch<SetStateAction<Semester[]>>>(
    (value) => setField("semesters", value),
    [setField],
  );
  const setAutosave = useCallback<Dispatch<SetStateAction<boolean>>>(
    (value) => setField("autosave", value),
    [setField],
  );

  const removeSubjects = useCallback(() => {
    setCloud((prev) => {
      const next = { ...prev, subjects: [] };
      // Removing is explicit — always persist, regardless of autosave. Write the
      // FULL next state (not just { subjects: [] }) so that a semester saved in
      // the same tick isn't lost: "Save semester" adds the semester (scheduling
      // a debounced write) and then immediately resets subjects via this fn —
      // which cancels that pending write. `prev` already includes the new
      // semester, so writing `next` persists both the semester and the reset.
      writeNow(next, "remove");
      return next;
    });
  }, [writeNow]);

  const replaceAll = useCallback(
    (state: CalculatorState) => {
      setCloud(state);
      writeNow(state, "replaceAll");
    },
    [writeNow],
  );

  const persistNow = useCallback(() => writeNow(cloud, "persistNow"), [cloud, writeNow]);

  const resolveMerge = useCallback(
    (choice: "merge" | "cloud" | "local") => {
      setPendingMerge((conflict) => {
        if (!conflict || !uidRef.current) return null;
        const result =
          choice === "local"
            ? conflict.local
            : choice === "cloud"
              ? conflict.cloud
              : mergeStates(conflict.local, conflict.cloud);
        setCloud(result);
        writeNow(result, "merge resolve");
        markReconciled(uidRef.current);
        return null;
      });
    },
    [uidRef, writeNow],
  );

  return {
    state: cloud,
    ready,
    pendingMerge,
    setSubjects,
    setSemesters,
    setAutosave,
    removeSubjects,
    replaceAll,
    persistNow,
    resolveMerge,
  };
}
