import { captionLines, type CaptionFont } from "@/features/share/lib/caption-lines";
import { FOOTER_GAP, LINE, SMALL } from "@/features/share/lib/share-layout";
import { FORMAT_SIZE, type ShareFormat } from "@/features/share/lib/share-options";

/**
 * The receipt's sizes in image pixels. The template sets these exact sizes and
 * line heights, so the budget below matches what's drawn.
 */
export const RECEIPT = {
  text: 30,
  small: 24,
  heading: 28,
  title: 44,
  gwa: 56,
  /** Line height of body lines; the title and GWA use 1.2, the caption 1.3. */
  lineHeight: 1.45,
  barcode: 90,
  /** Inner padding of the paper, and the height of its torn edge. */
  pad: 56,
  edge: 16,
  /** A dashed rule: 3px plus 14px above and below. */
  divider: 31,
  width: { post: 860, story: 880 } as Record<ShareFormat, number>,
  top: { post: 60, story: 190 } as Record<ShareFormat, number>,
  bottom: { post: 44, story: 100 } as Record<ShareFormat, number>,
};

const MIN_CAPTION = 20;
const line = (size: number) => size * RECEIPT.lineHeight;

export interface ReceiptParts {
  units: boolean;
  honor: boolean;
  who: boolean;
  caption: string;
  /** Subject rows wanted (0: no item lines). */
  subjects: number;
}

export interface ReceiptLayout {
  rows: number;
  /** The caption's size: smaller for a long one. */
  caption: number;
  height: number;
  room: number;
}

function fixedHeight(format: ShareFormat, parts: ReceiptParts, caption: number): number {
  const inner = RECEIPT.width[format] - 2 * RECEIPT.pad;
  return (
    RECEIPT.title * 1.2 +
    line(RECEIPT.small) +
    line(RECEIPT.heading) +
    3 * RECEIPT.divider +
    (parts.units ? line(RECEIPT.text) : 0) +
    RECEIPT.gwa * 1.2 +
    (parts.honor ? line(RECEIPT.text) : 0) +
    line(RECEIPT.small) +
    caption * 1.3 * captionLines(parts.caption, "mono", caption, inner) +
    (parts.who ? line(RECEIPT.text) : 0) +
    RECEIPT.barcode +
    24 +
    line(RECEIPT.text) +
    line(RECEIPT.small)
  );
}

/** How many item lines fit on the receipt, with the caption shrinking for a long one. */
export function receiptLayout(format: ShareFormat, parts: ReceiptParts): ReceiptLayout {
  const room =
    FORMAT_SIZE[format].height - RECEIPT.top[format] - RECEIPT.bottom[format] - SMALL * LINE - FOOTER_GAP - 2 * (RECEIPT.pad + RECEIPT.edge);
  const row = line(RECEIPT.text);
  const least = parts.subjects > 0 ? row * (parts.subjects > 1 ? 2 : 1) : 0;
  let caption = RECEIPT.text;
  let fixed = fixedHeight(format, parts, caption);
  while (fixed + least > room && caption > MIN_CAPTION) {
    caption -= 2;
    fixed = fixedHeight(format, parts, caption);
  }
  let rows = parts.subjects;
  if (rows * row > room - fixed) rows = Math.max(0, Math.floor((room - fixed - row) / row));
  const more = rows < parts.subjects ? row : 0;
  return { rows, caption, height: fixed + rows * row + more, room };
}

/** The largest size from `sizes` (biggest first) at which the caption fits in `maxLines`. */
export function fitCaption(text: string, font: CaptionFont, width: number, sizes: number[], maxLines: number): number {
  return sizes.find((size) => captionLines(text, font, size, width) <= maxLines) ?? sizes[sizes.length - 1];
}
