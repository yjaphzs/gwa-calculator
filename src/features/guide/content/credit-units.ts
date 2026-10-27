export interface CreditUnitRow {
  kind: string;
  units: string;
  note: string;
}

/** How many units common subject types usually carry. */
export const TYPICAL_UNITS: readonly CreditUnitRow[] = [
  { kind: "General education lecture", units: "3", note: "Most core subjects" },
  { kind: "Major lecture", units: "3–5", note: "Heavier majors often carry more" },
  { kind: "Laboratory", units: "1–2", note: "Sometimes bundled with its lecture" },
  { kind: "PE / PATHFit", units: "2", note: "May not count (see below)" },
  { kind: "NSTP", units: "3", note: "Usually doesn't count (see below)" },
];

export interface ExcludedSubjectRow {
  subject: string;
  usually: string;
}

/** Subjects schools commonly leave out of the GWA. Policies differ. */
export const OFTEN_EXCLUDED: readonly ExcludedSubjectRow[] = [
  { subject: "NSTP (CWTS, LTS, ROTC)", usually: "Not counted in the GWA" },
  { subject: "PE (older curricula)", usually: "Often not counted" },
  { subject: "PATHFit", usually: "Counted at many schools, but not all" },
];
