"use client";

import { useCallback } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { CalculatorState, Semester, Subject } from "@/types";

const SUBJECTS_KEY =
  process.env.NEXT_PUBLIC_APP_LOCAL_STORAGE_SUBJECTS_KEY || "gwa_subjects";
const SEMESTERS_KEY =
  process.env.NEXT_PUBLIC_APP_LOCAL_STORAGE_SEMESTERS_KEY || "gwa_semesters";
const AUTOSAVE_KEY =
  process.env.NEXT_PUBLIC_APP_LOCAL_STORAGE_AUTOSAVE_KEY || "gwa_autosave";

/**
 * Guest store (localStorage) — the signed-out data, and the merge source on
 * first login. Subjects are only written while autosave is on.
 */
export function useGuestCalculatorStore() {
  const [autosave, setAutosave] = useLocalStorage<boolean>(AUTOSAVE_KEY, true, {
    enabled: true,
  });
  const [subjects, setSubjects, removeSubjects] = useLocalStorage<Subject[]>(SUBJECTS_KEY, [], {
    enabled: autosave,
  });
  const [semesters, setSemesters] = useLocalStorage<Semester[]>(SEMESTERS_KEY, [], {
    enabled: true,
  });

  const replaceAll = useCallback(
    (state: CalculatorState) => {
      setAutosave(state.autosave);
      setSubjects(state.subjects);
      setSemesters(state.semesters);
    },
    [setAutosave, setSubjects, setSemesters],
  );

  // Guest manual save — write subjects even when autosave gating is off.
  const persistNow = useCallback(() => {
    setSubjects(subjects);
    setSemesters(semesters);
  }, [subjects, semesters, setSubjects, setSemesters]);

  return {
    subjects,
    setSubjects,
    removeSubjects,
    semesters,
    setSemesters,
    autosave,
    setAutosave,
    replaceAll,
    persistNow,
  };
}
