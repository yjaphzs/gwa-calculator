import { captionLines, type CaptionFont } from "@/features/share/lib/caption-lines";
import { FORMAT_SIZE, type ShareFormat } from "@/features/share/lib/share-options";

/** Line height for one-line text, set explicitly so the budget below holds in every font. */
export const LINE = 1.2;
export const CAPTION_LINE = 1.12;
/** Side padding of the image; the content box is 900 wide. */
export const SIDE = 90;
/** Space above the footer, and the footer and "+N more" font size. */
export const FOOTER_GAP = 24;
export const SMALL = 26;
/** Vertical padding of the subject list box. */
export const LIST_PAD = 14;
export const WHO = 30;
/** A long caption shrinks toward this size before anything else gives way. */
const MIN_CAPTION = 28;

/** Every size in image pixels. */
export interface TemplateSizes {
  /** Top padding: the band the stickers sit in, so they never reach the text. */
  top: number;
  bottom: number;
  gap: number;
  heading: number;
  hero: number;
  ribbon: number;
  ribbonPad: number;
  units: number;
  caption: number;
  trend: number;
  row: number;
  rowPad: number;
}

const s = (top: number, bottom: number, gap: number, heading: number, hero: number, ribbon: number, ribbonPad: number, units: number, caption: number, trend: number, row: number, rowPad: number): TemplateSizes => ({
  top, bottom, gap, heading, hero, ribbon, ribbonPad, units, caption, trend, row, rowPad,
});

// Roomy: the GWA, honor and caption only. Compact: a subject list or the trend is shown too.
const SIZES: Record<ShareFormat, { roomy: TemplateSizes; compact: TemplateSizes }> = {
  post: {
    roomy: s(170, 60, 36, 34, 300, 40, 14, 34, 68, 170, 34, 14),
    compact: s(170, 60, 26, 30, 180, 34, 10, 30, 46, 130, 30, 10),
  },
  story: {
    roomy: s(250, 90, 56, 36, 360, 44, 16, 36, 80, 200, 34, 14),
    compact: s(250, 90, 40, 34, 240, 40, 14, 34, 60, 170, 32, 12),
  },
};

/** What the image shows besides the GWA. */
export interface LayoutParts {
  honor: boolean;
  units: boolean;
  trend: boolean;
  who: boolean;
  /** Subject rows wanted after filtering (0: no list). */
  subjects: number;
  /** The caption and the mood's face, to work out how many lines it takes. */
  caption: string;
  font: CaptionFont;
}

export interface TemplateLayout {
  /** The sizes to draw with; `caption` may be smaller than the table's for a long caption. */
  sizes: TemplateSizes;
  /** Subject rows that fit; the rest become "+N more". */
  rows: number;
  /** Budgeted height of the content column, and the room it has. */
  height: number;
  room: number;
}

const rowHeight = (z: TemplateSizes) => z.row * LINE + 2 * z.rowPad + 2;
const moreHeight = (z: TemplateSizes) => SMALL * LINE + 2 * z.rowPad;
const listHeight = (z: TemplateSizes, rows: number, more: boolean) =>
  rows || more ? 2 * LIST_PAD + rows * rowHeight(z) + (more ? moreHeight(z) : 0) : 0;

/** Height of everything above the subject list, gaps included. */
function blocksHeight(z: TemplateSizes, parts: LayoutParts): number {
  const blocks = [
    z.heading * LINE,
    z.hero,
    parts.honor ? z.ribbon * LINE + 2 * z.ribbonPad : 0,
    parts.units ? z.units * LINE : 0,
    z.caption * CAPTION_LINE * captionLines(parts.caption, parts.font, z.caption),
    parts.trend ? z.trend + SMALL * LINE + 4 : 0,
    parts.who ? WHO * LINE : 0,
  ].filter((h) => h > 0);
  return blocks.reduce((sum, h) => sum + h, 0) + z.gap * (blocks.length - 1);
}

/**
 * Sizes for the image and how many subject rows fit under everything else
 * that's switched on, so the column never runs into the footer. A caption too
 * long for the room (the user's own) is set smaller, keeping one subject row.
 */
export function templateLayout(format: ShareFormat, parts: LayoutParts): TemplateLayout {
  const compact = parts.subjects > 0 || parts.trend;
  let z = SIZES[format][compact ? "compact" : "roomy"];
  const room = FORMAT_SIZE[format].height - z.top - z.bottom - SMALL * LINE - FOOTER_GAP;
  const least = parts.subjects > 0 ? z.gap + listHeight(z, 1, parts.subjects > 1) : 0;
  let fixed = blocksHeight(z, parts);
  while (fixed + least > room && z.caption > MIN_CAPTION) {
    z = { ...z, caption: Math.max(MIN_CAPTION, Math.floor(z.caption * 0.9)) };
    fixed = blocksHeight(z, parts);
  }
  // The list sits one gap below the last block.
  const free = room - fixed - z.gap;
  let rows = parts.subjects;
  if (rows > 0 && listHeight(z, rows, false) > free) {
    rows = Math.max(0, Math.floor((free - 2 * LIST_PAD - moreHeight(z)) / rowHeight(z)));
  }
  const list = listHeight(z, rows, rows < parts.subjects);
  return { sizes: z, rows, height: fixed + (list ? z.gap + list : 0), room };
}
