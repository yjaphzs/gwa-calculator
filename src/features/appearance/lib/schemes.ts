import { hexToOklch, type Oklch } from "@/features/appearance/lib/color";
import { deriveDark, deriveLight, schemeCss } from "@/features/appearance/lib/derive-scheme";

export const DEFAULT_SCHEME = "amber";
export const CUSTOM_SCHEME = "custom";

export interface SchemePreset {
  id: string;
  label: string;
  /** Seed for light mode and for dark mode (Tailwind palette shades). */
  light: Oklch;
  dark: Oklch;
}

const o = (l: number, c: number, h: number): Oklch => ({ l, c, h });

/**
 * The pre-made color schemes. Amber is the app's own brand and lives in
 * globals.css; every other scheme only overrides the accent tokens, so
 * surfaces, text and honors look the same everywhere.
 */
export const SCHEME_PRESETS: SchemePreset[] = [
  { id: "amber", label: "Amber", light: o(0.812, 0.1653, 78.18), dark: o(0.812, 0.1653, 78.18) },
  { id: "pink", label: "Pink", light: o(0.656, 0.241, 354.31), dark: o(0.718, 0.202, 349.76) },
  { id: "red", label: "Red", light: o(0.637, 0.237, 25.33), dark: o(0.704, 0.191, 22.22) },
  { id: "green", label: "Green", light: o(0.723, 0.219, 149.58), dark: o(0.792, 0.209, 151.71) },
  { id: "teal", label: "Teal", light: o(0.704, 0.14, 182.5), dark: o(0.777, 0.152, 181.91) },
  { id: "blue", label: "Blue", light: o(0.623, 0.214, 259.82), dark: o(0.707, 0.165, 254.62) },
  { id: "purple", label: "Purple", light: o(0.627, 0.265, 303.9), dark: o(0.714, 0.203, 305.5) },
  { id: "black", label: "Black", light: o(0.21, 0.006, 285.89), dark: o(0.985, 0, 0) },
];

export const SCHEME_IDS = [...SCHEME_PRESETS.map((s) => s.id), CUSTOM_SCHEME];

/** What the user picked: a preset, or "custom" with an accent color. */
export interface SchemeChoice {
  scheme: string;
  /** "#rrggbb", only for the custom scheme. */
  accent?: string;
}

export function isValidChoice(choice: SchemeChoice): boolean {
  if (choice.scheme === CUSTOM_SCHEME) return !!choice.accent && hexToOklch(choice.accent) !== null;
  return SCHEME_PRESETS.some((s) => s.id === choice.scheme);
}

/**
 * The stylesheet for a choice, or null for the default amber (globals.css
 * already has it). Custom accents get light and dark versions derived from
 * the one color the user picked.
 */
export function cssForChoice(choice: SchemeChoice): string | null {
  if (!isValidChoice(choice) || choice.scheme === DEFAULT_SCHEME) return null;
  if (choice.scheme === CUSTOM_SCHEME) {
    const seed = hexToOklch(choice.accent!)!;
    return schemeCss(CUSTOM_SCHEME, deriveLight(seed), deriveDark(seed));
  }
  const preset = SCHEME_PRESETS.find((s) => s.id === choice.scheme)!;
  return schemeCss(preset.id, deriveLight(preset.light), deriveDark(preset.dark));
}
