import { GRADE_OPTIONS, computeGwa, getHonorFor } from "@/lib/academic";
import type { Subject } from "@/types";

/** Pretend grades by subject id. Nothing here is ever saved. */
export type GradeOverrides = Record<string, number>;

/** The subjects with the pretend grades swapped in; everything else stays as it is. */
export function applyOverrides(subjects: Subject[], overrides: GradeOverrides): Subject[] {
  return subjects.map((s) => (s.id in overrides ? { ...s, grade: overrides[s.id] } : s));
}

/** GWA, units, and honor if those grades were different. */
export function simulate(subjects: Subject[], overrides: GradeOverrides) {
  const changed = applyOverrides(subjects, overrides);
  const { gwa, totalUnits } = computeGwa(changed);
  return { gwa, totalUnits, honor: getHonorFor(changed) };
}

/** The slider position for a grade: the nearest grade the form offers (imports may carry others). */
export function gradeStep(grade: number): number {
  let best = 0;
  GRADE_OPTIONS.forEach((option, i) => {
    if (Math.abs(option - grade) < Math.abs(GRADE_OPTIONS[best] - grade)) best = i;
  });
  return best;
}
