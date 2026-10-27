import { renderDisclaimer, renderHeader, renderRunningFooter } from "@/features/reports/lib/blocks/chrome";
import {
  renderCumulativePanel,
  renderHonorPill,
  renderSectionHead,
  renderStatTiles,
  renderStudentBlock,
} from "@/features/reports/lib/blocks/summary";
import { renderSemesterOverview, renderSubjectsTable } from "@/features/reports/lib/blocks/tables";
import { renderTrendChart } from "@/features/reports/lib/blocks/trend-chart";
import {
  honorTile,
  studentRows,
  type BuiltDocument,
  type ReportIdentity,
} from "@/features/reports/lib/documents/shared";
import { formatDate, formatGwa, formatUnits } from "@/features/reports/lib/format";
import { renderDocument } from "@/features/reports/lib/render-document";
import { formatTermLabel, shortTermLabel, sortOldestFirst } from "@/features/semesters/lib/semesters";
import { HONOR_MIN_UNITS, computeGwa, countsTowardGwa, getHonorFor, getLatinHonor } from "@/lib/academic";
import type { Semester } from "@/types";

export interface AcademicSummaryOptions extends ReportIdentity {
  semesters: Semester[];
}

function subtitle(ordered: Semester[]): string {
  const count = `${ordered.length} semester${ordered.length === 1 ? "" : "s"}`;
  const first = ordered[0]?.schoolYear;
  const last = ordered.at(-1)?.schoolYear;
  if (!first) return count;
  return first === last ? `${count}, S.Y. ${first}` : `${count}, S.Y. ${first} to ${last}`;
}

/** Every saved semester, oldest first, closing with the cumulative GWA and Latin honor. */
export function buildAcademicSummary(opts: AcademicSummaryOptions, now = new Date()): BuiltDocument {
  const { appName, appUrl } = opts;
  const ordered = sortOldestFirst(opts.semesters);
  const terms = ordered.map((sem) => ({ sem, ...computeGwa(sem.subjects), honor: getHonorFor(sem.subjects) }));

  const allSubjects = ordered.flatMap((s) => s.subjects);
  const cumulative = computeGwa(allSubjects);
  // Latin (graduation) honors for the cumulative standing — distinct from the
  // per-semester scholarship honors.
  const latin =
    cumulative.gwa !== null && cumulative.totalUnits >= HONOR_MIN_UNITS ? getLatinHonor(cumulative.gwa) : null;
  const generatedOn = formatDate(now);

  const sections = terms
    .map(({ sem, gwa, totalUnits, honor }) => {
      const meta = `${formatUnits(totalUnits)} units, GWA <strong class="mono">${formatGwa(gwa)}</strong> ${renderHonorPill(honor)}`;
      return `<section class="term">${renderSectionHead(formatTermLabel(sem), meta)}${renderSubjectsTable(sem.subjects, gwa, totalUnits)}</section>`;
    })
    .join("");

  const trend = renderTrendChart(
    terms.filter((t) => t.gwa !== null).map((t) => ({ label: shortTermLabel(t.sem), gwa: t.gwa as number })),
  );

  const body = [
    renderHeader({ appName, title: "Academic Summary", subtitle: subtitle(ordered) }),
    renderStudentBlock(studentRows(opts, generatedOn)),
    renderStatTiles([
      { label: "Cumulative GWA", value: formatGwa(cumulative.gwa), hero: true },
      { label: "Total units", value: formatUnits(cumulative.totalUnits) },
      { label: "Semesters", value: String(ordered.length) },
      honorTile("Latin honor", latin, cumulative.totalUnits),
    ]),
    renderSectionHead("Semester overview"),
    renderSemesterOverview(
      terms.map((t) => ({
        term: formatTermLabel(t.sem),
        subjectCount: t.sem.subjects.length,
        units: t.totalUnits,
        gwa: t.gwa,
        honor: t.honor,
      })),
    ),
    trend ? `${renderSectionHead("GWA by semester")}${trend}` : "",
    sections,
    renderCumulativePanel({
      gwa: formatGwa(cumulative.gwa),
      units: formatUnits(cumulative.totalUnits),
      subjectCount: allSubjects.filter(countsTowardGwa).length,
      honor: latin,
    }),
    renderDisclaimer(appName, generatedOn),
  ].join("");

  const title = "Academic Summary";
  return { title, html: renderDocument({ title, body, footer: renderRunningFooter(appName, appUrl) }) };
}
