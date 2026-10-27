import { describe, expect, it } from "vitest";

import {
  formatTermLabel,
  generateSchoolYears,
  isDuplicateTerm,
  sortNewestFirst,
  sortOldestFirst,
} from "@/features/semesters/lib/semesters";
import type { Semester } from "@/types";

const sem = (id: string, semester: string, schoolYear: string): Semester => ({
  id,
  semester,
  schoolYear,
  subjects: [],
});

const semesters = [
  sem("b", "Second", "2024-2025"),
  sem("c", "First", "2025-2026"),
  sem("a", "First", "2024-2025"),
  sem("d", "Third", "2024-2025"),
];

describe("semester sorting", () => {
  it("sorts oldest first by year then term", () => {
    expect(sortOldestFirst(semesters).map((s) => s.id)).toEqual(["a", "b", "d", "c"]);
  });

  it("sorts newest first by year then term", () => {
    expect(sortNewestFirst(semesters).map((s) => s.id)).toEqual(["c", "d", "b", "a"]);
  });

  it("does not mutate the input", () => {
    const copy = [...semesters];
    sortOldestFirst(semesters);
    expect(semesters).toEqual(copy);
  });
});

describe("formatTermLabel", () => {
  it("formats the period label used by reports", () => {
    expect(formatTermLabel(sem("x", "First", "2025-2026"))).toBe(
      "First Semester, S.Y. 2025-2026",
    );
  });
});

describe("generateSchoolYears", () => {
  it("lists school years ending with the current one", () => {
    expect(generateSchoolYears(3, new Date(2026, 9, 28))).toEqual([
      "2026-2027",
      "2025-2026",
      "2024-2025",
    ]);
  });
});

describe("isDuplicateTerm", () => {
  it("detects an existing term + year, ignoring the semester being edited", () => {
    expect(isDuplicateTerm(semesters, "First", "2024-2025")).toBe(true);
    expect(isDuplicateTerm(semesters, "First", "2024-2025", "a")).toBe(false);
    expect(isDuplicateTerm(semesters, "Third", "2025-2026")).toBe(false);
  });
});
