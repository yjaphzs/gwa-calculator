import { describe, expect, it } from "vitest";

import type { Semester, Subject } from "@/types";
import { captionLines } from "./caption-lines";
import { CAPTIONS, captionFor, captionPool } from "./captions";
import { MOODS, availableMoods, variantsFor } from "./moods";
import { inSeason } from "./seasons";
import { availableScopes, buildShareContent } from "./share-content";
import { templateLayout } from "./share-layout";
import { chosenSubjects, defaultOptions } from "./share-options";
import { buildShareText, imageFileName, shareGwa, shareLink } from "./share-text";

let n = 0;
const sub = (grade: number, units = 3, extra: Partial<Subject> = {}): Subject => ({
  id: `s${++n}`,
  code: `C${n}`,
  title: `Subject ${n}`,
  grade,
  units,
  ...extra,
});
const term = (id: string, semester: string, schoolYear: string, subjects: Subject[]): Semester => ({ id, semester, schoolYear, subjects });

const current = [sub(1.25), sub(1.5), sub(1.0), sub(1.75), sub(0, 3, { mark: "INC" })];
const semesters = [
  term("b", "Second", "2024-2025", [sub(1.25, 6), sub(1.5, 6)]),
  term("a", "First", "2024-2025", [sub(1.0, 6), sub(1.25, 6)]),
];

describe("buildShareContent", () => {
  it("uses the app's GWA and semester honor for the working set", () => {
    const content = buildShareContent({ kind: "current" }, current, semesters)!;
    expect(content.gwa).toBe(1.375);
    expect(content.units).toBe(12);
    expect(content.honor).toBe("University Scholar");
    expect(content.result).toBe("honor");
    expect(content.subjects.find((s) => !s.counted)?.status).toBe("Incomplete");
  });

  it("gives the overall result a Latin honor and a trend, oldest first", () => {
    const content = buildShareContent({ kind: "overall" }, current, semesters)!;
    expect(content.gwa).toBe(1.25);
    expect(content.honor).toBe("Magna Cum Laude");
    expect(content.trend.map((p) => p.label)).toEqual(["1st 2024–25", "2nd 2024–25"]);
  });

  it("finds a saved semester and returns null for empty scopes", () => {
    expect(buildShareContent({ kind: "semester", id: "a" }, [], semesters)?.heading).toBe("First Semester, S.Y. 2024-2025");
    expect(buildShareContent({ kind: "current" }, [], semesters)).toBeNull();
    expect(buildShareContent({ kind: "semester", id: "zzz" }, [], semesters)).toBeNull();
    expect(availableScopes([], semesters).map((s) => s.label)).toEqual([
      "Overall (all semesters)",
      "Second Semester, S.Y. 2024-2025",
      "First Semester, S.Y. 2024-2025",
    ]);
  });
});

describe("chosenSubjects", () => {
  const content = buildShareContent({ kind: "current" }, current, [])!;

  it("shows nothing until subjects are switched on", () => {
    expect(chosenSubjects(content, defaultOptions())).toEqual([]);
  });

  it("filters the best counted subjects, best first", () => {
    const options = defaultOptions({ filter: "best3", show: { ...defaultOptions().show, subjects: true } });
    expect(chosenSubjects(content, options).map((s) => s.grade)).toEqual([1.0, 1.25, 1.5]);
  });

  it("keeps chosen subjects, in the original order when asked", () => {
    const show = { ...defaultOptions().show, subjects: true };
    const chosen = [content.subjects[3].id, content.subjects[0].id];
    expect(chosenSubjects(content, defaultOptions({ filter: "choose", chosen, sort: "original", show })).map((s) => s.id)).toEqual([
      content.subjects[0].id,
      content.subjects[3].id,
    ]);
  });
});

