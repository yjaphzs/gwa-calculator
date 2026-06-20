// GWA + honor helpers for the leaderboard, computed server-side.
//
// NOTE: this is a deliberate duplicate of the client's `src/lib/academic.ts`.
// The functions package can't import from the app's `src/`, so these MUST be
// kept in sync with that file (same bands, same rounding, same min-units gate).

/** Minimum total units before an honor classification is shown. */
export const HONOR_MIN_UNITS = 12;

/** Minimum cumulative units required to appear on the overall leaderboard. */
export const LEADERBOARD_MIN_UNITS = HONOR_MIN_UNITS;

/** Minimum units in a single semester for it to appear on a per-term board. */
export const LEADERBOARD_SEMESTER_MIN_UNITS = HONOR_MIN_UNITS;

export interface GwaResult {
  /** Weighted average rounded to 3 decimals, or null when there are no units. */
  gwa: number | null;
  totalUnits: number;
}

/**
 * Σ(grade × units) / Σ(units), rounded to 3 decimals. Mirrors the client's
 * `computeGwa` so the leaderboard matches what the user sees in-app.
 */
export function computeGwa(
  subjects: { grade: number; units: number }[],
): GwaResult {
  const totalUnits = subjects.reduce((acc, s) => acc + s.units, 0);
  if (totalUnits === 0) return { gwa: null, totalUnits: 0 };
  const totalWeightedGrades = subjects.reduce(
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
