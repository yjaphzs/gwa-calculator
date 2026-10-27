import { notCountedLabel } from "@/features/calculator/lib/subject-status";
import { escapeHtml, formatGrade, formatGwa, formatUnits } from "@/features/reports/lib/format";
import { renderHonorPill } from "@/features/reports/lib/blocks/summary";
import { weightedSum } from "@/lib/academic";
import type { Subject } from "@/types";

function renderSubjectRow(s: Subject, index: number): string {
  // Excluded and INC/DRP/W subjects stay listed for the record, muted and
  // tagged, but contribute nothing to the totals.
  const notCounted = notCountedLabel(s);
  const tag = notCounted ? ` <span class="tag">${escapeHtml(notCounted)}</span>` : "";
  return `
      <tr${notCounted ? ' class="not-counted"' : ""}>
        <td class="num muted">${index + 1}</td>
        <td>${escapeHtml(s.code)}</td>
        <td>${escapeHtml(s.title)}${tag}</td>
        <td class="num">${formatUnits(s.units)}</td>
        <td class="num">${s.mark ?? formatGrade(s.grade)}</td>
        <td class="num">${notCounted ? "Not counted" : (s.grade * s.units).toFixed(2)}</td>
      </tr>`;
}

/** Subjects with a Grade × Units column and a totals footer, then the division itself. */
export function renderSubjectsTable(subjects: Subject[], gwa: number | null, totalUnits: number): string {
  const rows = subjects.map(renderSubjectRow).join("");
  const weighted = weightedSum(subjects).toFixed(2);
  const formula =
    gwa === null
      ? ""
      : `<p class="formula-line">GWA = ${weighted} ÷ ${formatUnits(totalUnits)} = <strong class="mono">${formatGwa(gwa)}</strong></p>`;

  return `
<table class="data-table">
  <thead>
    <tr>
      <th class="num">#</th><th>Code</th><th>Subject</th>
      <th class="num">Units</th><th class="num">Grade</th><th class="num">Grade × units</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
  <tfoot>
    <tr><td></td><td colspan="2">Total</td><td class="num">${formatUnits(totalUnits)}</td><td></td><td class="num">${weighted}</td></tr>
  </tfoot>
</table>
${formula}`;
}

export interface OverviewRow {
  term: string;
  subjectCount: number;
  units: number;
  gwa: number | null;
  honor: string | null;
}

/** One line per semester — doubles as the trend chart's table view. */
export function renderSemesterOverview(rows: OverviewRow[]): string {
  const body = rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.term)}</td>
        <td class="num">${r.subjectCount}</td>
        <td class="num">${formatUnits(r.units)}</td>
        <td class="num">${formatGwa(r.gwa)}</td>
        <td>${renderHonorPill(r.honor)}</td>
      </tr>`,
    )
    .join("");

  return `
<table class="data-table">
  <thead>
    <tr><th>Term</th><th class="num">Subjects</th><th class="num">Units</th><th class="num">GWA</th><th>Honor</th></tr>
  </thead>
  <tbody>${body}</tbody>
</table>`;
}
