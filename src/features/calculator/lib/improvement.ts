import { latestTerm, previousTerm, shortTermLabel } from "@/features/semesters/lib/semesters";
import { termImprovement } from "@/lib/gwa-insights";
import type { Semester, Subject } from "@/types";

/** A better GWA than an earlier term: by how much, and which term ("2nd 2024–25"). */
export interface Improvement {
  delta: number;
  term: string;
}

const better = (delta: number | null, term: Semester): Improvement | null =>
  delta !== null && delta > 0 ? { delta, term: shortTermLabel(term) } : null;

/** The working subjects against the latest saved term. */
export function workingSetImprovement(subjects: Subject[], semesters: Semester[]): Improvement | null {
  const latest = latestTerm(semesters);
  return latest ? better(termImprovement(latest.subjects, subjects), latest) : null;
}

/** A saved term against the term just before it. */
export function savedTermImprovement(semesters: Semester[], semester: Semester): Improvement | null {
  const before = previousTerm(semesters, semester);
  return before ? better(termImprovement(before.subjects, semester.subjects), before) : null;
}

/** "0.18", "0.183", "0.2": the change without trailing zeros, for friendly copy. */
export const formatDelta = (delta: number) => delta.toFixed(3).replace(/\.?0+$/, "");
