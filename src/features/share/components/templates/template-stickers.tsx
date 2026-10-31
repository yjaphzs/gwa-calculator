import type { ShareFormat } from "@/features/share/lib/share-options";

// Spots inside the top band (the layout's top padding: 170 on a post, 250 on
// a story), so a sticker never lands on the heading or the GWA below it.
const SPOTS: Record<ShareFormat, { top: number; left?: number; right?: number; rotate: number; size: number }[]> = {
  post: [
    { top: 30, right: 60, rotate: 12, size: 112 },
    { top: 40, left: 60, rotate: -8, size: 80 },
    { top: 96, right: 200, rotate: -12, size: 54 },
  ],
  story: [
    { top: 56, right: 70, rotate: 12, size: 140 },
    { top: 70, left: 64, rotate: -8, size: 96 },
    { top: 156, right: 240, rotate: -12, size: 64 },
  ],
};

/** The mood's emoji stickers, slightly tilted, as decoration. */
export function TemplateStickers({ stickers, format }: { stickers: string[]; format: ShareFormat }) {
  const spots = SPOTS[format];
  return (
    <>
      {stickers.slice(0, spots.length).map((sticker, i) => {
        const { rotate, size, ...position } = spots[i];
        return (
          <span
            key={`${sticker}-${i}`}
            aria-hidden
            style={{ position: "absolute", ...position, fontSize: size, lineHeight: 1, transform: `rotate(${rotate}deg)`, opacity: 0.92 }}
          >
            {sticker}
          </span>
        );
      })}
    </>
  );
}
