import { hexToOklch, oklchToHex } from "@/features/appearance/lib/color";
import { deriveDark } from "@/features/appearance/lib/derive-scheme";
import { CUSTOM_SCHEME, DEFAULT_SCHEME, SCHEME_PRESETS, type SchemeChoice } from "@/features/appearance/lib/schemes";

const FAVICON_ID = "gwa-favicon";

/** The logo as an SVG data URL: the scheme's bright accent on the black tile. */
export function faviconHref(markHex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#000"/><g transform="translate(4 4)" fill="none" stroke="${markHex}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/></g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** The glyph color for a choice: its dark-mode accent, which always reads on black. */
export function faviconMark(choice: SchemeChoice): string | null {
  if (choice.scheme === DEFAULT_SCHEME) return null;
  const seed =
    choice.scheme === CUSTOM_SCHEME
      ? choice.accent && hexToOklch(choice.accent)
      : SCHEME_PRESETS.find((preset) => preset.id === choice.scheme)?.dark;
  return seed ? oklchToHex(deriveDark(seed).primary) : null;
}

/**
 * Points the browser tab icon at a recolored SVG logo, or removes it for the
 * default amber so the static icons apply again. Home-screen and app icons are
 * fixed image files and keep the amber logo.
 */
export function applyFavicon(choice: SchemeChoice): void {
  const mark = faviconMark(choice);
  let link = document.getElementById(FAVICON_ID) as HTMLLinkElement | null;
  if (!mark) return void link?.remove();
  if (!link) {
    link = document.createElement("link");
    link.id = FAVICON_ID;
    link.rel = "icon";
    link.type = "image/svg+xml";
    document.head.appendChild(link);
  }
  link.href = faviconHref(mark);
}

/** The scheme's bright accent (reads on dark backgrounds); amber for the default scheme. */
export function brightAccent(choice: SchemeChoice): string {
  return faviconMark(choice) ?? "#fbb217";
}
