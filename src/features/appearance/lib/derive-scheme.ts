import { BLACK, contrast, formatOklch, toGamut, WHITE, type Oklch } from "@/features/appearance/lib/color";

/** The tokens a scheme sets for one mode (light or dark). */
export interface ModeTokens {
  primary: Oklch;
  /** Text on the primary color: whichever of black or white reads better. */
  foreground: "black" | "white";
  /** The GWA trend line: legible on the page background. */
  chartLine: Oklch;
  /** chart-1 (lightest) … chart-5 (= primary). */
  chart: Oklch[];
  /**
   * The logo is an accent glyph on a black tile. When the accent is too dark
   * to show on black (the Black scheme in light mode), the tile takes the
   * accent and the glyph takes the button text color instead.
   */
  logoOnAccent: boolean;
}

// Body text on a button: WCAG AA for normal-size text.
export const TEXT_CONTRAST = 4.5;
// A line or chart mark against the page: WCAG AA for graphics.
export const GRAPHIC_CONTRAST = 3;

const DARK_BACKGROUND: Oklch = { l: 0.1776, c: 0, h: 0 };
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const at = (base: Oklch, l: number): Oklch => toGamut({ ...base, l: clamp(l, 0, 1) });

/** Steps lightness from `from` toward `to` until `ok` holds; null if it never does. */
function search(base: Oklch, from: number, to: number, ok: (c: Oklch) => boolean): Oklch | null {
  const step = from <= to ? 0.005 : -0.005;
  for (let l = from; step > 0 ? l <= to + 1e-9 : l >= to - 1e-9; l += step) {
    const candidate = at(base, l);
    if (ok(candidate)) return candidate;
  }
  return null;
}

function chartRamp(primary: Oklch): Oklch[] {
  return [0.072, 0.054, 0.036, 0.018, 0].map((lift, i) =>
    at({ ...primary, c: primary.c * (0.7 + i * 0.075) }, primary.l + lift),
  );
}

/**
 * Light mode. White text is preferred when the color only has to darken a
 * little (≤ 0.18 lightness) to carry it; otherwise black text on the color
 * as picked (amber, lime, light pastels).
 */
export function deriveLight(seed: Oklch): ModeTokens {
  const base = at(seed, clamp(seed.l, 0.2, 0.85));
  const readsWhite = (c: Oklch) => contrast(c, WHITE) >= TEXT_CONTRAST;
  const readsBlack = (c: Oklch) => contrast(c, BLACK) >= TEXT_CONTRAST;
  const white = search(base, base.l, Math.max(0.2, base.l - 0.18), readsWhite);
  const black = white ? null : search(base, base.l, 0.98, readsBlack);
  const primary = white ?? black ?? at(base, 0.35);
  const line =
    search(primary, Math.min(primary.l, 0.55), 0.05, (c) => contrast(c, WHITE) >= GRAPHIC_CONTRAST) ?? at(primary, 0.4);
  return {
    primary,
    foreground: white || !black ? "white" : "black",
    chartLine: line,
    chart: chartRamp(primary),
    logoOnAccent: contrast(primary, BLACK) < GRAPHIC_CONTRAST,
  };
}

/**
 * Dark mode. Bright accents with black text read best on the near-black
 * page; the color lightens a little (≤ 0.15) if it needs to.
 */
export function deriveDark(seed: Oklch): ModeTokens {
  const base = at(seed, clamp(seed.l, 0.62, 0.95));
  const readsBlack = (c: Oklch) => contrast(c, BLACK) >= TEXT_CONTRAST;
  const black = search(base, base.l, Math.min(0.98, base.l + 0.15), readsBlack);
  const primary =
    black ?? search(base, base.l, 0.2, (c) => contrast(c, WHITE) >= TEXT_CONTRAST) ?? at(base, 0.4);
  const line =
    search(primary, primary.l, 0.98, (c) => contrast(c, DARK_BACKGROUND) >= GRAPHIC_CONTRAST) ?? at(primary, 0.85);
  return {
    primary,
    foreground: black ? "black" : "white",
    chartLine: line,
    chart: chartRamp(primary),
    logoOnAccent: contrast(primary, BLACK) < GRAPHIC_CONTRAST,
  };
}

function declarations(tokens: ModeTokens): string {
  const primary = formatOklch(tokens.primary);
  const fg = tokens.foreground === "black" ? "oklch(0 0 0)" : "oklch(1 0 0)";
  return [
    `--primary: ${primary}`,
    `--primary-foreground: ${fg}`,
    `--sidebar-primary: ${primary}`,
    `--sidebar-primary-foreground: ${fg}`,
    `--chart-line: ${formatOklch(tokens.chartLine)}`,
    ...tokens.chart.map((c, i) => `--chart-${i + 1}: ${formatOklch(c)}`),
    `--logo-tile: ${tokens.logoOnAccent ? primary : "oklch(0 0 0)"}`,
    `--logo-mark: ${tokens.logoOnAccent ? fg : primary}`,
  ].join("; ");
}

/**
 * The stylesheet for a scheme. `:root[data-scheme]` outranks the base `.dark`
 * rule, so the dark block repeats every token the light one sets.
 */
export function schemeCss(id: string, light: ModeTokens, dark: ModeTokens): string {
  return `:root[data-scheme="${id}"] { ${declarations(light)}; }\n:root.dark[data-scheme="${id}"] { ${declarations(dark)}; }`;
}
