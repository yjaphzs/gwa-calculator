"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useAuth } from "@/context/auth-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  subscribeCalculatorState,
  writeCalculatorState,
} from "@/lib/firebase/firestore";
import type { CalculatorState, Semester, Subject } from "@/types";

const SUBJECTS_KEY =
  process.env.NEXT_PUBLIC_APP_LOCAL_STORAGE_SUBJECTS_KEY || "gwa_subjects";
const SEMESTERS_KEY =
  process.env.NEXT_PUBLIC_APP_LOCAL_STORAGE_SEMESTERS_KEY || "gwa_semesters";
const AUTOSAVE_KEY =
  process.env.NEXT_PUBLIC_APP_LOCAL_STORAGE_AUTOSAVE_KEY || "gwa_autosave";

// Debounce window for cloud writes — coalesces rapid edits into one write.
const CLOUD_WRITE_DEBOUNCE_MS = 600;

// Per-account flag (localStorage) marking that the one-time local↔cloud
// reconciliation has already happened on this device, so the merge prompt is
// never shown again for this account on this browser.
const RECONCILED_KEY_PREFIX = "gwa_reconciled_";

function isReconciled(uid: string): boolean {
  try {
    return localStorage.getItem(RECONCILED_KEY_PREFIX + uid) === "true";
  } catch {
    return false;
  }
}

function markReconciled(uid: string): void {
  try {
    localStorage.setItem(RECONCILED_KEY_PREFIX + uid, "true");
  } catch {
    /* ignore */
  }
}

export interface MergeConflict {
  local: CalculatorState;
  cloud: CalculatorState;
}

export interface UseCalculatorData {
  subjects: Subject[];
  setSubjects: Dispatch<SetStateAction<Subject[]>>;
  removeSubjects: () => void;
  semesters: Semester[];
  setSemesters: Dispatch<SetStateAction<Semester[]>>;
  autosave: boolean;
  setAutosave: Dispatch<SetStateAction<boolean>>;
  /** Replace the entire state at once (import / QR transfer / merge). */
  replaceAll: (state: CalculatorState) => void;
  /** Force-persist the current state to the active store right now. */
  persistNow: () => void;
  /**
   * True while the initial data is loading — auth is still resolving, or (when
   * signed in) the first cloud snapshot hasn't arrived yet. Use it to show a
   * loader instead of flashing an empty state on reload.
   */
  loading: boolean;
  /** True while signed in (data is backed by the cloud, not localStorage). */
  isCloud: boolean;
  /** Pending first-sign-in conflict between local and cloud data, if any. */
  pendingMerge: MergeConflict | null;
  resolveMerge: (choice: "merge" | "cloud" | "local") => void;
}

function hasData(s: CalculatorState): boolean {
  return s.subjects.length > 0 || s.semesters.length > 0;
}

function sameState(a: CalculatorState, b: CalculatorState): boolean {
  return (
    JSON.stringify(a.subjects) === JSON.stringify(b.subjects) &&
    JSON.stringify(a.semesters) === JSON.stringify(b.semesters)
  );
}

function byId<T extends { id: string }>(local: T[], cloud: T[]): T[] {
  const map = new Map<string, T>();
  // Cloud first, then local overrides — local is what the user sees right now.
  for (const item of cloud) map.set(item.id, item);
  for (const item of local) map.set(item.id, item);
  return [...map.values()];
}

function mergeStates(local: CalculatorState, cloud: CalculatorState): CalculatorState {
  return {
    subjects: byId(local.subjects, cloud.subjects),
    semesters: byId(local.semesters, cloud.semesters),
    autosave: cloud.autosave,
  };
}

/**
 * Unified persistence for the calculator. When signed out, data lives in
 * localStorage (unchanged guest behavior). When signed in, data lives in
 * Firestore with live sync + debounced writes, and a one-time merge prompt
 * reconciles any conflicting local data on first sign-in.
 */
