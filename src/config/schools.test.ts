import { describe, expect, it } from "vitest";

import { SCHOOLS, getSchoolById } from "@/config/schools";

// Slugs are stored on user profiles and leaderboard docs — they must never drift.
describe("schools", () => {
  it("derives stable slugs and infers the type from the name", () => {
    expect(getSchoolById("adamson-university")).toEqual({
      id: "adamson-university",
      name: "Adamson University",
      type: "university",
    });
    expect(getSchoolById("zamboanga-state-college-of-marine-sciences-and-technology")?.type).toBe(
      "college",
    );
  });

  it("ends with the 'Other' catch-all and has unique ids", () => {
    expect(SCHOOLS.at(-1)?.id).toBe("other");
    expect(new Set(SCHOOLS.map((s) => s.id)).size).toBe(SCHOOLS.length);
  });

  it("returns undefined for unknown or empty ids", () => {
    expect(getSchoolById("nope")).toBeUndefined();
    expect(getSchoolById(null)).toBeUndefined();
  });
});
