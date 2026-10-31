/**
 * Color math for the theme schemes: OKLCH (what the CSS tokens use) to and
 * from sRGB, WCAG contrast, and gamut mapping. Pure functions, no DOM.
 */

export interface Oklch {
  /** Lightness, 0–1. */
  l: number;
  /** Chroma, 0–~0.4. */
  c: number;
  /** Hue in degrees. */
  h: number;
}

type Rgb = [number, number, number];

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

/** OKLCH to linear sRGB (may fall outside 0–1 when the color is out of gamut). */
function oklchToLinear({ l, c, h }: Oklch): Rgb {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

function linearToOklch([r, g, b]: Rgb): Oklch {
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const h = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: Math.hypot(A, B), h: h < 0 ? h + 360 : h };
}

const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -0.0001 && v <= 1.0001);

/** The same lightness and hue with chroma reduced until the color fits in sRGB. */
export function toGamut(color: Oklch): Oklch {
  if (inGamut(oklchToLinear(color))) return color;
  let low = 0;
  let high = color.c;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (inGamut(oklchToLinear({ ...color, c: mid }))) low = mid;
    else high = mid;
  }
  return { ...color, c: low };
}

/** WCAG relative luminance of an OKLCH color (gamut-mapped first). */
export function luminance(color: Oklch): number {
  const [r, g, b] = oklchToLinear(toGamut(color)).map((v) => Math.min(1, Math.max(0, v)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors (1–21). */
export function contrast(a: Oklch, b: Oklch): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const WHITE: Oklch = { l: 1, c: 0, h: 0 };
export const BLACK: Oklch = { l: 0, c: 0, h: 0 };

/** "#e11d48" → OKLCH, or null when it isn't a 6-digit hex color. */
export function hexToOklch(hex: string): Oklch | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const n = parseInt(match[1], 16);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => toLinear(v / 255)) as Rgb;
  return linearToOklch(rgb);
}

/** OKLCH → "#rrggbb" (gamut-mapped). */
export function oklchToHex(color: Oklch): string {
  const rgb = oklchToLinear(toGamut(color)).map((v) => Math.round(Math.min(1, Math.max(0, toGamma(Math.max(0, v)))) * 255));
  return `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** CSS value, e.g. "oklch(0.6560 0.2410 354.31)". */
export function formatOklch({ l, c, h }: Oklch): string {
  return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`;
}
