import { CHILL } from "@/features/share/content/captions/chill";
import { CUTE } from "@/features/share/content/captions/cute";
import { FUN } from "@/features/share/content/captions/fun";
import { MINIMAL } from "@/features/share/content/captions/minimal";
import { PROUD } from "@/features/share/content/captions/proud";
import { RETRO } from "@/features/share/content/captions/retro";
import { ROCK } from "@/features/share/content/captions/rock";
import { SAD } from "@/features/share/content/captions/sad";
import type { MoodId } from "@/features/share/lib/moods";
import type { CaptionLanguage } from "@/features/share/lib/share-options";

export type CaptionResult = "honor" | "progress";

/**
 * One mood's lines in one language. "honor" lines only show when the result
 * earns an honor, "progress" ones when it doesn't, and "any" fit both, so each
 * result gets its own pool of 20. Copy rules: short, playful, no em dashes.
 */
export interface CaptionSet {
  honor: string[];
  progress: string[];
  any: string[];
}

export type MoodCaptions = Record<CaptionLanguage, CaptionSet>;

export const CAPTIONS: Record<MoodId, MoodCaptions> = {
  proud: PROUD,
  fun: FUN,
  chill: CHILL,
  sad: SAD,
  rock: ROCK,
  cute: CUTE,
  retro: RETRO,
  minimal: MINIMAL,
};

/** The longest caption a user can write; long ones are set smaller to fit. */
export const OWN_CAPTION_MAX = 80;

/** The lines Shuffle steps through: the result's own lines first, then the ones that fit any result. */
export function captionPool(mood: MoodId, language: CaptionLanguage, result: CaptionResult): string[] {
  const set = CAPTIONS[mood][language];
  return [...set[result], ...set.any];
}

/** `index` wrapped into 0..length-1, so Shuffle can count up forever. */
export const wrapIndex = (index: number, length: number) => ((index % length) + length) % length;

export function captionFor(mood: MoodId, language: CaptionLanguage, result: CaptionResult, index: number): string {
  const lines = captionPool(mood, language, result);
  return lines[wrapIndex(index, lines.length)];
}
