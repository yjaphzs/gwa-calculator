import { SUBJECT_MARKS, type SubjectMark } from "@/lib/academic";
import type { Subject } from "@/types";

/** How a subject relates to the GWA: graded, excluded by policy, or an INC/DRP/W mark. */
export type SubjectStatus = "graded" | "excluded" | SubjectMark;

export const STATUS_OPTIONS: { value: SubjectStatus; label: string }[] = [
  { value: "graded", label: "Counts toward GWA" },
  { value: "excluded", label: "Not counted (e.g. NSTP, PE)" },
  ...SUBJECT_MARKS.map((m) => ({ value: m.value, label: `${m.value} (${m.label.toLowerCase()})` })),
];

export function statusOf(subject: Pick<Subject, "excluded" | "mark">): SubjectStatus {
  return subject.mark ?? (subject.excluded ? "excluded" : "graded");
}

export function isMark(status: SubjectStatus): status is SubjectMark {
  return status !== "graded" && status !== "excluded";
}

/** Short label for a subject that doesn't count, or null when it does. */
export function notCountedLabel(subject: Pick<Subject, "excluded" | "mark">): string | null {
  if (subject.mark) return SUBJECT_MARKS.find((m) => m.value === subject.mark)?.label ?? subject.mark;
  return subject.excluded ? "Not counted" : null;
}

/**
 * Build a subject without undefined keys (Firestore rejects them): the flags
 * are only present when set, and marked subjects store a grade of 0.
 */
export function buildSubject(
  id: string,
  values: { code: string; title: string; grade: number; units: number; status: SubjectStatus },
): Subject {
  const mark = isMark(values.status) ? values.status : undefined;
  const subject: Subject = {
    id,
    code: values.code,
    title: values.title,
    grade: mark ? 0 : values.grade,
    units: values.units,
  };
  if (values.status === "excluded") subject.excluded = true;
  if (mark) subject.mark = mark;
  return subject;
}
