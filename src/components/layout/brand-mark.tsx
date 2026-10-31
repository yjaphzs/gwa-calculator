import { cn } from "@/lib/utils";

/**
 * The app mark (a calculator, as in the original artwork) drawn as SVG so it
 * follows the color scheme: `--logo-tile` behind, `--logo-mark` for the glyph.
 * Both default to the black tile and the accent (globals.css); a scheme whose
 * accent is too dark for black swaps them (features/appearance).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" fill="var(--logo-tile)" />
      <g
        transform="translate(4 4)"
        fill="none"
        stroke="var(--logo-mark)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <line x1="8" x2="16" y1="6" y2="6" />
        <line x1="16" x2="16" y1="14" y2="18" />
        <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
      </g>
    </svg>
  );
}
