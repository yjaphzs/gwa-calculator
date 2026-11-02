import { HONOR_MIN_UNITS, computeGwa, getAcademicHonor } from "../academic";
import { normalizeTerm } from "../term";
import type { GwaShown, MemberResult, StoredSemester } from "./types";

/** The part of a GWA the group may see: nothing, the whole number ("1.**"), or all of it. */
export function visibleGwa(gwa: number | null, shown: GwaShown): number | null {
  if (gwa == null || shown === "hidden") return null;
  return shown === "masked" ? Math.trunc(gwa) : gwa;
}

/**
 * A member's standing for the group's term, from their saved semesters. The
 * term matches through `normalizeTerm`, so "First" + "2025-2026" and
 * "1st Sem" + "2025-26" are the same term. Honors need 12+ units, as in the app.
 */
export function memberResult(semesters: StoredSemester[], termKey: string, shown: GwaShown): MemberResult {
  const saved = semesters.find((s) => normalizeTerm(s.schoolYear ?? "", s.semester ?? "").key === termKey);
  if (!saved) return { status: "waiting", honor: null, gwa: null };
  const { gwa, totalUnits } = computeGwa(saved.subjects ?? []);
  const graded = gwa != null && totalUnits >= HONOR_MIN_UNITS;
  return {
    status: graded ? "graded" : "short",
    honor: graded ? getAcademicHonor(gwa) : null,
    gwa: visibleGwa(gwa, shown),
  };
}

export function sameResult(a: MemberResult, b: MemberResult): boolean {
  return a.status === b.status && a.honor === b.honor && a.gwa === b.gwa;
}
