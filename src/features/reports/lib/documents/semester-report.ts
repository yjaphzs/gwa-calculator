import { renderDisclaimer, renderHeader, renderRunningFooter } from "@/features/reports/lib/blocks/chrome";
import { renderSectionHead, renderStatTiles, renderStudentBlock } from "@/features/reports/lib/blocks/summary";
import { renderSubjectsTable } from "@/features/reports/lib/blocks/tables";
import {
  honorTile,
  studentRows,
  type BuiltDocument,
  type ReportIdentity,
} from "@/features/reports/lib/documents/shared";
import { formatDate, formatGwa, formatUnits } from "@/features/reports/lib/format";
import { renderDocument } from "@/features/reports/lib/render-document";
import { computeGwa, countsTowardGwa, getHonorFor } from "@/lib/academic";
import type { Subject } from "@/types";

/** "2 not counted" when some subjects are excluded or marked INC/DRP/W. */
function notCountedNote(subjects: Subject[]): string | undefined {
  const count = subjects.filter((s) => !countsTowardGwa(s)).length;
  return count > 0 ? `${count} not counted` : undefined;
}

export interface SemesterReportOptions extends ReportIdentity {
  /** e.g. "First Semester, S.Y. 2025-2026". Omit for the current working set. */
  periodLabel?: string | null;
  subjects: Subject[];
}

/** One semester (or the working set): headline figures, then every subject. */
export function buildSemesterReport(opts: SemesterReportOptions, now = new Date()): BuiltDocument {
  const { appName, appUrl, periodLabel, subjects } = opts;
  const { gwa, totalUnits } = computeGwa(subjects);
  const generatedOn = formatDate(now);

  const body = [
    renderHeader({
      appName,
      title: "Semester Report",
      subtitle: periodLabel ?? "Current subjects, not yet saved as a semester",
    }),
    renderStudentBlock(studentRows(opts, generatedOn)),
    renderStatTiles([
      { label: "GWA", value: formatGwa(gwa), hero: true },
      { label: "Total units", value: formatUnits(totalUnits) },
      { label: "Subjects", value: String(subjects.length), note: notCountedNote(subjects) },
      honorTile("Honor", getHonorFor(subjects), totalUnits),
    ]),
    renderSectionHead("Subjects"),
    renderSubjectsTable(subjects, gwa, totalUnits),
    renderDisclaimer(appName, generatedOn),
  ].join("");

  const title = periodLabel ? `Semester Report, ${periodLabel}` : "Semester Report";
  return { title, html: renderDocument({ title, body, footer: renderRunningFooter(appName, appUrl) }) };
}
