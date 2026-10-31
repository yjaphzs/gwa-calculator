import { describe, expect, it } from "vitest";

import { BLACK, contrast, hexToOklch, oklchToHex, toGamut, WHITE } from "./color";
import { deriveDark, deriveLight, GRAPHIC_CONTRAST, TEXT_CONTRAST, type ModeTokens } from "./derive-scheme";
import { cssForChoice, isValidChoice, SCHEME_PRESETS } from "./schemes";

const DARK_BG = { l: 0.1776, c: 0, h: 0 };
const fg = (t: ModeTokens) => (t.foreground === "black" ? BLACK : WHITE);

describe("color conversion", () => {
  it("round-trips hex through OKLCH", () => {
    for (const hex of ["#ec4899", "#22c55e", "#3b82f6", "#000000", "#ffffff", "#fbb217"]) {
      expect(oklchToHex(hexToOklch(hex)!)).toBe(hex);
    }
  });

  it("matches known OKLCH values", () => {
    const pink = hexToOklch("#ec4899")!;
    expect(pink.l).toBeCloseTo(0.656, 2);
    expect(pink.h).toBeCloseTo(354.3, 0);
    expect(hexToOklch("nope")).toBeNull();
  });

  it("computes WCAG contrast", () => {
    expect(contrast(WHITE, BLACK)).toBeCloseTo(21, 1);
    expect(contrast(hexToOklch("#2563eb")!, WHITE)).toBeCloseTo(5.17, 1);
  });

  it("maps out-of-gamut colors into sRGB by lowering chroma", () => {
    const wild = toGamut({ l: 0.7, c: 0.4, h: 150 });
    expect(wild.c).toBeLessThan(0.4);
    expect(wild.l).toBe(0.7);
  });
});

describe("derived schemes stay readable", () => {
  const customs = ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#808080", "#1a1a1a", "#f5f5f5", "#ffb6c1"];
  const seeds = [
    ...SCHEME_PRESETS.map((s) => ({ name: s.id, light: s.light, dark: s.dark })),
    ...customs.map((hex) => ({ name: hex, light: hexToOklch(hex)!, dark: hexToOklch(hex)! })),
  ];

  it.each(seeds)("$name: button text and the trend line pass WCAG AA in both modes", ({ light, dark }) => {
    const l = deriveLight(light);
    const d = deriveDark(dark);
    expect(contrast(l.primary, fg(l))).toBeGreaterThanOrEqual(TEXT_CONTRAST);
    expect(contrast(d.primary, fg(d))).toBeGreaterThanOrEqual(TEXT_CONTRAST);
    expect(contrast(l.chartLine, WHITE)).toBeGreaterThanOrEqual(GRAPHIC_CONTRAST);
    expect(contrast(d.chartLine, DARK_BG)).toBeGreaterThanOrEqual(GRAPHIC_CONTRAST);
    expect(l.chart).toHaveLength(5);
    // The logo glyph stays visible on its tile.
    for (const t of [l, d]) {
      const [tile, mark] = t.logoOnAccent ? [t.primary, fg(t)] : [BLACK, t.primary];
      expect(contrast(tile, mark)).toBeGreaterThanOrEqual(GRAPHIC_CONTRAST);
    }
  });

  it("keeps hues close to what was picked", () => {
    const pink = deriveLight(hexToOklch("#ec4899")!);
    expect(Math.abs(pink.primary.h - 354.3)).toBeLessThan(2);
    expect(pink.foreground).toBe("white");
    expect(deriveLight(hexToOklch("#fbb217")!).foreground).toBe("black");
    expect(deriveDark(hexToOklch("#1d4ed8")!).foreground).toBe("black");
  });
});

describe("scheme CSS", () => {
  it("is null for the default amber and invalid choices", () => {
    expect(cssForChoice({ scheme: "amber" })).toBeNull();
    expect(cssForChoice({ scheme: "nope" })).toBeNull();
    expect(cssForChoice({ scheme: "custom" })).toBeNull();
    expect(isValidChoice({ scheme: "custom", accent: "#12ab34" })).toBe(true);
  });

  it("writes light and dark blocks that set every accent token", () => {
    const css = cssForChoice({ scheme: "custom", accent: "#7c3aed" })!;
    expect(css).toContain(':root[data-scheme="custom"] {');
    expect(css).toContain(':root.dark[data-scheme="custom"] {');
    for (const token of ["--primary:", "--primary-foreground:", "--chart-line:", "--chart-5:", "--sidebar-primary:", "--logo-tile:", "--logo-mark:"]) {
      expect(css.split(token)).toHaveLength(3);
    }
  });
});

describe("firestore.rules", () => {
  it("accepts exactly the scheme ids the app offers", async () => {
    const { readFileSync } = await import("node:fs");
    const { SCHEME_IDS } = await import("./schemes");
    const rules = readFileSync("firestore.rules", "utf8");
    const listed = /a\.scheme in \[([^\]]+)\]/.exec(rules)?.[1].match(/'([^']+)'/g)?.map((s) => s.slice(1, -1));
    expect(listed).toEqual(SCHEME_IDS);
  });
});
