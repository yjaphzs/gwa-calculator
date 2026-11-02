import type { SeasonId } from "@/features/share/lib/seasons";

/** The feel of a share template. Each has a few color variants and its own captions (captions.ts). */
export type BaseMoodId = "proud" | "fun" | "chill" | "sad" | "rock" | "cute" | "retro" | "minimal";
export type SeasonalMoodId = "pasko" | "valentines" | "recognition" | "spooky";
export type MoodId = BaseMoodId | SeasonalMoodId;

export interface MoodVariant {
  label: string;
  /** CSS background for the whole image (gradients and patterns allowed). */
  background: string;
  /** Cards and the subject list. */
  surface: string;
  text: string;
  muted: string;
  /** The GWA, the honor ribbon, highlights. */
  accent: string;
  /** Text on the accent (the honor ribbon). */
  onAccent: string;
}

export interface Mood {
  id: MoodId;
  label: string;
  emoji: string;
  /** The display face: Roboto (sans), Roboto Serif, or Martian Mono. */
  font: "sans" | "serif" | "mono";
  uppercase?: boolean;
  /** Decorations around the edges of the image. */
  stickers: string[];
  variants: MoodVariant[];
  /** Seasonal moods only show during their window (lib/seasons.ts). */
  season?: SeasonId;
}

/** Builds a variant; the order matches MoodVariant. */
export const v = (label: string, background: string, surface: string, text: string, muted: string, accent: string, onAccent: string): MoodVariant => ({
  label,
  background,
  surface,
  text,
  muted,
  accent,
  onAccent,
});
