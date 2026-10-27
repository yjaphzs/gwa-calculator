import { describe, expect, it } from "vitest";

import {
  EMPTY_CALCULATOR_STATE,
  byId,
  hasData,
  mergeStates,
  sameState,
} from "@/features/persistence/lib/calculator-state";
import type { CalculatorState, Semester, Subject } from "@/types";

const subject = (id: string, grade = 1.5): Subject => ({
  id,
  code: `CODE-${id}`,
  title: `Subject ${id}`,
  grade,
  units: 3,
});

const semester = (id: string, subjects: Subject[] = []): Semester => ({
  id,
  semester: "First",
  schoolYear: "2025-2026",
  subjects,
});

const state = (partial: Partial<CalculatorState>): CalculatorState => ({
  ...EMPTY_CALCULATOR_STATE,
  ...partial,
});

describe("hasData", () => {
  it("is false for an empty state", () => {
    expect(hasData(EMPTY_CALCULATOR_STATE)).toBe(false);
  });

  it("is true with subjects or semesters", () => {
    expect(hasData(state({ subjects: [subject("a")] }))).toBe(true);
    expect(hasData(state({ semesters: [semester("s")] }))).toBe(true);
  });
});

describe("sameState", () => {
  it("compares subjects and semesters but ignores autosave", () => {
    const a = state({ subjects: [subject("a")], autosave: true });
    const b = state({ subjects: [subject("a")], autosave: false });
    expect(sameState(a, b)).toBe(true);
  });

  it("detects differing content", () => {
    const a = state({ subjects: [subject("a", 1.5)] });
    const b = state({ subjects: [subject("a", 2.0)] });
    expect(sameState(a, b)).toBe(false);
  });
});

describe("byId", () => {
  it("unions by id with local winning on conflicts", () => {
    const cloud = [subject("a", 2.0), subject("b")];
    const local = [subject("a", 1.0), subject("c")];
    const merged = byId(local, cloud);
    expect(merged.map((s) => s.id)).toEqual(["a", "b", "c"]);
    expect(merged.find((s) => s.id === "a")?.grade).toBe(1.0);
  });
});

describe("mergeStates", () => {
  it("merges subjects and semesters and keeps the cloud autosave", () => {
    const local = state({
      subjects: [subject("l")],
      semesters: [semester("s1")],
      autosave: true,
    });
    const cloud = state({
      subjects: [subject("c")],
      semesters: [semester("s2")],
      autosave: false,
    });
    const merged = mergeStates(local, cloud);
    expect(merged.subjects.map((s) => s.id).sort()).toEqual(["c", "l"]);
    expect(merged.semesters.map((s) => s.id).sort()).toEqual(["s1", "s2"]);
    expect(merged.autosave).toBe(false);
  });
});
