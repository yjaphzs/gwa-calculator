import type { Semester, Subject } from "@/types";

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

/** The latest saved term by calendar (not by when it was saved), or null. */
export function latestTerm(semesters: Semester[]): Semester | null {
  return sortNewestFirst(semesters)[0] ?? null;
}

/** The saved term just before `semester` in calendar order, or null for the earliest. */
export function previousTerm(semesters: Semester[], semester: Semester): Semester | null {
  const ordered = sortOldestFirst([...semesters.filter((s) => s.id !== semester.id), semester]);
  return ordered[ordered.indexOf(semester) - 1] ?? null;
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

/** Replace one subject (matched by id) inside one saved semester; everything else is untouched. */
export function replaceSemesterSubject(
  semesters: Semester[],
  semesterId: string,
  subject: Subject,
): Semester[] {
  return semesters.map((semester) =>
    semester.id === semesterId
      ? { ...semester, subjects: semester.subjects.map((s) => (s.id === subject.id ? subject : s)) }
      : semester,
  );
}

/** Change one semester's subject list; everything else is untouched. */
function withSubjects(semesters: Semester[], semesterId: string, change: (subjects: Subject[]) => Subject[]): Semester[] {
  return semesters.map((semester) => (semester.id === semesterId ? { ...semester, subjects: change(semester.subjects) } : semester));
}

/** Add a subject to the end of one saved semester (a late grade, or one that was missed). */
export function addSemesterSubject(semesters: Semester[], semesterId: string, subject: Subject): Semester[] {
  return withSubjects(semesters, semesterId, (subjects) => [...subjects, subject]);
}

/**
 * Remove one subject from a saved semester. A semester keeps at least one
 * subject (delete the semester instead), so removing the last one changes nothing.
 */
export function removeSemesterSubject(semesters: Semester[], semesterId: string, subjectId: string): Semester[] {
  return withSubjects(semesters, semesterId, (subjects) =>
    subjects.length > 1 ? subjects.filter((s) => s.id !== subjectId) : subjects,
  );
}

/** Put a removed subject back where it was (Undo), unless it's already there. */
export function restoreSemesterSubject(semesters: Semester[], semesterId: string, subject: Subject, index: number): Semester[] {
  return withSubjects(semesters, semesterId, (subjects) => {
    if (subjects.some((s) => s.id === subject.id)) return subjects;
    const at = index < 0 || index > subjects.length ? subjects.length : index;
    return [...subjects.slice(0, at), subject, ...subjects.slice(at)];
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
