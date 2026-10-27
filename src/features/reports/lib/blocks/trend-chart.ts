import { escapeHtml } from "@/features/reports/lib/format";
import { FONT_MONO, FONT_SANS, PRINT } from "@/features/reports/lib/theme";
import { HONORS_LINE, trendScale } from "@/lib/trend-geometry";

export interface TrendPoint {
  label: string;
  gwa: number;
}

const FRAME = { width: 680, height: 200, pad: { top: 22, right: 24, bottom: 32, left: 44 }, inset: 32 };
// Above this many points, x labels alternate so they never collide.
const MAX_FULL_LABELS = 8;

/**
 * Semester GWA as a single-series line. Lower is better, so the axis is
 * inverted and the best grade sits at the top. Only the first and last points
 * are labeled; the overview table above is the full table view. Returns "" for
 * fewer than two semesters (no trend to show).
 */
export function renderTrendChart(points: TrendPoint[]): string {
  if (points.length < 2) return "";

  const { width: W, height: H, pad: PAD } = FRAME;
  const { ticks, x, y, showHonorsLine } = trendScale(points.map((p) => p.gwa), FRAME);

  const grid = ticks
    .map(
      (t) =>
        `<line x1="${PAD.left}" x2="${W - PAD.right}" y1="${y(t)}" y2="${y(t)}" stroke="${PRINT.hairline}" stroke-width="1" />` +
        `<text x="${PAD.left - 8}" y="${y(t) + 3}" text-anchor="end" font-family="${FONT_MONO}" font-size="9" fill="${PRINT.muted}">${t.toFixed(2)}</text>`,
    )
    .join("");

  const honors = showHonorsLine
    ? `<line x1="${PAD.left}" x2="${W - PAD.right}" y1="${y(HONORS_LINE)}" y2="${y(HONORS_LINE)}" stroke="#a1a1aa" stroke-width="1" />` +
      `<text x="${W - PAD.right}" y="${y(HONORS_LINE) - 5}" text-anchor="end" font-family="${FONT_SANS}" font-size="9" fill="${PRINT.muted}">Honors cutoff</text>`
    : "";

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(p.gwa)}`).join(" ");
  const dots = points
    .map((p, i) => `<circle cx="${x(i)}" cy="${y(p.gwa)}" r="4" fill="${PRINT.amberInk}" stroke="${PRINT.white}" stroke-width="2" />`)
    .join("");

  const last = points.length - 1;
  const valueLabels = [0, last]
    .map(
      (i) =>
        `<text x="${x(i)}" y="${y(points[i].gwa) - 10}" text-anchor="middle" font-family="${FONT_MONO}" font-size="10" font-weight="700" fill="${PRINT.ink}">${points[i].gwa.toFixed(3)}</text>`,
    )
    .join("");

  const thin = points.length > MAX_FULL_LABELS;
  const xLabels = points
    .map((p, i) =>
      thin && i % 2 === 1 && i !== last
        ? ""
        : `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" font-family="${FONT_SANS}" font-size="9" fill="${PRINT.muted}">${escapeHtml(p.label)}</text>`,
    )
    .join("");

  const summary = points.map((p) => `${p.label} ${p.gwa.toFixed(3)}`).join(", ");

  return `
<figure class="chart">
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(`GWA by semester: ${summary}`)}">
    ${grid}${honors}
    <path d="${path}" fill="none" stroke="${PRINT.amberInk}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
    ${dots}${valueLabels}${xLabels}
  </svg>
  <figcaption class="chart-caption">
    Lower is better, so the chart puts 1.00 at the top.${honors ? " The gray line marks 2.00, the honors cutoff." : ""}
  </figcaption>
</figure>`;
}
