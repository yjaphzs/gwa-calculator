import type { Mood } from "@/features/share/lib/mood-types";
import { SHARE_STYLES, type ShareOptions } from "@/features/share/lib/share-options";

const pick = <T>(list: readonly T[], random: () => number): T => list[Math.floor(random() * list.length)];

/**
 * "Surprise me": a new style, mood, color and preset caption in one tap. The
 * format, what's shown, the caption language, and the user's own caption stay.
 * The result always differs from the current look in style or mood.
 */
export function surpriseOptions(
  options: ShareOptions,
  moods: Mood[],
  random: () => number = Math.random,
): Partial<ShareOptions> {
  let style = pick(SHARE_STYLES, random);
  let mood = pick(moods, random);
  for (let tries = 0; style === options.style && mood.id === options.mood && tries < 8; tries++) {
    style = pick(SHARE_STYLES, random);
    mood = pick(moods, random);
  }
  // A stubborn random source: step to the next mood so the tap always changes something.
  if (style === options.style && mood.id === options.mood && moods.length > 1) {
    mood = moods[(moods.indexOf(mood) + 1) % moods.length];
  }
  return {
    style,
    mood: mood.id,
    // The mood's own colors plus "My theme".
    variant: Math.floor(random() * (mood.variants.length + 1)),
    captionIndex: Math.floor(random() * 100),
  };
}

/** The mood `delta` steps away in the list, wrapping around (for swipes and arrows). */
export function steppedMood(moods: Mood[], current: string, delta: number): Mood {
  const at = Math.max(0, moods.findIndex((m) => m.id === current));
  return moods[(((at + delta) % moods.length) + moods.length) % moods.length];
}
