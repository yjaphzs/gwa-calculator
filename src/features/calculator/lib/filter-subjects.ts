import type { Subject } from "@/types";

/** Case-insensitive match on code or title; plain substring match on grade/units. */
export function filterSubjects(subjects: Subject[], search: string): Subject[] {
  const needle = search.toLowerCase();
  return subjects.filter(
    (subject) =>
      subject.code.toLowerCase().includes(needle) ||
      subject.title.toLowerCase().includes(needle) ||
      subject.grade.toFixed(3).includes(search) ||
      subject.units.toString().includes(search),
  );
}
