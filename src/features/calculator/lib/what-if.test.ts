import { describe, expect, it } from "vitest";

import { GRADE_OPTIONS } from "@/lib/academic";
import type { Subject } from "@/types";
import { applyOverrides, gradeStep, simulate } from "./what-if";

const subjects: Subject[] = [
  { id: "a", code: "A", title: "A", grade: 2.0, units: 3 },
  { id: "b", code: "B", title: "B", grade: 2.0, units: 3 },
  { id: "c", code: "C", title: "C", grade: 1.75, units: 3 },
  { id: "d", code: "D", title: "D", grade: 1.75, units: 3 },
  { id: "e", code: "E", title: "E", grade: 0, units: 3, mark: "INC" },
];

describe("what if", () => {
  it("swaps in pretend grades without touching the originals", () => {
    const changed = applyOverrides(subjects, { a: 1.0 });
    expect(changed[0].grade).toBe(1.0);
    expect(subjects[0].grade).toBe(2.0);
    expect(changed[1]).toBe(subjects[1]);
  });

  it("recomputes the GWA and honor with the app's rules", () => {
    expect(simulate(subjects, {})).toMatchObject({ gwa: 1.875, totalUnits: 12, honor: "Dean's Lister" });
    expect(simulate(subjects, { a: 1.0, b: 1.0 })).toMatchObject({ gwa: 1.375, honor: "University Scholar" });
    // A marked subject stays out of the GWA.
    expect(simulate(subjects, { e: 1.0 }).gwa).toBe(1.875);
  });

  it("snaps any grade to the nearest offered one", () => {
    expect(GRADE_OPTIONS[gradeStep(1.75)]).toBe(1.75);
    expect(GRADE_OPTIONS[gradeStep(1.3)]).toBe(1.25);
    expect(GRADE_OPTIONS[gradeStep(3.6)]).toBe(4.0);
  });
});
