import { describe, expect, it } from "vitest";

import { buildSubject, notCountedLabel, statusOf } from "@/features/calculator/lib/subject-status";

const base = { code: "NSTP1", title: "NSTP 1", grade: 1.5, units: 3 };

describe("subject status", () => {
  it("builds graded subjects without optional keys", () => {
    const subject = buildSubject("a", { ...base, status: "graded" });
    expect(subject).toEqual({ id: "a", ...base });
    expect("excluded" in subject || "mark" in subject).toBe(false);
  });

  it("flags excluded subjects but keeps their grade", () => {
    expect(buildSubject("a", { ...base, status: "excluded" })).toEqual({ id: "a", ...base, excluded: true });
  });

  it("stores marks with a zero grade", () => {
    expect(buildSubject("a", { ...base, status: "INC" })).toEqual({ id: "a", ...base, grade: 0, mark: "INC" });
  });

  it("round-trips status and labels", () => {
    expect(statusOf({})).toBe("graded");
    expect(statusOf({ excluded: true })).toBe("excluded");
    expect(statusOf({ mark: "W" })).toBe("W");
    expect(notCountedLabel({})).toBeNull();
    expect(notCountedLabel({ excluded: true })).toBe("Not counted");
    expect(notCountedLabel({ mark: "DRP" })).toBe("Dropped");
  });
});
