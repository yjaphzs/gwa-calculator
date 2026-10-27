// Derived, display-only insights on top of the GWA rules in ./academic. Client
// only; nothing here needs to be mirrored in functions/.
import {
  ACADEMIC_HONOR_BANDS,
  HONOR_MIN_UNITS,
  computeGwa,
  getAcademicHonor,
  weightedSum,
  type GwaInput,
} from "@/lib/academic";

const round3 = (n: number) => Math.round(n * 1000) / 1000;

export interface NextBand {
  name: string;
  /** How far the GWA must drop to reach the band (lower is better). */
  gap: number;
}

export type HonorProgress =
  | { kind: "empty" }
  | { kind: "needs-units"; unitsShort: number }
  | { kind: "honor"; honor: string; next: NextBand | null }
  | { kind: "outside"; next: NextBand };

/** Where a set of subjects stands relative to the semester honor bands. */
export function honorProgress(subjects: GwaInput[]): HonorProgress {
  const { gwa, totalUnits } = computeGwa(subjects);
  if (gwa === null) return { kind: "empty" };
  if (totalUnits < HONOR_MIN_UNITS) return { kind: "needs-units", unitsShort: HONOR_MIN_UNITS - totalUnits };

  const honor = getAcademicHonor(gwa);
  const index = ACADEMIC_HONOR_BANDS.findIndex((band) => band.name === honor);
  if (index === -1) {
    const lowest = ACADEMIC_HONOR_BANDS[ACADEMIC_HONOR_BANDS.length - 1];
    return { kind: "outside", next: { name: lowest.name, gap: round3(gwa - lowest.max) } };
  }
  const better = ACADEMIC_HONOR_BANDS[index - 1];
  return {
    kind: "honor",
    honor: ACADEMIC_HONOR_BANDS[index].name,
    next: better ? { name: better.name, gap: round3(gwa - better.max) } : null,
  };
}

/** One sentence describing {@link honorProgress}, for the GWA card and the guide. */
export function describeHonorProgress(progress: HonorProgress): string | null {
  switch (progress.kind) {
    case "empty":
      return null;
    case "needs-units":
      return `Add ${progress.unitsShort} more unit${progress.unitsShort === 1 ? "" : "s"} to qualify for honors.`;
    case "outside":
      return `${progress.next.gap.toFixed(3)} away from ${progress.next.name}.`;
    case "honor":
      return progress.next
        ? `${progress.next.gap.toFixed(3)} away from ${progress.next.name}.`
        : "You're in the top honor band.";
  }
}

export type TermTarget =
  | { kind: "reachable"; requiredGwa: number }
  | { kind: "any-passing" }
  | { kind: "out-of-reach"; bestCumulative: number };

/**
 * What GWA next term keeps the cumulative GWA at or under `target`, given the
 * subjects so far and the units planned for next term.
 */
export function requiredTermGwa(
  pastSubjects: GwaInput[],
  target: number,
  nextUnits: number,
): TermTarget {
  const { totalUnits } = computeGwa(pastSubjects);
  const weighted = weightedSum(pastSubjects);
  const required = (target * (totalUnits + nextUnits) - weighted) / nextUnits;

  if (required < 1) {
    const best = (weighted + nextUnits) / (totalUnits + nextUnits);
    return { kind: "out-of-reach", bestCumulative: round3(best) };
  }
  if (required >= 3) return { kind: "any-passing" };
  // Floor so the shown target is never looser than what's actually needed.
  return { kind: "reachable", requiredGwa: Math.floor(required * 1000) / 1000 };
}
