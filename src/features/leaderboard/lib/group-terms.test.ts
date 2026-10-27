import { describe, expect, it } from "vitest";

import { groupTerms } from "@/features/leaderboard/lib/group-terms";
import type { LeaderboardSemesterEntry } from "@/types";

const entry = (termKey: string, termLabel: string) =>
  ({ termKey, termLabel }) as LeaderboardSemesterEntry;

describe("groupTerms", () => {
  it("lists each term once, most recent first", () => {
    const terms = groupTerms([
      entry("2024-1", "AY 2024–2025 · 1st Sem"),
      entry("2025-1", "AY 2025–2026 · 1st Sem"),
      entry("2024-1", "AY 2024–2025 · 1st Sem"),
      entry("2024-2", "AY 2024–2025 · 2nd Sem"),
    ]);
    expect(terms.map((t) => t.key)).toEqual(["2025-1", "2024-2", "2024-1"]);
    expect(terms[0].label).toBe("AY 2025–2026 · 1st Sem");
  });

  it("is empty without entries", () => {
    expect(groupTerms([])).toEqual([]);
  });
});
