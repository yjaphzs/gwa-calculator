// NOTE: `computeGwa`, the honor bands, and `HONOR_MIN_UNITS` are duplicated in
// `functions/src/lib/academic.ts` (the functions package can't import from this
// `src/` tree). Keep the two files in sync — same bands, rounding, and gate.

export interface HonorBand {
    name: string;
    /** Exclusive lower bound, except the first band which includes it. */
    min: number;
    /** Inclusive upper bound. */
    max: number;
}

/** Per-semester honors (1.00 = highest). Shown only with ≥ {@link HONOR_MIN_UNITS}. */
export const ACADEMIC_HONOR_BANDS: readonly HonorBand[] = [
    { name: "University Scholar", min: 1.0, max: 1.5 },
    { name: "College Scholar", min: 1.5, max: 1.75 },
    { name: "Dean's Lister", min: 1.75, max: 2.0 },
];

/**
 * Latin (graduation) honors based on a cumulative GWA — used for the overall
 * standing in the Academic Summary, not for individual semesters. Bands (UP
 * style, 1.00 = highest): Summa 1.00–1.20, Magna 1.21–1.45, Cum Laude 1.46–1.75.
 */
export const LATIN_HONOR_BANDS: readonly HonorBand[] = [
    { name: "Summa Cum Laude", min: 1.0, max: 1.2 },
    { name: "Magna Cum Laude", min: 1.2, max: 1.45 },
    { name: "Cum Laude", min: 1.45, max: 1.75 },
];

function bandFor(bands: readonly HonorBand[], gwa: number): string | null {
    const [first] = bands;
    if (gwa >= first.min && gwa <= first.max) return first.name;
    const band = bands.slice(1).find((b) => gwa > b.min && gwa <= b.max);
    return band?.name ?? null;
}

export function getAcademicHonor(gwa: number) {
    return bandFor(ACADEMIC_HONOR_BANDS, gwa);
}

export function getLatinHonor(gwa: number) {
    return bandFor(LATIN_HONOR_BANDS, gwa);
}

/** Minimum units required before an honor classification is shown. */
export const HONOR_MIN_UNITS = 12;

/** Grades offered by the subject form (1.00 = highest, 5.00 = failed). */
export const GRADE_OPTIONS: readonly number[] = [
    1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 4.0, 5.0,
];

/** Units offered by the subject form (imports may still carry decimals). */
export const UNIT_OPTIONS: readonly number[] = Array.from({ length: 10 }, (_, i) => i + 1);

/**
 * Non-numeric marks a subject can carry instead of a final grade. IP is for
 * courses that continue into the next term (thesis, practicum): the grade comes
 * when the course is completed, usually recorded in that later term.
 */
export type SubjectMark = "INC" | "DRP" | "W" | "IP";

export const SUBJECT_MARKS: readonly { value: SubjectMark; label: string }[] = [
    { value: "INC", label: "Incomplete" },
    { value: "DRP", label: "Dropped" },
    { value: "W", label: "Withdrawn" },
    { value: "IP", label: "In progress" },
];

/** What the GWA math needs from a subject. */
export interface GwaInput {
    grade: number;
    units: number;
    /** Left out of the GWA by school policy (e.g. NSTP). */
    excluded?: boolean;
    /** INC/DRP/W/IP: not a final grade, so it doesn't count until there is one. */
    mark?: SubjectMark | null;
}

/** Whether a subject is part of the GWA (not excluded and not marked INC/DRP/W/IP). */
export function countsTowardGwa(subject: GwaInput): boolean {
    return !subject.excluded && !subject.mark;
}

export interface GwaResult {
    /** Weighted average rounded to 3 decimals, or null when there are no units. */
    gwa: number | null;
    /** Units of the subjects that count; excluded and marked subjects are left out. */
    totalUnits: number;
}

/**
 * Computes the GWA for a set of subjects: Σ(grade × units) / Σ(units), rounded
 * to 3 decimals, over the subjects that count toward it. The single source for
 * every GWA shown in the app, the printable reports, and the guide.
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

/** Σ(grade × units) over the subjects that count, unrounded. */
export function weightedSum(subjects: GwaInput[]): number {
    return subjects.filter(countsTowardGwa).reduce((acc, s) => acc + s.grade * s.units, 0);
}

/** The honor for a set of subjects, applying the {@link HONOR_MIN_UNITS} gate. */
export function getHonorFor(subjects: GwaInput[]): string | null {
    const { gwa, totalUnits } = computeGwa(subjects);
    if (gwa === null || totalUnits < HONOR_MIN_UNITS) return null;
    return getAcademicHonor(gwa);
}

/**
 * Latin honor for a cumulative standing (all subjects of all semesters), with
 * the same units gate as semester honors. Graduation honors, so use it only
 * for cumulative results, never for a single term.
 */
export function getLatinHonorFor(subjects: GwaInput[]): string | null {
    const { gwa, totalUnits } = computeGwa(subjects);
    if (gwa === null || totalUnits < HONOR_MIN_UNITS) return null;
    return getLatinHonor(gwa);
}
