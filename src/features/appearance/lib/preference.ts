import type { SchemeChoice } from "@/features/appearance/lib/schemes";
import type { AppearancePreference, ThemeMode } from "@/types";

// What the custom picker starts on before the user chooses a color.
export const DEFAULT_ACCENT = "#7c3aed";

export const THEME_MODES: ThemeMode[] = ["light", "dark", "system"];

export const isThemeMode = (value: unknown): value is ThemeMode => THEME_MODES.includes(value as ThemeMode);

/** The profile field for a choice and mode, with unset keys left out (Firestore rejects undefined). */
export function toPreference(choice: SchemeChoice, mode: string | undefined): AppearancePreference {
  return {
    scheme: choice.scheme,
    ...(choice.scheme === "custom" && choice.accent ? { accent: choice.accent.toLowerCase() } : {}),
    ...(isThemeMode(mode) ? { mode } : {}),
  };
}
