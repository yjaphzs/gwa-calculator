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

export const FONT_SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const FONT_MONO =
  'ui-monospace, "Cascadia Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
