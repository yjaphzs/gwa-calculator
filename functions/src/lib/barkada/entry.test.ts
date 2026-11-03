import { describe, expect, it } from "vitest";

import { memberResult, sameResult, visibleGwa } from "./entry";
import type { StoredSemester } from "./types";

const subjects = (grade: number, count: number) => Array.from({ length: count }, () => ({ grade, units: 3 }));
const term = (schoolYear: string, semester: string, list = subjects(1.5, 5)): StoredSemester => ({ schoolYear, semester, subjects: list });

describe("memberResult", () => {
  it("matches the group's term across spellings", () => {
    const result = memberResult([term("2025-2026", "First")], "2025-1", "hidden");
    expect(result).toEqual({ status: "graded", honor: "University Scholar", gwa: null });
    expect(memberResult([term("2025-26", "1st Sem")], "2025-1", "hidden").status).toBe("graded");
  });

  it("waits for a member with no semester saved for the term", () => {
    expect(memberResult([term("2024-2025", "Second")], "2025-1", "exact")).toEqual({ status: "waiting", honor: null, gwa: null });
    expect(memberResult([], "2025-1", "exact").status).toBe("waiting");
  });

  it("needs 12 units for an honor", () => {
    const result = memberResult([term("2025-2026", "First", subjects(1.25, 3))], "2025-1", "exact");
    expect(result).toEqual({ status: "short", honor: null, gwa: 1.25 });
  });

  it("leaves out excluded and marked subjects", () => {
    const list = [...subjects(1.75, 4), { grade: 5, units: 3, excluded: true }, { grade: 0, units: 3, mark: "INC" }];
    const result = memberResult([term("2025-2026", "First", list)], "2025-1", "exact");
    expect(result).toEqual({ status: "graded", honor: "College Scholar", gwa: 1.75 });
  });

  it("stores only what the member shows", () => {
    const saved = [term("2025-2026", "First", subjects(1.875, 4))];
    expect(memberResult(saved, "2025-1", "exact").gwa).toBe(1.875);
    expect(memberResult(saved, "2025-1", "masked").gwa).toBe(1);
    expect(memberResult(saved, "2025-1", "hidden").gwa).toBeNull();
  });
});

describe("visibleGwa and sameResult", () => {
  it("masks to the whole number", () => {
    expect(visibleGwa(2.456, "masked")).toBe(2);
    expect(visibleGwa(null, "exact")).toBeNull();
  });

  it("compares results field by field", () => {
    const a = { status: "graded" as const, honor: "Dean's Lister", gwa: null };
    expect(sameResult(a, { ...a })).toBe(true);
    expect(sameResult(a, { ...a, honor: null })).toBe(false);
  });
});
