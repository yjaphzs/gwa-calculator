import { sortOldestFirst } from "@/features/semesters/lib/semesters";
import {
  HONOR_MIN_UNITS,
  PASSING_GRADE_MAX,
  computeGwa,
  countsTowardGwa,
  getHonorFor,
  getLatinHonorFor,
} from "@/lib/academic";
import { termImprovement } from "@/lib/gwa-insights";
import type { Semester, Subject } from "@/types";

export interface TermStats {
  units: number;
  honor: string | null;
  /** 12+ units and every counted grade passing. */
  clean: boolean;
}

/** What the badges are judged on: saved terms in calendar order, plus the working subjects. */
export interface BadgeStats {
  /** Subjects ever entered: working and saved. */
  subjects: number;
  terms: TermStats[];
  /** Each term against the one before it (null when either is too small to compare). */
  jumps: (number | null)[];
  cumulativeUnits: number;
  latinHonor: string | null;
  /** Counted subjects with a 1.00, working and saved. */
  unos: number;
}

export function badgeStats(subjects: Subject[], semesters: Semester[]): BadgeStats {
  const ordered = sortOldestFirst(semesters);
  const saved = ordered.flatMap((s) => s.subjects);
  const terms = ordered.map(({ subjects: list }) => {
    const { totalUnits } = computeGwa(list);
    return {
      units: totalUnits,
      honor: getHonorFor(list),
      clean: totalUnits >= HONOR_MIN_UNITS && list.filter(countsTowardGwa).every((s) => s.grade <= PASSING_GRADE_MAX),
    };
  });
  return {
    subjects: subjects.length + saved.length,
    terms,
    jumps: ordered.slice(1).map((term, i) => termImprovement(ordered[i].subjects, term.subjects)),
    cumulativeUnits: computeGwa(saved).totalUnits,
    latinHonor: getLatinHonorFor(saved),
    unos: [...subjects, ...saved].filter((s) => countsTowardGwa(s) && s.grade === 1).length,
  };
}

/** The longest run of `true` in a row. */
export function longestRun(flags: boolean[]): number {
  let best = 0;
  let run = 0;
  for (const flag of flags) {
    run = flag ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}
