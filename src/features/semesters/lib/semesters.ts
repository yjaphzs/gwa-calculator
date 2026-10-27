import type { Semester } from "@/types";

/** Terms a semester can be saved as, in calendar order. */
export const SEMESTER_TERMS = ["First", "Second", "Third"] as const;

const TERM_ORDER: Record<string, number> = { First: 1, Second: 2, Third: 3 };

function startYear(semester: Semester): number {
  return parseInt(semester.schoolYear.split("-")[0], 10) || 0;
}

function compareChronologically(a: Semester, b: Semester): number {
  const byYear = startYear(a) - startYear(b);
  if (byYear !== 0) return byYear;
  return (TERM_ORDER[a.semester] ?? 0) - (TERM_ORDER[b.semester] ?? 0);
}

/** Oldest first — reports read like a record, earliest term on top. */
export function sortOldestFirst(semesters: Semester[]): Semester[] {
  return [...semesters].sort(compareChronologically);
}

/** Newest first — the Semesters tab shows the latest term on top. */
export function sortNewestFirst(semesters: Semester[]): Semester[] {
  return [...semesters].sort((a, b) => compareChronologically(b, a));
}

/** e.g. "First Semester, S.Y. 2025-2026" */
export function formatTermLabel(semester: Pick<Semester, "semester" | "schoolYear">): string {
  return `${semester.semester} Semester, S.Y. ${semester.schoolYear}`;
}

const TERM_SHORT: Record<string, string> = { First: "1st", Second: "2nd", Third: "3rd" };

/** Compact label for chart axes: "First" + "2024-2025" → "1st 2024–25". */
export function shortTermLabel(semester: Pick<Semester, "semester" | "schoolYear">): string {
  const years = semester.schoolYear.match(/^(\d{4})-\d{2}(\d{2})$/);
  const sy = years ? `${years[1]}–${years[2]}` : semester.schoolYear;
  return `${TERM_SHORT[semester.semester] ?? semester.semester} ${sy}`;
}

/** School years ending with the current one, newest first: "2026-2027", … */
export function generateSchoolYears(count: number, now = new Date()): string[] {
  const currentYear = now.getFullYear();
  return Array.from({ length: count }, (_, i) => {
    const from = currentYear - i;
    return `${from}-${from + 1}`;
  });
}

/** Whether another semester already uses this term + school year. */
export function isDuplicateTerm(
  semesters: Semester[],
  term: string,
  schoolYear: string,
  ignoreId?: string,
): boolean {
  return semesters.some(
    (s) => s.semester === term && s.schoolYear === schoolYear && s.id !== ignoreId,
  );
}
