"use client";

import { useMemo, type Dispatch, type SetStateAction } from "react";

import { useAuth } from "@/context/auth-provider";
import { useCloudCalculatorStore } from "@/features/persistence/hooks/use-cloud-calculator-store";
import { useGuestCalculatorStore } from "@/features/persistence/hooks/use-guest-calculator-store";
import type { MergeConflict } from "@/features/persistence/lib/calculator-state";
import { useLatest } from "@/hooks/use-latest";
import type { CalculatorState, Semester, Subject } from "@/types";

export type { MergeConflict };

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

/**
 * Unified persistence for the calculator. When signed out, data lives in
 * localStorage (unchanged guest behavior). When signed in, data lives in
 * Firestore with live sync + debounced writes, and a one-time merge prompt
 * reconciles any conflicting local data on first sign-in.
 *
 * Both stores are always mounted (rules of hooks); `uid` picks which one the
 * caller sees.
 */
export function useCalculatorData(): UseCalculatorData {
  const { user, loading: authLoading } = useAuth();
  const uid = user?.uid ?? null;

  const guest = useGuestCalculatorStore();

  // Latest localStorage values, readable inside the subscription callback
  // without making it a dependency (which would re-subscribe on every edit).
  const local = useMemo<CalculatorState>(
    () => ({ subjects: guest.subjects, semesters: guest.semesters, autosave: guest.autosave }),
    [guest.subjects, guest.semesters, guest.autosave],
  );
  const localRef = useLatest(local);

  const cloud = useCloudCalculatorStore(uid, localRef);

  // Loading while auth is still resolving, or (signed in) until the first
  // cloud snapshot arrives — so the UI can show a loader instead of an empty
  // flash on reload.
  const loading = authLoading || (uid !== null && !cloud.ready);

  if (uid) {
    return {
      subjects: cloud.state.subjects,
      setSubjects: cloud.setSubjects,
      removeSubjects: cloud.removeSubjects,
      semesters: cloud.state.semesters,
      setSemesters: cloud.setSemesters,
      autosave: cloud.state.autosave,
      setAutosave: cloud.setAutosave,
      replaceAll: cloud.replaceAll,
      persistNow: cloud.persistNow,
      loading,
      isCloud: true,
      pendingMerge: cloud.pendingMerge,
      resolveMerge: cloud.resolveMerge,
    };
  }

  return {
    subjects: guest.subjects,
    setSubjects: guest.setSubjects,
    removeSubjects: guest.removeSubjects,
    semesters: guest.semesters,
    setSemesters: guest.setSemesters,
    autosave: guest.autosave,
    setAutosave: guest.setAutosave,
    replaceAll: guest.replaceAll,
    persistNow: guest.persistNow,
    loading,
    isCloud: false,
    pendingMerge: null,
    resolveMerge: cloud.resolveMerge,
  };
}
