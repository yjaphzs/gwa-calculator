import { BASE_MOODS } from "@/features/share/content/moods/base";
import { SEASONAL_MOODS } from "@/features/share/content/moods/seasonal";
import { v, type Mood, type MoodId, type MoodVariant } from "@/features/share/lib/mood-types";
import { inSeason } from "@/features/share/lib/seasons";

export type { BaseMoodId, Mood, MoodId, MoodVariant, SeasonalMoodId } from "@/features/share/lib/mood-types";

/** Every mood: the year-round ones, then the seasonal ones. */
export const MOODS: Mood[] = [...BASE_MOODS, ...SEASONAL_MOODS];

/** The moods to offer today: all year-round moods, plus any seasonal mood in its window. */
export function availableMoods(date: Date): Mood[] {
  return MOODS.filter((m) => !m.season || inSeason(m.season, date));
}


export const moodById = (id: MoodId): Mood => MOODS.find((m) => m.id === id) ?? MOODS[0];

/**
 * The "My theme" variant every mood gets: a dark card lit by the user's own
 * accent color (the bright dark-mode shade, so it reads on the dark base).
 */
export function themeVariant(accentHex: string): MoodVariant {
  return v(
    "My theme",
    `radial-gradient(circle at 50% 0%, ${accentHex}55 0%, #111111 62%)`,
    "rgba(255,255,255,0.06)",
    "#fafafa",
    "#c4c4c8",
    accentHex,
    "#111111",
  );
}

/** The mood's variants plus "My theme". */
export function variantsFor(mood: Mood, accentHex: string): MoodVariant[] {
  return [...mood.variants, themeVariant(accentHex)];
}
