import { SUBJECT_MARKS } from "@/lib/academic";
import type { CalculatorState, Semester, Subject } from "@/types";

const MARKS = new Set<string>(SUBJECT_MARKS.map((m) => m.value));

export function isValidSubject(subject: any): subject is Subject {
  return (
    !!subject &&
    typeof subject.id === "string" &&
    typeof subject.code === "string" &&
    typeof subject.title === "string" &&
    typeof subject.grade === "number" &&
    typeof subject.units === "number" &&
    (subject.excluded === undefined || typeof subject.excluded === "boolean") &&
    (subject.mark === undefined || MARKS.has(subject.mark))
  );
}

export function isValidSemester(semester: any): semester is Semester {
  return (
    !!semester &&
    typeof semester.id === "string" &&
    typeof semester.schoolYear === "string" &&
    typeof semester.semester === "string" &&
    Array.isArray(semester.subjects) &&
    semester.subjects.every(isValidSubject)
  );
}

/**
 * Validate parsed JSON from an export file (or QR payload) and normalize it to
 * a `CalculatorState`. Throws an `Error` whose message is safe to show the user.
 */
export function parseCalculatorImport(data: any): CalculatorState {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid file structure.");
  }

  if (!Array.isArray(data.subjects) || !data.subjects.every(isValidSubject)) {
    throw new Error("Missing or invalid 'subjects' array.");
  }

  if (!Array.isArray(data.semesters) || !data.semesters.every(isValidSemester)) {
    throw new Error("Missing or invalid 'semesters' array.");
  }

  // autosave field may be absent in older exports — default to true
  const autosave = typeof data.autosave === "boolean" ? data.autosave : true;

  return { subjects: data.subjects, semesters: data.semesters, autosave };
}
