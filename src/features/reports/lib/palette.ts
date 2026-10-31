import { hexToOklch, oklchToHex } from "@/features/appearance/lib/color";
import { deriveDark, deriveLight } from "@/features/appearance/lib/derive-scheme";
import { CUSTOM_SCHEME, DEFAULT_SCHEME, SCHEME_PRESETS, type SchemeChoice } from "@/features/appearance/lib/schemes";
import type { ReportPalette } from "@/features/reports/lib/theme";

// A stripe that still shows under the black band when the accent is near-black.
const NEUTRAL_STRIPE = "#a1a1aa";

/**
 * The report colors for the user's color scheme. Paper is white, so accents
 * use the scheme's light-mode shades; the logo sits on the dark header band,
 * so its glyph uses the bright dark-mode shade. Amber keeps the original
 * palette (undefined = default).
 */
export function paletteForScheme(choice: SchemeChoice): ReportPalette | undefined {
  if (choice.scheme === DEFAULT_SCHEME) return undefined;
  const preset = SCHEME_PRESETS.find((s) => s.id === choice.scheme);
  const custom = choice.scheme === CUSTOM_SCHEME && choice.accent ? hexToOklch(choice.accent) : null;
  const seeds = preset ? { light: preset.light, dark: preset.dark } : custom ? { light: custom, dark: custom } : null;
  if (!seeds) return undefined;
  const light = deriveLight(seeds.light);
  const dark = deriveDark(seeds.dark);
  const accent = oklchToHex(light.primary);
  return {
    accent,
    stripe: light.logoOnAccent ? NEUTRAL_STRIPE : accent,
    ink: oklchToHex(light.chartLine),
    mark: oklchToHex(dark.primary),
  };
}
