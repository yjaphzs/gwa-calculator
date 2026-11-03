import { describe, expect, it } from "vitest";

import { latestTerm, previousTerm } from "@/features/semesters/lib/semesters";
import { gwaImprovement, termImprovement } from "@/lib/gwa-insights";
import type { Semester, Subject } from "@/types";
import { formatDelta, savedTermImprovement, workingSetImprovement } from "./improvement";

let n = 0;
const sub = (grade: number, units = 3): Subject => ({ id: `s${++n}`, code: `C${n}`, title: `T${n}`, grade, units });
const four = (grade: number) => [sub(grade), sub(grade), sub(grade), sub(grade)];
const term = (id: string, semester: string, schoolYear: string, subjects: Subject[]): Semester => ({ id, semester, schoolYear, subjects });

// Saved out of order on purpose: comparisons go by calendar, not by save order.
const second = term("b", "Second", "2024-2025", four(1.75));
const first = term("a", "First", "2024-2025", four(2.0));
const semesters = [second, first];

describe("improvement", () => {
  it("measures a better (lower) GWA as positive", () => {
    expect(gwaImprovement(1.75, 1.5)).toBe(0.25);
    expect(gwaImprovement(1.5, 1.75)).toBe(-0.25);
    expect(gwaImprovement(null, 1.5)).toBeNull();
  });

  it("needs 12 units before comparing", () => {
    expect(termImprovement(four(2), [sub(1)])).toBeNull();
    expect(termImprovement(four(2), four(1.5))).toBe(0.5);
  });

  it("finds terms by calendar", () => {
    expect(latestTerm(semesters)).toBe(second);
    expect(previousTerm(semesters, second)).toBe(first);
    expect(previousTerm(semesters, first)).toBeNull();
  });

  it("compares the working set with the latest term, and a saved term with the one before", () => {
    expect(workingSetImprovement(four(1.5), semesters)).toEqual({ delta: 0.25, term: "2nd 2024–25" });
    expect(workingSetImprovement(four(2.25), semesters)).toBeNull();
    expect(workingSetImprovement(four(1.5), [])).toBeNull();
    expect(savedTermImprovement(semesters, second)).toEqual({ delta: 0.25, term: "1st 2024–25" });
    const next = term("c", "First", "2025-2026", four(1.25));
    expect(savedTermImprovement([...semesters, next], next)).toEqual({ delta: 0.5, term: "2nd 2024–25" });
  });

  it("writes the change without trailing zeros", () => {
    expect(formatDelta(0.18)).toBe("0.18");
    expect(formatDelta(0.183)).toBe("0.183");
    expect(formatDelta(0.2)).toBe("0.2");
  });
});
