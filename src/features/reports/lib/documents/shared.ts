import type { StatTile } from "@/features/reports/lib/blocks/summary";
import type { ReportPalette } from "@/features/reports/lib/theme";
import { HONOR_MIN_UNITS } from "@/lib/academic";

/** Who and what the document is for. Every personal field is optional (guests have none). */
export interface ReportIdentity {
  appName: string;
  /** Printed in the running footer. */
  appUrl: string;
  studentName?: string | null;
  schoolName?: string | null;
  program?: string | null;
  /** Brand colors from the user's color scheme; amber when omitted. */
  palette?: ReportPalette;
}

export interface BuiltDocument {
  title: string;
  html: string;
}

export function studentRows(
  identity: ReportIdentity,
  generatedOn: string,
): Array<[string, string | null | undefined]> {
  return [
    ["Student", identity.studentName],
    ["School", identity.schoolName],
    ["College / program", identity.program],
    ["Generated", generatedOn],
  ];
}

/** The honor tile, explaining an empty value instead of leaving a bare dash. */
export function honorTile(label: string, honor: string | null, totalUnits: number): StatTile {
  if (honor) return { label, value: honor, text: true };
  const note = totalUnits < HONOR_MIN_UNITS ? `Needs ${HONOR_MIN_UNITS}+ units` : "Outside the honor ranges";
  return { label, value: "None", note, text: true };
}
