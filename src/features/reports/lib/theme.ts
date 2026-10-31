// Print palette — shared with the transactional emails (zinc band + amber
// stripe). Hex, not the app's oklch tokens: print engines and PDF export
// handle plain sRGB most predictably.
export const PRINT = {
  ink: "#18181b", // zinc-900 — body text, header band
  inkSoft: "#3f3f46", // zinc-700
  muted: "#71717a", // zinc-500 — labels, captions
  hairline: "#e4e4e7", // zinc-200 — rules, borders
  panel: "#fafafa", // zinc-50 — tiles, callouts
  zebra: "#f6f6f7",
  stripe: "#eab308", // the email stripe
  amber: "#fbb217", // the app's --primary
  amberInk: "#b45309", // amber dark enough for a 2px line on white (≥ 3:1)
  white: "#ffffff",
} as const;

/**
 * The brand colors in a report, which follow the user's color scheme
 * (palette.ts). Neutrals (ink, hairlines, panels) and the gold honor pill
 * don't change. Written into the document as CSS variables (--report-*).
 */
export interface ReportPalette {
  /** Hero tile and panel accents. */
  accent: string;
  /** The thin stripe under the header band. */
  stripe: string;
  /** The trend line and dots: dark enough for a 2px line on white (≥ 3:1). */
  ink: string;
  /** The logo glyph on the dark header band. */
  mark: string;
}

/** The app's own amber, used when no other scheme is chosen. */
export const DEFAULT_PALETTE: ReportPalette = {
  accent: PRINT.amber,
  stripe: PRINT.stripe,
  ink: PRINT.amberInk,
  mark: PRINT.amber,
};

const HEX = /^#[0-9a-f]{6}$/i;

/** `:root` variables for a palette; anything that isn't a plain hex color falls back to amber. */
export function paletteStyles(palette: ReportPalette = DEFAULT_PALETTE): string {
  const safe = (value: string, fallback: string) => (HEX.test(value) ? value : fallback);
  return `:root { --report-accent: ${safe(palette.accent, DEFAULT_PALETTE.accent)}; --report-stripe: ${safe(palette.stripe, DEFAULT_PALETTE.stripe)}; --report-ink: ${safe(palette.ink, DEFAULT_PALETTE.ink)}; --report-mark: ${safe(palette.mark, DEFAULT_PALETTE.mark)}; }`;
}

export const FONT_SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const FONT_MONO =
  'ui-monospace, "Cascadia Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
