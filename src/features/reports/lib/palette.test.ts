import { describe, expect, it } from "vitest";

import { buildSemesterReport } from "./documents/semester-report";
import { paletteForScheme } from "./palette";
import { DEFAULT_PALETTE, paletteStyles } from "./theme";

const subjects = [{ id: "a", code: "MATH 1", title: "Algebra", grade: 1.25, units: 12 }];
const base = { appName: "GWA Calculator", appUrl: "https://gwa.example/", subjects };

describe("report palette", () => {
  it("keeps the original amber by default", () => {
    expect(paletteForScheme({ scheme: "amber" })).toBeUndefined();
    const html = buildSemesterReport(base).html;
    expect(html).toContain(`--report-accent: ${DEFAULT_PALETTE.accent}`);
    expect(html).toContain(`--report-stripe: ${DEFAULT_PALETTE.stripe}`);
  });

  it("follows a preset or custom scheme", () => {
    const pink = paletteForScheme({ scheme: "pink" })!;
    expect(pink.accent).toMatch(/^#[0-9a-f]{6}$/);
    expect(pink.accent).not.toBe(DEFAULT_PALETTE.accent);
    const html = buildSemesterReport({ ...base, palette: pink }).html;
    expect(html).toContain(`--report-accent: ${pink.accent}`);
    expect(html).toContain("var(--report-mark)");
    expect(paletteForScheme({ scheme: "custom", accent: "#0ea5e9" })?.ink).toMatch(/^#/);
  });

  it("uses a visible stripe when the accent is near-black", () => {
    const black = paletteForScheme({ scheme: "black" })!;
    expect(black.stripe).toBe("#a1a1aa");
    expect(black.mark).not.toBe(black.accent);
  });

  it("never lets a non-hex value into the stylesheet", () => {
    const css = paletteStyles({ ...DEFAULT_PALETTE, accent: "red; } body { display: none" });
    expect(css).toContain(`--report-accent: ${DEFAULT_PALETTE.accent}`);
    expect(css).not.toContain("display");
  });
});
