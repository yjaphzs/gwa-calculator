import { describe, expect, it } from "vitest";

import type { Semester, Subject } from "@/types";
import { buildWrapped, shortYear, wrappedYears } from "./wrapped";

let n = 0;
const sub = (title: string, grade: number, units = 3, extra: Partial<Subject> = {}): Subject => ({
  id: `s${++n}`,
  code: `C${n}`,
  title,
  grade,
  units,
  ...extra,
});
const four = (grade: number) => ["A", "B", "C", "D"].map((t) => sub(t, grade));
const term = (semester: string, schoolYear: string, subjects: Subject[]): Semester => ({ id: `${semester}-${schoolYear}`, semester, schoolYear, subjects });

const semesters = [
  term("Second", "2024-2025", [...four(1.25), sub("Thesis", 1.0, 6)]),
  term("First", "2023-2024", four(2.0)),
  term("First", "2024-2025", four(1.75)),
  term("Second", "2023-2024", four(1.75)),
  term("First", "2025-2026", four(1.5)), // a year with one term: no Wrapped yet
];

describe("wrapped", () => {
  it("offers years with two or more saved terms, newest first", () => {
    expect(wrappedYears(semesters)).toEqual(["2024-2025", "2023-2024"]);
    expect(buildWrapped(semesters, "2025-2026")).toBeNull();
  });

  it("sums up a school year", () => {
    const w = buildWrapped(semesters, "2024-2025")!;
    expect(w.terms.map((t) => t.label)).toEqual(["1st 2024–25", "2nd 2024–25"]);
    expect(w.units).toBe(30);
    expect(w.subjects).toBe(9);
    expect(w.gwa).toBe(1.4);
    expect(w.best).toMatchObject({ title: "Thesis", grade: 1.0 });
    expect(w.unos).toBe(1);
    expect(w.terms.map((t) => t.honor)).toEqual(["College Scholar", "University Scholar"]);
    // 1.75 -> 1.167 is the biggest jump (the year before ended at 1.75 too, so no jump into this year).
    expect(w.bestJump).toEqual({ from: "1st 2024–25", to: "2nd 2024–25", delta: 0.583 });
    expect(w.versusLastYear).toBe(0.475);
    expect(w.latin).toBe("Cum Laude");
  });

  it("leaves out uncounted subjects and has no jump without an improvement", () => {
    const flat = [term("First", "2024-2025", [...four(1.5), sub("NSTP", 1.0, 3, { excluded: true })]), term("Second", "2024-2025", four(1.5))];
    const w = buildWrapped(flat, "2024-2025")!;
    expect(w.best?.title).not.toBe("NSTP");
    expect(w.unos).toBe(0);
    expect(w.bestJump).toBeNull();
    expect(w.versusLastYear).toBeNull();
  });

  it("shortens the school year", () => {
    expect(shortYear("2024-2025")).toBe("2024–25");
  });
});
