import type { CalculatorState } from "@/types";

/** Starting state for a fresh store (no subjects, no semesters, autosave on). */
export const EMPTY_CALCULATOR_STATE: CalculatorState = {
  subjects: [],
  semesters: [],
  autosave: true,
};

// Per-account flag (localStorage) marking that the one-time local↔cloud
// reconciliation has already happened on this device, so the merge prompt is
// never shown again for this account on this browser.
const RECONCILED_KEY_PREFIX = "gwa_reconciled_";

export function isReconciled(uid: string): boolean {
  try {
    return localStorage.getItem(RECONCILED_KEY_PREFIX + uid) === "true";
  } catch {
    return false;
  }
}

export function markReconciled(uid: string): void {
  try {
    localStorage.setItem(RECONCILED_KEY_PREFIX + uid, "true");
  } catch {
    /* ignore */
  }
}

/** A first-sign-in conflict between this device's guest data and the cloud. */
export interface MergeConflict {
  local: CalculatorState;
  cloud: CalculatorState;
}

export function hasData(s: CalculatorState): boolean {
  return s.subjects.length > 0 || s.semesters.length > 0;
}

export function sameState(a: CalculatorState, b: CalculatorState): boolean {
  return (
    JSON.stringify(a.subjects) === JSON.stringify(b.subjects) &&
    JSON.stringify(a.semesters) === JSON.stringify(b.semesters)
  );
}

export function byId<T extends { id: string }>(local: T[], cloud: T[]): T[] {
  const map = new Map<string, T>();
  // Cloud first, then local overrides — local is what the user sees right now.
  for (const item of cloud) map.set(item.id, item);
  for (const item of local) map.set(item.id, item);
  return [...map.values()];
}

export function mergeStates(local: CalculatorState, cloud: CalculatorState): CalculatorState {
  return {
    subjects: byId(local.subjects, cloud.subjects),
    semesters: byId(local.semesters, cloud.semesters),
    autosave: cloud.autosave,
  };
}
