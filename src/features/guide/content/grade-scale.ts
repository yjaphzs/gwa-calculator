export interface GradeEquivalent {
  grade: string;
  /** Typical percentage range, or null when the grade isn't a score (e.g. 4.00). */
  percent: string | null;
  meaning: string;
}

/**
 * A common Philippine college grading scale. Schools publish their own cutoffs,
 * so the guide presents these as typical, not authoritative.
 */
export const GRADE_EQUIVALENTS: readonly GradeEquivalent[] = [
  { grade: "1.00", percent: "97–100", meaning: "Excellent" },
  { grade: "1.25", percent: "94–96", meaning: "Excellent" },
  { grade: "1.50", percent: "91–93", meaning: "Very good" },
  { grade: "1.75", percent: "88–90", meaning: "Very good" },
  { grade: "2.00", percent: "85–87", meaning: "Good" },
  { grade: "2.25", percent: "82–84", meaning: "Good" },
  { grade: "2.50", percent: "79–81", meaning: "Satisfactory" },
  { grade: "2.75", percent: "76–78", meaning: "Fair" },
  { grade: "3.00", percent: "75", meaning: "Passing" },
  { grade: "4.00", percent: null, meaning: "Conditional: needs a removal exam or completion" },
  { grade: "5.00", percent: "Below 75", meaning: "Failed" },
];
