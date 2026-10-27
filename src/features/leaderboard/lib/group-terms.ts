import type { LeaderboardSemesterEntry } from "@/types";

export interface TermOption {
  key: string;
  label: string;
}

/** Distinct terms present in the entries, most recent first (term keys sort chronologically). */
export function groupTerms(entries: LeaderboardSemesterEntry[]): TermOption[] {
  const map = new Map<string, string>();
  for (const e of entries) if (!map.has(e.termKey)) map.set(e.termKey, e.termLabel);
  return [...map.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => b.key.localeCompare(a.key));
}
