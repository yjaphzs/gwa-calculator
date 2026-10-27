import { describe, expect, it } from "vitest";

import {
  isValidSemester,
  isValidSubject,
  parseCalculatorImport,
} from "@/features/transfer/lib/calculator-io";

const subject = { id: "1", code: "MATH101", title: "Calculus", grade: 1.25, units: 3 };
const semester = { id: "s", schoolYear: "2025-2026", semester: "First", subjects: [subject] };

describe("isValidSubject / isValidSemester", () => {
  it("accepts well-formed records", () => {
    expect(isValidSubject(subject)).toBe(true);
    expect(isValidSemester(semester)).toBe(true);
  });

  it("accepts the optional excluded flag and INC/DRP/W marks", () => {
    expect(isValidSubject({ ...subject, excluded: true })).toBe(true);
    expect(isValidSubject({ ...subject, mark: "INC" })).toBe(true);
    expect(isValidSubject({ ...subject, mark: "PASS" })).toBe(false);
    expect(isValidSubject({ ...subject, excluded: "yes" })).toBe(false);
  });

  it("rejects missing or mistyped fields", () => {
    expect(isValidSubject(null)).toBe(false);
    expect(isValidSubject({ ...subject, grade: "1.25" })).toBe(false);
    expect(isValidSubject({ ...subject, id: undefined })).toBe(false);
    expect(isValidSemester({ ...semester, subjects: [{ ...subject, units: null }] })).toBe(false);
    expect(isValidSemester({ ...semester, subjects: "nope" })).toBe(false);
  });
});

describe("parseCalculatorImport", () => {
  it("returns a normalized state", () => {
    const parsed = parseCalculatorImport({ subjects: [subject], semesters: [semester], autosave: false });
    expect(parsed).toEqual({ subjects: [subject], semesters: [semester], autosave: false });
  });

  it("defaults autosave to true for older exports", () => {
    expect(parseCalculatorImport({ subjects: [], semesters: [] }).autosave).toBe(true);
  });

  it("throws user-facing messages for bad input", () => {
    expect(() => parseCalculatorImport(null)).toThrow("Invalid file structure.");
    expect(() => parseCalculatorImport({ semesters: [] })).toThrow("'subjects'");
    expect(() => parseCalculatorImport({ subjects: [], semesters: [{}] })).toThrow("'semesters'");
  });
});
