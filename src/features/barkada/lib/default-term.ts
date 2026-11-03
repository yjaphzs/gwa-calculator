import type { SEMESTER_TERMS } from "@/features/semesters/lib/semesters";

type Term = (typeof SEMESTER_TERMS)[number];

/**
 * The term most Philippine schools are in on `date`, to prefill a new
 * challenge: August to December is the first semester, January to May the
 * second, and June to July the third term (midyear). Easy to change.
 */
export function defaultTerm(date: Date): { schoolYear: string; semester: Term } {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month >= 7) return { schoolYear: `${year}-${year + 1}`, semester: "First" };
  return { schoolYear: `${year - 1}-${year}`, semester: month <= 4 ? "Second" : "Third" };
}

const ORDINALS: Record<string, Term> = { "1": "First", "2": "Second", "3": "Third" };

/**
 * The pickers' values for a stored term key ("2026-1" is First, 2026-2027),
 * for editing a challenge. Keys the server couldn't parse fall back to `date`'s term.
 */
export function termFromKey(key: string, date: Date): { schoolYear: string; semester: Term } {
  const match = key.match(/^(\d{4})-([123])$/);
  if (!match) return defaultTerm(date);
  const start = Number(match[1]);
  return { schoolYear: `${start}-${start + 1}`, semester: ORDINALS[match[2]] };
}

/** A nickname to start from: the first word of the profile name. */
export function defaultNickname(displayName: string | null | undefined): string {
  return (displayName ?? "").trim().split(/\s+/)[0].slice(0, 24);
}
