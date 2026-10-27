import { describe, expect, it } from "vitest";

import { describeHonorProgress, honorProgress, requiredTermGwa } from "@/lib/gwa-insights";

const s = (grade: number, units: number) => ({ grade, units });

describe("honorProgress", () => {
  it("is empty without subjects", () => {
    expect(honorProgress([])).toEqual({ kind: "empty" });
    expect(describeHonorProgress(honorProgress([]))).toBeNull();
  });

  it("asks for more units below the 12-unit gate", () => {
    const progress = honorProgress([s(1.0, 9)]);
    expect(progress).toEqual({ kind: "needs-units", unitsShort: 3 });
    expect(describeHonorProgress(progress)).toBe("Add 3 more units to qualify for honors.");
  });

  it("shows the gap to the next band up", () => {
    // 1.60 is College Scholar; University Scholar needs 1.50 or better.
    const progress = honorProgress([s(1.6, 12)]);
    expect(progress).toEqual({ kind: "honor", honor: "College Scholar", next: { name: "University Scholar", gap: 0.1 } });
    expect(describeHonorProgress(progress)).toBe("0.100 away from University Scholar.");
  });

  it("recognises the top band", () => {
    expect(describeHonorProgress(honorProgress([s(1.25, 12)]))).toBe("You're in the top honor band.");
  });

  it("measures the distance to Dean's Lister when outside every band", () => {
    expect(honorProgress([s(2.25, 12)])).toEqual({ kind: "outside", next: { name: "Dean's Lister", gap: 0.25 } });
  });

  it("ignores excluded and marked subjects", () => {
    const progress = honorProgress([s(1.0, 9), { grade: 1.0, units: 3, excluded: true }, { grade: 1.0, units: 3, mark: "INC" }]);
    expect(progress).toEqual({ kind: "needs-units", unitsShort: 3 });
  });
});

describe("requiredTermGwa", () => {
  it("solves for next term's GWA", () => {
    // 60 units at 1.80; to reach 1.75 over 80 units: (1.75×80 − 108) / 20 = 1.6
    expect(requiredTermGwa([s(1.8, 60)], 1.75, 20)).toEqual({ kind: "reachable", requiredGwa: 1.6 });
  });

  it("reports when any passing semester keeps the target", () => {
    expect(requiredTermGwa([s(1.2, 120)], 1.75, 20)).toEqual({ kind: "any-passing" });
  });

  it("reports the best possible cumulative when the target is out of reach", () => {
    // Even all 1.00s: (2.5×60 + 1×20) / 80 = 2.125
    expect(requiredTermGwa([s(2.5, 60)], 1.45, 20)).toEqual({ kind: "out-of-reach", bestCumulative: 2.125 });
  });
});
