// Printable grade documents — personal-reference copies, never official records.
// See .claude/skills/printable-reports for the rules (disclaimer, naming, legal sync).
import {
  buildAcademicSummary,
  type AcademicSummaryOptions,
} from "@/features/reports/lib/documents/academic-summary";
import {
  buildSemesterReport,
  type SemesterReportOptions,
} from "@/features/reports/lib/documents/semester-report";
import { printHtmlDocument } from "@/features/reports/lib/print-html";

export type { AcademicSummaryOptions, SemesterReportOptions };

/** Prints a one-semester report for the given subjects. */
export function printSemesterReport(opts: SemesterReportOptions): void {
  printHtmlDocument(buildSemesterReport(opts).html);
}

/** Prints a summary of all saved semesters, with a cumulative GWA. */
export function printAcademicSummary(opts: AcademicSummaryOptions): void {
  printHtmlDocument(buildAcademicSummary(opts).html);
}
