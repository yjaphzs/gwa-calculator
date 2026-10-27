import { describe, expect, it } from "vitest";

import { CUMULATIVE_EXAMPLE, WORKED_EXAMPLE } from "@/features/guide/content/examples";
import { computeGwa, getHonorFor } from "@/lib/academic";

// The guide's prose quotes these numbers; keep the data and the copy in agreement.
describe("guide examples", () => {
  it("worked example comes to 1.516, College Scholar", () => {
    const subjects = [...WORKED_EXAMPLE];
    expect(computeGwa(subjects)).toEqual({ gwa: 1.516, totalUnits: 16 });
    expect(getHonorFor(subjects)).toBe("College Scholar");
  });

  it("cumulative example differs from the plain average of semester GWAs", () => {
    const semesterGwas = CUMULATIVE_EXAMPLE.map((s) => computeGwa(s.subjects).gwa ?? 0);
    const plainAverage = semesterGwas.reduce((a, b) => a + b, 0) / semesterGwas.length;
    const cumulative = computeGwa(CUMULATIVE_EXAMPLE.flatMap((s) => s.subjects));
    expect(plainAverage).toBe(1.5);
    expect(cumulative.gwa).toBe(1.667);
  });
});
