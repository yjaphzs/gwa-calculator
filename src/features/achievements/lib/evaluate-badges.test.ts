import { describe, expect, it } from "vitest";

import { BADGES } from "@/features/achievements/content/badges";
import type { Semester, Subject } from "@/types";
import { longestRun } from "./badge-stats";
import { evaluateBadges } from "./evaluate-badges";

let n = 0;
const sub = (grade: number, units = 3, extra: Partial<Subject> = {}): Subject => ({
  id: `s${++n}`,
  code: `C${n}`,
  title: `T${n}`,
  grade,
  units,
  ...extra,
});
const many = (count: number, grade: number, units = 3) => Array.from({ length: count }, () => sub(grade, units));
const term = (semester: string, schoolYear: string, subjects: Subject[]): Semester => ({ id: `${semester}-${schoolYear}`, semester, schoolYear, subjects });
const earned = (subjects: Subject[], semesters: Semester[]) =>
  evaluateBadges(subjects, semesters).filter((s) => s.earned).map((s) => s.badge.id);

describe("evaluateBadges", () => {
  it("covers every badge, and a fresh start earns none", () => {
    const all = evaluateBadges([], []);
    expect(all.map((s) => s.badge.id)).toEqual(BADGES.map((b) => b.id));
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
    expect(earned([], [])).toEqual([]);
    expect(all.find((s) => s.badge.id === "full-load")?.progress.label).toBe("0 of 21 units");
  });

  it("awards a full journey: loads, honors, jumps, unos and units", () => {
    // Saved out of calendar order on purpose.
    const semesters = [
      term("Second", "2023-2024", many(7, 1.75)), // 21 units, College Scholar
      term("First", "2023-2024", many(8, 2.25)), // 24 units, no honor
      term("First", "2024-2025", many(7, 1.5)), // University Scholar
      term("Second", "2024-2025", [...many(6, 1.25), sub(1.0), sub(1.0)]), // better again
    ];
    const ids = earned([sub(1.0), sub(1.0), sub(1.0)], semesters);
    expect(ids).toEqual(
      expect.arrayContaining([
        "first-steps", "semester-one", "uno", "uno-collector", "on-the-list", "top-band", "full-load", "survivor",
        "clean-sheet", "comeback", "glow-up", "scholar-streak", "steady", "halfway", "latin-track",
      ]),
    );
    expect(ids).not.toContain("home-stretch");
  });

  it("breaks streaks on a term without an honor, and needs 12 units to compare terms", () => {
    const semesters = [
      term("First", "2023-2024", many(4, 1.5)),
      term("Second", "2023-2024", many(4, 2.5)),
      term("First", "2024-2025", many(4, 1.5)),
      term("Second", "2024-2025", many(3, 1.0)), // 9 units: no honor, no comparison
    ];
    const statuses = evaluateBadges([], semesters);
    const get = (id: string) => statuses.find((s) => s.badge.id === id)!;
    expect(get("scholar-streak").earned).toBe(false);
    expect(get("scholar-streak").progress.label).toBe("1 of 3 in a row");
    expect(get("comeback").earned).toBe(true); // 2.5 -> 1.5
    expect(get("glow-up").progress.label).toBe("1 of 3 in a row");
  });

  it("counts a failing or conditional grade against a clean sheet, but not uncounted subjects", () => {
    const failing = term("First", "2024-2025", [...many(3, 2.0), sub(5.0)]);
    const marked = term("Second", "2024-2025", [...many(4, 2.0), sub(0, 3, { mark: "INC" })]);
    expect(earned([], [failing])).not.toContain("clean-sheet");
    expect(earned([], [marked])).toContain("clean-sheet");
  });
});

describe("longestRun", () => {
  it("finds the longest streak", () => {
    expect(longestRun([])).toBe(0);
    expect(longestRun([true, true, false, true, true, true, false])).toBe(3);
  });
});
