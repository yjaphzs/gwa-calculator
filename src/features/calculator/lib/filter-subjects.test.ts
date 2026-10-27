import { describe, expect, it } from "vitest";

import { filterSubjects } from "@/features/calculator/lib/filter-subjects";
import { pageCount, paginate } from "@/lib/pagination";
import type { Subject } from "@/types";

const subjects: Subject[] = [
  { id: "1", code: "MATH101", title: "Calculus I", grade: 1.25, units: 3 },
  { id: "2", code: "ENG102", title: "Purposive Communication", grade: 1.5, units: 3 },
  { id: "3", code: "PHYS101", title: "Physics", grade: 2.0, units: 4 },
];

describe("filterSubjects", () => {
  it("returns everything for an empty search", () => {
    expect(filterSubjects(subjects, "")).toHaveLength(3);
  });

  it("matches code and title case-insensitively", () => {
    expect(filterSubjects(subjects, "math").map((s) => s.id)).toEqual(["1"]);
    expect(filterSubjects(subjects, "COMMUNICATION").map((s) => s.id)).toEqual(["2"]);
  });

  it("matches grade and units text", () => {
    expect(filterSubjects(subjects, "2.000").map((s) => s.id)).toEqual(["3"]);
    expect(filterSubjects(subjects, "4").map((s) => s.id)).toEqual(["3"]);
  });
});

describe("paginate / pageCount", () => {
  const items = Array.from({ length: 23 }, (_, i) => i);

  it("slices 1-based pages", () => {
    expect(paginate(items, 1, 10)).toEqual(items.slice(0, 10));
    expect(paginate(items, 3, 10)).toEqual([20, 21, 22]);
  });

  it("always has at least one page", () => {
    expect(pageCount(23, 10)).toBe(3);
    expect(pageCount(0, 10)).toBe(1);
  });
});
