// Shared geometry for the GWA-by-semester charts (the printable Academic
// Summary and the Semesters tab). Lower GWA is better, so the axis is inverted:
// the best value maps to the top of the plot.

export const HONORS_LINE = 2.0;

/** Value domain padded to quarter steps, clamped to the 1.00–5.00 scale, at least 0.5 tall. */
export function trendDomain(values: number[]): [number, number] {
  let lo = Math.max(1, Math.floor((Math.min(...values) - 0.1) * 4) / 4);
  let hi = Math.min(5, Math.ceil((Math.max(...values) + 0.1) * 4) / 4);
  if (hi - lo < 0.5) {
    hi = Math.min(5, lo + 0.5);
    lo = Math.max(1, hi - 0.5);
  }
  return [lo, hi];
}

export interface TrendFrame {
  width: number;
  height: number;
  pad: { top: number; right: number; bottom: number; left: number };
  /** Keeps the first and last points (and their centered labels) off the plot edges. */
  inset?: number;
}

export interface TrendScale {
  lo: number;
  hi: number;
  ticks: number[];
  x: (index: number) => number;
  y: (gwa: number) => number;
  /** Whether the 2.00 honors cutoff falls inside the plotted range. */
  showHonorsLine: boolean;
}

/** Scales for `count` evenly spaced points with the given values. */
export function trendScale(values: number[], frame: TrendFrame): TrendScale {
  const [lo, hi] = trendDomain(values);
  const step = hi - lo > 2 ? 0.5 : 0.25;
  const { width, height, pad, inset = 0 } = frame;
  const plotW = width - pad.left - pad.right - 2 * inset;
  const plotH = height - pad.top - pad.bottom;
  const last = Math.max(1, values.length - 1);

  return {
    lo,
    hi,
    ticks: Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step),
    x: (index) => pad.left + inset + (index * plotW) / last,
    y: (gwa) => pad.top + ((gwa - lo) / (hi - lo)) * plotH,
    showHonorsLine: HONORS_LINE > lo && HONORS_LINE < hi,
  };
}
