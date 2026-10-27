import { describe, expect, it } from "vitest";

import {
  HONOR_MIN_UNITS,
  computeGwa,
  countsTowardGwa,
  getAcademicHonor,
  getHonorFor,
  getLatinHonor,
} from "@/lib/academic";

describe("computeGwa", () => {
  it("returns null with zero units", () => {
    expect(computeGwa([])).toEqual({ gwa: null, totalUnits: 0 });
  });

  it("weights each grade by its units", () => {
    // (1.0×3 + 2.0×1) / 4 = 1.25 — an unweighted mean would give 1.5.
    const result = computeGwa([
      { grade: 1.0, units: 3 },
      { grade: 2.0, units: 1 },
    ]);
    expect(result).toEqual({ gwa: 1.25, totalUnits: 4 });
  });

  it("rounds to 3 decimals", () => {
    // 24.25 / 16 = 1.515625 → 1.516 (the guide page's worked example).
    const result = computeGwa([
      { grade: 1.25, units: 3 },
      { grade: 1.75, units: 4 },
      { grade: 1.5, units: 3 },
      { grade: 1.0, units: 3 },
      { grade: 2.0, units: 3 },
    ]);
    expect(result).toEqual({ gwa: 1.516, totalUnits: 16 });
  });
});

describe("getAcademicHonor", () => {
  it.each([
    [1.0, "University Scholar"],
    [1.5, "University Scholar"],
    [1.501, "College Scholar"],
    [1.75, "College Scholar"],
    [1.751, "Dean's Lister"],
    [2.0, "Dean's Lister"],
    [2.001, null],
    [3.0, null],
    [0.99, null],
  ])("%s → %s", (gwa, honor) => {
    expect(getAcademicHonor(gwa)).toBe(honor);
  });
});

describe("getLatinHonor", () => {
  it.each([
    [1.0, "Summa Cum Laude"],
    [1.2, "Summa Cum Laude"],
    [1.201, "Magna Cum Laude"],
    [1.45, "Magna Cum Laude"],
    [1.451, "Cum Laude"],
    [1.75, "Cum Laude"],
    [1.751, null],
  ])("%s → %s", (gwa, honor) => {
    expect(getLatinHonor(gwa)).toBe(honor);
  });
});

describe("excluded and marked subjects", () => {
  it("are left out of the GWA and the unit total", () => {
    const result = computeGwa([
      { grade: 1.0, units: 3 },
      { grade: 5.0, units: 3, excluded: true },
      { grade: 0, units: 3, mark: "INC" },
    ]);
    expect(result).toEqual({ gwa: 1.0, totalUnits: 3 });
  });

  it("countsTowardGwa reflects both flags", () => {
    expect(countsTowardGwa({ grade: 1, units: 3 })).toBe(true);
    expect(countsTowardGwa({ grade: 1, units: 3, excluded: true })).toBe(false);
    expect(countsTowardGwa({ grade: 1, units: 3, mark: "DRP" })).toBe(false);
  });
});

describe("getHonorFor", () => {
  it("requires at least HONOR_MIN_UNITS units", () => {
    expect(HONOR_MIN_UNITS).toBe(12);
    expect(getHonorFor([{ grade: 1.0, units: 11 }])).toBeNull();
    expect(getHonorFor([{ grade: 1.0, units: 12 }])).toBe("University Scholar");
  });

  it("returns null without subjects", () => {
    expect(getHonorFor([])).toBeNull();
  });
});
