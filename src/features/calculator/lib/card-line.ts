import { CARD_LINES } from "@/features/calculator/content/card-lines";
import type { HonorProgress } from "@/lib/gwa-insights";

export type CardLineState = keyof typeof CARD_LINES;

/** Which set of lines fits: an improvement over last semester wins, then the honor standing. */
export function cardLineState(progress: HonorProgress, improved: boolean): CardLineState {
  if (improved && progress.kind !== "empty") return "improved";
  return progress.kind;
}

/** Days since the epoch in local time, so the line changes at local midnight. */
export const localDay = (date: Date) => Math.floor((date.getTime() - date.getTimezoneOffset() * 60_000) / 86_400_000);

/** Today's line for a state; `offset` steps through the rest (a tap shows the next). */
export function cardLine(state: CardLineState, day: number, offset = 0): string {
  const lines = CARD_LINES[state];
  return lines[(((day + offset) % lines.length) + lines.length) % lines.length];
}
