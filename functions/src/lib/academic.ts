// GWA + honor helpers for the leaderboard, computed server-side.
//
// NOTE: this is a deliberate duplicate of the client's `src/lib/academic.ts`.
// The functions package can't import from the app's `src/`, so these MUST be
// kept in sync with that file (same bands, same rounding, same min-units gate).

/** Minimum total units before an honor classification is shown. */
export const HONOR_MIN_UNITS = 12;

/**
 * Overall (academic-summary) board gate — meant to represent a *complete*
 * record, so only near-/fully-finished students appear:
 *   - at least this many cumulative units (≈ a full bachelor's load), and
 *   - at least {@link LEADERBOARD_MIN_SEMESTERS} saved semesters.
 */
export const LEADERBOARD_MIN_UNITS = 120;

/** Minimum saved semesters for the overall board (2/yr × 4 yrs = a full program). */
export const LEADERBOARD_MIN_SEMESTERS = 8;

/** Minimum units in a single semester for it to appear on a per-term board. */
export const LEADERBOARD_SEMESTER_MIN_UNITS = HONOR_MIN_UNITS;

export interface GwaResult {
  /** Weighted average rounded to 3 decimals, or null when there are no units. */
  gwa: number | null;
  totalUnits: number;
}

/** What the GWA math needs from a stored subject. */
export interface GwaInput {
  grade: number;
  units: number;
  /** Left out of the GWA by school policy (e.g. NSTP). */
  excluded?: boolean;
  /** INC / DRP / W / IP: not a final grade, so it doesn't count until there is one. */
  mark?: string | null;
}

/** Whether a subject is part of the GWA. Mirrors the client's `countsTowardGwa`. */
export function countsTowardGwa(subject: GwaInput): boolean {
  return !subject.excluded && !subject.mark;
}

/**
 * Σ(grade × units) / Σ(units), rounded to 3 decimals, over the subjects that
 * count. Mirrors the client's `computeGwa` so the leaderboard matches what the
 * user sees in-app.
 */
export function computeGwa(subjects: GwaInput[]): GwaResult {
  const counted = subjects.filter(countsTowardGwa);
  const totalUnits = counted.reduce((acc, s) => acc + s.units, 0);
  if (totalUnits === 0) return { gwa: null, totalUnits: 0 };
  const totalWeightedGrades = counted.reduce(
    (acc, s) => acc + s.grade * s.units,
    0,
  );
  return {
    gwa: parseFloat((totalWeightedGrades / totalUnits).toFixed(3)),
    totalUnits,
  };
}

/**
 * Latin (graduation) honors based on a cumulative GWA (1.00 = highest):
 * Summa 1.00–1.20, Magna 1.21–1.45, Cum Laude 1.46–1.75.
 */
export function getLatinHonor(gwa: number): string | null {
  if (gwa >= 1.0 && gwa <= 1.2) return "Summa Cum Laude";
  if (gwa > 1.2 && gwa <= 1.45) return "Magna Cum Laude";
  if (gwa > 1.45 && gwa <= 1.75) return "Cum Laude";
  return null;
}

/**
 * Per-semester scholarship honors (1.00 = highest): University Scholar
 * 1.00–1.50, College Scholar >1.50–1.75, Dean's Lister >1.75–2.00. Mirrors the
 * client's `getAcademicHonor`.
 */
export function getAcademicHonor(gwa: number): string | null {
  if (gwa >= 1.0 && gwa <= 1.5) return "University Scholar";
  if (gwa > 1.5 && gwa <= 1.75) return "College Scholar";
  if (gwa > 1.75 && gwa <= 2.0) return "Dean's Lister";
  return null;
}
