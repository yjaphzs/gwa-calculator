import type { Mood } from "@/features/share/lib/moods";

export type CaptionFont = Mood["font"];

/** The caption box width on the image, in pixels. */
export const CAPTION_WIDTH = 880;

// Widths of the caption face at weight 800, as a share of the font size,
// measured over every caption: the widest word's average per character, and
// a space. Martian Mono is monospaced (capitals included).
const CHAR_EM: Record<CaptionFont, number> = { sans: 0.66, serif: 0.79, mono: 0.7 };
const SPACE_EM: Record<CaptionFont, number> = { sans: 0.25, serif: 0.26, mono: 0.7 };
// Glyphs far wider than that average, counted at their own width so a
// caption like "WWWW" or a row of emoji still gets enough lines.
const WIDE = /[WMmw@]/;
const WIDE_EM: Record<CaptionFont, number> = { sans: 0.9, serif: 1.09, mono: 0.7 };
const EMOJI = /\p{Extended_Pictographic}/u;
const EMOJI_EM = 1.4;
// Room for wider-than-measured text, like a caption typed in capitals.
const SLACK = 0.92;

const charEm = (ch: string, font: CaptionFont) => (EMOJI.test(ch) ? EMOJI_EM : WIDE.test(ch) ? WIDE_EM[font] : CHAR_EM[font]);

/**
 * How many lines a caption wraps to: words fill each line in turn, and a word
 * wider than a line breaks anywhere (the template sets `overflow-wrap: anywhere`).
 * Errs high, so the layout never budgets too little.
 */
export function captionLines(text: string, font: CaptionFont, size: number, width = CAPTION_WIDTH): number {
  const max = width * SLACK;
  const space = SPACE_EM[font] * size;
  let lines = 1;
  let used = 0;
  for (const word of text.trim().split(/\s+/)) {
    const wordWidth = [...word].reduce((sum, ch) => sum + charEm(ch, font), 0) * size;
    if (used > 0 && used + space + wordWidth <= max) {
      used += space + wordWidth;
      continue;
    }
    if (used > 0) lines++;
    const extra = Math.max(0, Math.ceil(wordWidth / max) - 1);
    lines += extra;
    used = wordWidth - extra * max;
  }
  return lines;
}
