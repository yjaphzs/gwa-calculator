import { describe, expect, it } from "vitest";

import { parseBadges, parseCode, parseGwaShown, parseName, parseNickname, parseTerm } from "./validate";

describe("barkada input checks", () => {
  it("cleans names and nicknames and enforces their lengths", () => {
    expect(parseName("  Block   A  ")).toBe("Block A");
    expect(parseNickname("Jan")).toBe("Jan");
    expect(() => parseName("A")).toThrow(/2–30/);
    expect(() => parseNickname("")).toThrow(/1–24/);
    expect(() => parseNickname("x".repeat(25))).toThrow(/1–24/);
    expect(() => parseName(42)).toThrow();
  });

  it("forgives case, spaces and dashes in codes, but not look-alikes", () => {
    expect(parseCode("k7p2-qx9m")).toBe("K7P2QX9M");
    expect(() => parseCode("K7P2QX9O")).toThrow(/invite code/);
    expect(() => parseCode("K7P2")).toThrow(/invite code/);
  });

  it("keeps the GWA hidden unless chosen, and clamps badges", () => {
    expect(parseGwaShown(undefined)).toBe("hidden");
    expect(parseGwaShown("masked")).toBe("masked");
    expect(() => parseGwaShown("all")).toThrow();
    expect(parseBadges(7.8)).toBe(7);
    expect(parseBadges(99)).toBe(16);
    expect(parseBadges(-3)).toBe(0);
    expect(parseBadges("5")).toBe(0);
  });

  it("normalizes the term from the app's pickers", () => {
    expect(parseTerm("2025-2026", "Second")).toEqual({ key: "2025-2", label: "AY 2025–2026 · 2nd Sem" });
    expect(() => parseTerm("", "First")).toThrow(/school year/);
  });
});
