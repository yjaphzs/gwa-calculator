import { shortTermLabel, sortOldestFirst } from "@/features/semesters/lib/semesters";
import { computeGwa, countsTowardGwa, getHonorFor, getLatinHonorFor } from "@/lib/academic";
import { gwaImprovement, termImprovement } from "@/lib/gwa-insights";
import type { Semester, Subject } from "@/types";

export interface WrappedTerm {
  /** "1st 2024–25" */
  label: string;
  gwa: number | null;
  honor: string | null;
}

/** A school year in review, from the user's saved semesters. */
export interface WrappedSummary {
  schoolYear: string;
  terms: WrappedTerm[];
  gwa: number | null;
  units: number;
  /** Counted subjects. */
  subjects: number;
  best: Pick<Subject, "code" | "title" | "grade" | "units"> | null;
  unos: number;
  /** The biggest improvement from one term to the next (the year's first term against the term before it, too). */
  bestJump: { from: string; to: string; delta: number } | null;
  /** This year's GWA against the year before; positive is better. */
  versusLastYear: number | null;
  /** Latin honor standing at the end of this year (all semesters up to it). */
  latin: string | null;
}

const startYear = (schoolYear: string) => parseInt(schoolYear, 10) || 0;

/** School years with at least two saved semesters, newest first. */
export function wrappedYears(semesters: Semester[]): string[] {
  const counts = new Map<string, number>();
  for (const s of semesters) counts.set(s.schoolYear, (counts.get(s.schoolYear) ?? 0) + 1);
  return [...counts].filter(([, n]) => n >= 2).map(([year]) => year).sort((a, b) => startYear(b) - startYear(a));
}

/** Lowest grade wins; more units break a tie. */
function bestSubject(subjects: Subject[]): WrappedSummary["best"] {
  const counted = subjects.filter(countsTowardGwa);
  if (counted.length === 0) return null;
  const top = [...counted].sort((a, b) => a.grade - b.grade || b.units - a.units)[0];
  return { code: top.code, title: top.title, grade: top.grade, units: top.units };
}

export function buildWrapped(semesters: Semester[], schoolYear: string): WrappedSummary | null {
  const ordered = sortOldestFirst(semesters);
  const year = ordered.filter((s) => s.schoolYear === schoolYear);
  if (year.length < 2) return null;
  const subjects = year.flatMap((s) => s.subjects);
  const { gwa, totalUnits } = computeGwa(subjects);

  let bestJump: WrappedSummary["bestJump"] = null;
  for (const term of year) {
    const index = ordered.indexOf(term);
    const before = ordered[index - 1];
    const delta = before ? termImprovement(before.subjects, term.subjects) : null;
    if (before && delta !== null && delta > 0 && delta > (bestJump?.delta ?? 0)) {
      bestJump = { from: shortTermLabel(before), to: shortTermLabel(term), delta };
    }
  }

  const lastYear = ordered.filter((s) => startYear(s.schoolYear) === startYear(schoolYear) - 1).flatMap((s) => s.subjects);
  const upToNow = ordered.filter((s) => startYear(s.schoolYear) <= startYear(schoolYear)).flatMap((s) => s.subjects);

  return {
    schoolYear,
    terms: year.map((s) => ({ label: shortTermLabel(s), gwa: computeGwa(s.subjects).gwa, honor: getHonorFor(s.subjects) })),
    gwa,
    units: totalUnits,
    subjects: subjects.filter(countsTowardGwa).length,
    best: bestSubject(subjects),
    unos: subjects.filter((s) => countsTowardGwa(s) && s.grade === 1).length,
    bestJump,
    versusLastYear: lastYear.length ? gwaImprovement(computeGwa(lastYear).gwa, gwa) : null,
    latin: getLatinHonorFor(upToNow),
  };
}

/** "2024-2025" → "2024–25" */
export function shortYear(schoolYear: string): string {
  const years = schoolYear.match(/^(\d{4})-\d{2}(\d{2})$/);
  return years ? `${years[1]}–${years[2]}` : schoolYear;
}