describe("templateLayout", () => {
  const caption = { caption: "All that hard work paid off.", font: "serif" as const };
  const all = { honor: true, units: true, trend: true, who: true, ...caption };
  const OWN = [
    "",
    "Done.",
    "Grabe 'yung sem na 'to pero kinaya ko kahit ilang beses akong umiyak sa CR.",
    "SOBRANG SAYA KO NGAYONG SEM KASI PASADO AKO SA LAHAT NG SUBJECTS KO, SALAMAT!",
    "a".repeat(80),
  ];

  it("never budgets more than the image has room for", () => {
    for (const format of ["post", "story"] as const) {
      for (let mask = 0; mask < 16; mask++) {
        const [honor, units, trend, who] = [1, 2, 4, 8].map((bit) => (mask & bit) > 0);
        for (const subjects of [0, 1, 3, 5, 8, 12, 40]) {
          for (const font of ["sans", "serif", "mono"] as const) {
            for (const text of OWN) {
              const layout = templateLayout(format, { honor, units, trend, who, subjects, caption: text, font });
              // A hundredth of a pixel for float rounding.
              expect(layout.height).toBeLessThanOrEqual(layout.room + 0.01);
              expect(layout.rows).toBeLessThanOrEqual(subjects);
              if (subjects > 0) expect(layout.rows).toBeGreaterThan(0);
            }
          }
        }
      }
    }
  });

  it("shows every subject that fits and caps the rest", () => {
    expect(templateLayout("post", { ...all, trend: false, subjects: 3 }).rows).toBe(3);
    const post = templateLayout("post", { ...all, subjects: 40 }).rows;
    const story = templateLayout("story", { ...all, subjects: 40 }).rows;
    expect(post).toBeGreaterThanOrEqual(3);
    expect(story).toBeGreaterThan(post);
    // The trend line takes room from the list.
    expect(templateLayout("story", { ...all, trend: false, subjects: 40 }).rows).toBeGreaterThan(story);
  });

  it("keeps the GWA big when nothing else competes for room", () => {
    const roomy = templateLayout("post", { honor: true, units: false, trend: false, who: false, subjects: 0, ...caption });
    const busy = templateLayout("post", { honor: true, units: false, trend: false, who: false, subjects: 5, ...caption });
    expect(roomy.sizes.hero).toBeGreaterThan(busy.sizes.hero);
  });

  it("gives a long caption room: subject rows first, then a smaller caption", () => {
    const parts = { ...all, subjects: 12, font: "mono" as const };
    const short = templateLayout("post", { ...parts, caption: "Mic drop." });
    const long = templateLayout("post", { ...parts, caption: OWN[3] });
    expect(long.rows).toBeLessThan(short.rows);
    expect(long.rows).toBeGreaterThan(0);
    // With no list to give way, a caption too long for the room is set smaller.
    const alone = { honor: true, units: true, trend: false, who: true, subjects: 0, font: "serif" as const };
    expect(templateLayout("post", { ...alone, caption: OWN[4] }).sizes.caption).toBeLessThan(
      templateLayout("post", { ...alone, caption: "Done." }).sizes.caption,
    );
  });
});

describe("captionLines", () => {
  it("counts wrapped lines, erring high", () => {
    expect(captionLines("Done.", "sans", 68)).toBe(1);
    expect(captionLines("Natulog lang sa class pero pasado.", "sans", 80)).toBeGreaterThanOrEqual(2);
    // Monospace is exact: 25 characters at 50px is 875px, over the 880px box less slack.
    expect(captionLines("x".repeat(25), "mono", 50)).toBe(2);
    // A word wider than the box breaks anywhere.
    expect(captionLines("a".repeat(80), "mono", 46)).toBe(4);
    // Wide letters and emoji count at their own width.
    expect(captionLines("W".repeat(80), "serif", 60)).toBeGreaterThan(captionLines("a".repeat(80), "serif", 60));
    expect(captionLines("\u{1F389}".repeat(20), "mono", 60)).toBeGreaterThan(captionLines("a".repeat(20), "mono", 60));
  });
});

