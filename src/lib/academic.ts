// NOTE: `computeGwa`, `getLatinHonor`, and `HONOR_MIN_UNITS` are duplicated in
// `functions/src/lib/academic.ts` (the functions package can't import from this
// `src/` tree). Keep the two files in sync — same bands, rounding, and gate.

export function getAcademicHonor(gwa: number) {
    if (gwa >= 1.00 && gwa <= 1.50) return "University Scholar";
    if (gwa > 1.50 && gwa <= 1.75) return "College Scholar";
    if (gwa > 1.75 && gwa <= 2.00) return "Dean's Lister";
    return null;
}

/**
 * Latin (graduation) honors based on a cumulative GWA — used for the overall
 * standing in the Academic Summary, not for individual semesters. Bands (UP
 * style, 1.00 = highest): Summa 1.00–1.20, Magna 1.21–1.45, Cum Laude 1.46–1.75.
 */
export function getLatinHonor(gwa: number) {
    if (gwa >= 1.00 && gwa <= 1.20) return "Summa Cum Laude";
    if (gwa > 1.20 && gwa <= 1.45) return "Magna Cum Laude";
    if (gwa > 1.45 && gwa <= 1.75) return "Cum Laude";
    return null;
}

/** Minimum units required before an honor classification is shown. */
export const HONOR_MIN_UNITS = 12;

export interface GwaResult {
    /** Weighted average rounded to 3 decimals, or null when there are no units. */
    gwa: number | null;
    totalUnits: number;
}

/**
 * Computes the GWA for a set of subjects: Σ(grade × units) / Σ(units), rounded
 * to 3 decimals. Mirrors the inline calculation used across the app so reports
 * stay consistent with what's shown on screen.
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

/** The honor for a set of subjects, applying the {@link HONOR_MIN_UNITS} gate. */
export function getHonorFor(
    subjects: { grade: number; units: number }[],
): string | null {
    const { gwa, totalUnits } = computeGwa(subjects);
    if (gwa === null || totalUnits < HONOR_MIN_UNITS) return null;
    return getAcademicHonor(gwa);
}
