import { describe, expect, it } from "vitest";

import { CARD_LINES } from "@/features/calculator/content/card-lines";
import { cardLine, cardLineState, localDay } from "./card-line";

describe("card lines", () => {
  it("picks the set from the standing, with improvement first", () => {
    expect(cardLineState({ kind: "empty" }, true)).toBe("empty");
    expect(cardLineState({ kind: "needs-units", unitsShort: 3 }, false)).toBe("needs-units");
    expect(cardLineState({ kind: "honor", honor: "Dean's Lister", next: null }, true)).toBe("improved");
    expect(cardLineState({ kind: "outside", next: { name: "Dean's Lister", gap: 0.1 } }, false)).toBe("outside");
  });

  it("keeps one line per day and steps through the rest on tap", () => {
    const day = localDay(new Date(2026, 10, 2, 9));
    expect(localDay(new Date(2026, 10, 2, 23, 59))).toBe(day);
    expect(localDay(new Date(2026, 10, 3, 0, 1))).toBe(day + 1);
    const seen = new Set(CARD_LINES.honor.map((_, i) => cardLine("honor", day, i)));
    expect(seen.size).toBe(CARD_LINES.honor.length);
    expect(cardLine("honor", day, CARD_LINES.honor.length)).toBe(cardLine("honor", day));
  });

  it("follows the copy rules", () => {
    for (const lines of Object.values(CARD_LINES)) {
      expect(lines.length).toBeGreaterThanOrEqual(8);
      for (const line of lines) {
        expect(line).not.toContain("—");
        expect(line.length).toBeLessThanOrEqual(44);
      }
    }
  });
});