describe("moods and captions", () => {
  it("gives every mood 20 different captions per language and result, without em dashes", () => {
    for (const mood of MOODS) {
      for (const language of ["en", "tl"] as const) {
        for (const result of ["honor", "progress"] as const) {
          const pool = captionPool(mood.id, language, result);
          expect(pool).toHaveLength(20);
          expect(new Set(pool).size).toBe(20);
          for (const line of pool) {
            expect(line).not.toContain("—");
            expect(line).toBe(line.trim());
            expect(line.length).toBeLessThanOrEqual(42);
          }
        }
        // An honor line never shows for a result without one, and the reverse.
        const set = CAPTIONS[mood.id][language];
        expect(set.honor.some((l) => set.progress.includes(l))).toBe(false);
      }
      expect(variantsFor(mood, "#ff00aa").at(-1)?.label).toBe("My theme");
    }
  });

  it("starts with the result's own lines and wraps for Shuffle", () => {
    expect(captionFor("rock", "en", "honor", 0)).toBe(CAPTIONS.rock.en.honor[0]);
    expect(captionFor("rock", "en", "honor", 20)).toBe(captionFor("rock", "en", "honor", 0));
    expect(captionFor("rock", "tl", "progress", -1)).toBe(CAPTIONS.rock.tl.any.at(-1));
    expect(CAPTIONS.fun.tl.any).toContain("Natulog lang sa class pero pasado.");
  });
});

describe("share text and links", () => {
  const content = buildShareContent({ kind: "current" }, current, [])!;

  it("describes only what the image shows", () => {
    const text = buildShareText(content, { appName: "GWA Calculator", appUrl: "https://gwa.example", caption: "Done.", showHonor: true, exact: true });
    expect(text).toContain("My GWA: 1.375 (University Scholar)");
    expect(text).toContain("https://gwa.example");
    expect(buildShareText(content, { appName: "A", appUrl: "u", caption: "c", showHonor: false, exact: true })).not.toContain("Scholar");
  });

  it("hides the decimals everywhere when asked", () => {
    expect(shareGwa(1.375, true)).toBe("1.375");
    expect(shareGwa(1.375, false)).toBe("1.**");
    expect(shareGwa(2, false)).toBe("2.**");
    expect(shareGwa(null, false)).toBe("N/A");
    const text = buildShareText(content, { appName: "A", appUrl: "u", caption: "c", showHonor: true, exact: false });
    expect(text).toContain("My GWA: 1.** (University Scholar)");
    expect(text).not.toContain("375");
  });

  it("encodes intent links", () => {
    expect(shareLink("x", "a b&c", "u")).toBe("https://x.com/intent/tweet?text=a%20b%26c");
    expect(shareLink("facebook", "ignored", "https://gwa.example/")).toContain("u=https%3A%2F%2Fgwa.example%2F");
    expect(imageFileName(content, "proud")).toBe("gwa-calculator-my-gwa-proud.png");
    expect(imageFileName(content, "fun", "receipt")).toBe("gwa-calculator-my-gwa-fun-receipt.png");
  });
});

describe("seasons", () => {
  const day = (month: number, date: number) => new Date(2026, month - 1, date, 12);

  it("opens each window on its first day and closes after its last", () => {
    expect(inSeason("spooky", day(10, 14))).toBe(false);
    expect(inSeason("spooky", day(10, 15))).toBe(true);
    expect(inSeason("spooky", day(11, 2))).toBe(true);
    expect(inSeason("spooky", day(11, 3))).toBe(false);
    expect(inSeason("valentines", day(2, 14))).toBe(true);
    expect(inSeason("recognition", day(6, 30))).toBe(true);
    expect(inSeason("recognition", day(7, 1))).toBe(false);
  });

  it("runs Pasko across New Year", () => {
    expect(inSeason("pasko", day(8, 31))).toBe(false);
    expect(inSeason("pasko", day(9, 1))).toBe(true);
    expect(inSeason("pasko", day(12, 25))).toBe(true);
    expect(inSeason("pasko", day(1, 6))).toBe(true);
    expect(inSeason("pasko", day(1, 7))).toBe(false);
  });

  it("offers seasonal moods only in season", () => {
    const ids = (date: Date) => availableMoods(date).map((m) => m.id);
    expect(ids(day(7, 15))).not.toEqual(expect.arrayContaining(["pasko"]));
    expect(ids(day(7, 15))).toHaveLength(8);
    expect(ids(day(11, 2))).toEqual(expect.arrayContaining(["pasko", "spooky"]));
    expect(ids(day(2, 10))).toContain("valentines");
  });
});