export function useCalculatorData(): UseCalculatorData {
  const { user, loading: authLoading } = useAuth();
  const uid = user?.uid ?? null;

  // ── Guest store (localStorage) — also the merge source on first login. ─────
  const [lsAutosave, setLsAutosave] = useLocalStorage<boolean>(
    AUTOSAVE_KEY,
    true,
    { enabled: true },
  );
  const [lsSubjects, setLsSubjects, removeLsSubjects] = useLocalStorage<Subject[]>(
    SUBJECTS_KEY,
    [],
    { enabled: lsAutosave },
  );
  const [lsSemesters, setLsSemesters] = useLocalStorage<Semester[]>(
    SEMESTERS_KEY,
    [],
    { enabled: true },
  );

  // ── Cloud store ────────────────────────────────────────────────────────────
  const [cloud, setCloud] = useState<CalculatorState>({
    subjects: [],
    semesters: [],
    autosave: true,
  });
  const [pendingMerge, setPendingMerge] = useState<MergeConflict | null>(null);
  // Whether the first cloud snapshot has arrived (only meaningful when signed in).
  const [cloudReady, setCloudReady] = useState(false);

  // Latest localStorage values, readable inside the subscription callback
  // without making it a dependency (which would re-subscribe on every edit).
  const lsRef = useRef<CalculatorState>({
    subjects: lsSubjects,
    semesters: lsSemesters,
    autosave: lsAutosave,
  });
  useEffect(() => {
    lsRef.current = {
      subjects: lsSubjects,
      semesters: lsSemesters,
      autosave: lsAutosave,
    };
  }, [lsSubjects, lsSemesters, lsAutosave]);

  const autosaveRef = useRef(true);
  useEffect(() => {
    autosaveRef.current = uid ? cloud.autosave : lsAutosave;
  }, [uid, cloud.autosave, lsAutosave]);

  const cloudInitedRef = useRef(false);
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uidRef = useRef<string | null>(uid);
  useEffect(() => {
    uidRef.current = uid;
  }, [uid]);

  // Persist a state to the cloud (debounced). When autosave is off, subjects
  // are omitted so the cloud keeps its last saved set (mirrors guest behavior).
  const scheduleCloudWrite = useCallback((next: CalculatorState) => {
    const currentUid = uidRef.current;
    if (!currentUid) return;
    if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    writeTimerRef.current = setTimeout(() => {
      const payload: Partial<CalculatorState> = next.autosave
        ? next
        : { semesters: next.semesters, autosave: next.autosave };
      writeCalculatorState(currentUid, payload).catch((err) =>
        console.error("[useCalculatorData] cloud write failed:", err),
      );
    }, CLOUD_WRITE_DEBOUNCE_MS);
  }, []);

  // ── Cloud subscription (per signed-in user) ────────────────────────────────
  useEffect(() => {
    setCloudReady(false);
    if (!uid) {
      cloudInitedRef.current = false;
      setPendingMerge(null);
      return;
    }

    const unsub = subscribeCalculatorState(uid, (incoming, meta) => {
      if (!cloudInitedRef.current) {
        cloudInitedRef.current = true;
        setCloudReady(true);
        const local = lsRef.current;

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
          writeCalculatorState(uid, local).catch((err) =>
            console.error("[useCalculatorData] initial push failed:", err),
          );
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
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    };
  }, [uid]);

  // ── Cloud setters (mirror the useState dispatcher API) ─────────────────────
  const cloudSetSubjects = useCallback<Dispatch<SetStateAction<Subject[]>>>(
    (value) => {
      setCloud((prev) => {
        const subjects =
          typeof value === "function"
            ? (value as (p: Subject[]) => Subject[])(prev.subjects)
            : value;
        const next = { ...prev, subjects };
        scheduleCloudWrite(next);
        return next;
      });
    },
    [scheduleCloudWrite],
  );

  const cloudSetSemesters = useCallback<Dispatch<SetStateAction<Semester[]>>>(
    (value) => {
      setCloud((prev) => {
        const semesters =
          typeof value === "function"
            ? (value as (p: Semester[]) => Semester[])(prev.semesters)
            : value;
        const next = { ...prev, semesters };
        scheduleCloudWrite(next);
        return next;
      });
    },
    [scheduleCloudWrite],
  );

  const cloudSetAutosave = useCallback<Dispatch<SetStateAction<boolean>>>(
    (value) => {
      setCloud((prev) => {
        const autosave =
          typeof value === "function"
            ? (value as (p: boolean) => boolean)(prev.autosave)
            : value;
        const next = { ...prev, autosave };
        scheduleCloudWrite(next);
        return next;
      });
    },
    [scheduleCloudWrite],
  );

  const cloudRemoveSubjects = useCallback(() => {
    setCloud((prev) => {
      const next = { ...prev, subjects: [] };
      // Removing is explicit — always persist, regardless of autosave. Write the
      // FULL next state (not just { subjects: [] }) so that a semester saved in
      // the same tick isn't lost: "Save semester" adds the semester (scheduling
      // a debounced write) and then immediately resets subjects via this fn —
      // which cancels that pending write. `prev` already includes the new
      // semester, so writing `next` persists both the semester and the reset.
      if (uidRef.current) {
        if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
        writeCalculatorState(uidRef.current, next).catch((err) =>
          console.error("[useCalculatorData] remove failed:", err),
        );
      }
      return next;
    });
  }, []);

  // ── replaceAll / persistNow ────────────────────────────────────────────────
  const replaceAll = useCallback(
    (state: CalculatorState) => {
      if (uidRef.current) {
        setCloud(state);
        if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
        writeCalculatorState(uidRef.current, state).catch((err) =>
          console.error("[useCalculatorData] replaceAll failed:", err),
        );
      } else {
        setLsAutosave(state.autosave);
        setLsSubjects(state.subjects);
        setLsSemesters(state.semesters);
      }
    },
    [setLsAutosave, setLsSubjects, setLsSemesters],
  );

  const persistNow = useCallback(() => {
    if (uidRef.current) {
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
      writeCalculatorState(uidRef.current, cloud).catch((err) =>
        console.error("[useCalculatorData] persistNow failed:", err),
      );
    } else {
      // Guest manual save — write subjects even when autosave gating is off.
      setLsSubjects(lsRef.current.subjects);
      setLsSemesters(lsRef.current.semesters);
    }
  }, [cloud, setLsSubjects, setLsSemesters]);

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
        writeCalculatorState(uidRef.current, result).catch((err) =>
          console.error("[useCalculatorData] merge resolve failed:", err),
        );
        markReconciled(uidRef.current);
        return null;
      });
    },
    [],
  );

  // Loading while auth is still resolving, or (signed in) until the first
  // cloud snapshot arrives — so the UI can show a loader instead of an empty
  // flash on reload.
  const loading = authLoading || (uid !== null && !cloudReady);

  // ── Unified facade ─────────────────────────────────────────────────────────
  if (uid) {
    return {
      subjects: cloud.subjects,
      setSubjects: cloudSetSubjects,
      removeSubjects: cloudRemoveSubjects,
      semesters: cloud.semesters,
      setSemesters: cloudSetSemesters,
      autosave: cloud.autosave,
      setAutosave: cloudSetAutosave,
      replaceAll,
      persistNow,
      loading,
      isCloud: true,
      pendingMerge,
      resolveMerge,
    };
  }

  return {
    subjects: lsSubjects,
    setSubjects: setLsSubjects,
    removeSubjects: removeLsSubjects,
    semesters: lsSemesters,
    setSemesters: setLsSemesters,
    autosave: lsAutosave,
    setAutosave: setLsAutosave,
    replaceAll,
    persistNow,
    loading,
    isCloud: false,
    pendingMerge: null,
    resolveMerge,
  };
}
