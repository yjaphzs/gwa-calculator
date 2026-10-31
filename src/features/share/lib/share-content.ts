import { notCountedLabel } from "@/features/calculator/lib/subject-status";
import { formatTermLabel, shortTermLabel, sortNewestFirst, sortOldestFirst } from "@/features/semesters/lib/semesters";
import { computeGwa, countsTowardGwa, getHonorFor, getLatinHonorFor } from "@/lib/academic";
import type { Semester, Subject } from "@/types";

/** What a share image is about: the working set, one saved semester, or every semester. */
export type ShareScope = { kind: "current" } | { kind: "semester"; id: string } | { kind: "overall" };

export interface ShareSubject {
  id: string;
  code: string;
  title: string;
  grade: number;
  units: number;
  counted: boolean;
  /** "Incomplete", "Not counted"…, for subjects that don't count. */
  status: string | null;
}

export interface ShareContent {
  scope: ShareScope["kind"];
  /** "My GWA", "First Semester, S.Y. 2025-2026" or "Overall GWA". */
  heading: string;
  gwa: number | null;
  /** Semester honor, or the Latin honor for the overall result. */
  honor: string | null;
  units: number;
  subjects: ShareSubject[];
  /** Overall only: each semester's GWA, oldest first. */
  trend: { label: string; gwa: number }[];
  /** Picks the template captions: earned an honor, or still working on it. */
  result: "honor" | "progress";
}

const toShareSubject = (s: Subject): ShareSubject => ({
  id: s.id,
  code: s.code,
  title: s.title,
  grade: s.grade,
  units: s.units,
  counted: countsTowardGwa(s),
  status: notCountedLabel(s),
});

function build(scope: ShareScope["kind"], heading: string, subjects: Subject[], honor: string | null, trend: ShareContent["trend"] = []): ShareContent {
  const { gwa, totalUnits } = computeGwa(subjects);
  return { scope, heading, gwa, honor, units: totalUnits, subjects: subjects.map(toShareSubject), trend, result: honor ? "honor" : "progress" };
}

/**
 * The numbers for a share image, computed with the app's own GWA and honor
 * rules (src/lib/academic.ts). Null when the scope has nothing to show.
 */
export function buildShareContent(scope: ShareScope, subjects: Subject[], semesters: Semester[]): ShareContent | null {
  if (scope.kind === "current") {
    return subjects.length ? build("current", "My GWA", subjects, getHonorFor(subjects)) : null;
  }
  if (scope.kind === "semester") {
    const semester = semesters.find((s) => s.id === scope.id);
    return semester?.subjects.length ? build("semester", formatTermLabel(semester), semester.subjects, getHonorFor(semester.subjects)) : null;
  }
  const ordered = sortOldestFirst(semesters);
  const all = ordered.flatMap((s) => s.subjects);
  if (!all.length) return null;
  const trend = ordered
    .map((s) => ({ label: shortTermLabel(s), gwa: computeGwa(s.subjects).gwa }))
    .filter((p): p is { label: string; gwa: number } => p.gwa !== null);
  return build("overall", "Overall GWA", all, getLatinHonorFor(all), trend);
}

/** The scopes a user can pick from, given their data. */
export function availableScopes(subjects: Subject[], semesters: Semester[]): { scope: ShareScope; label: string }[] {
  return [
    ...(subjects.length ? [{ scope: { kind: "current" } as ShareScope, label: "My GWA (current)" }] : []),
    ...(semesters.length ? [{ scope: { kind: "overall" } as ShareScope, label: "Overall (all semesters)" }] : []),
    ...sortNewestFirst(semesters)
      .filter((s) => s.subjects.length)
      .map((s) => ({ scope: { kind: "semester", id: s.id } as ShareScope, label: formatTermLabel(s) })),
  ];
}

export const scopeKey = (scope: ShareScope) => (scope.kind === "semester" ? `semester:${scope.id}` : scope.kind);
