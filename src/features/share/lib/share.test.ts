import { describe, expect, it } from "vitest";

import type { Semester, Subject } from "@/types";
import { CAPTIONS, captionFor } from "./captions";
import { MOODS, variantsFor } from "./moods";
import { availableScopes, buildShareContent } from "./share-content";
import { templateLayout } from "./share-layout";
import { chosenSubjects, defaultOptions } from "./share-options";
import { buildShareText, imageFileName, shareLink } from "./share-text";

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
  const all = { honor: true, units: true, trend: true, who: true };

  it("never budgets more than the image has room for", () => {
    for (const format of ["post", "story"] as const) {
      for (let mask = 0; mask < 16; mask++) {
        const [honor, units, trend, who] = [1, 2, 4, 8].map((bit) => (mask & bit) > 0);
        for (const subjects of [0, 1, 3, 5, 8, 12, 40]) {
          const layout = templateLayout(format, { honor, units, trend, who, subjects });
          expect(layout.height).toBeLessThanOrEqual(layout.room);
          expect(layout.rows).toBeLessThanOrEqual(subjects);
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
    const roomy = templateLayout("post", { honor: true, units: false, trend: false, who: false, subjects: 0 });
    const busy = templateLayout("post", { honor: true, units: false, trend: false, who: false, subjects: 5 });
    expect(roomy.sizes.hero).toBeGreaterThan(busy.sizes.hero);
  });
});

describe("moods and captions", () => {
  it("gives every mood captions in both languages, without em dashes", () => {
    for (const mood of MOODS) {
      for (const language of ["en", "tl"] as const) {
        for (const result of ["honor", "progress"] as const) {
          const lines = CAPTIONS[mood.id][language][result];
          expect(lines.length).toBeGreaterThan(0);
          for (const line of lines) expect(line).not.toContain("—");
        }
      }
      expect(variantsFor(mood, "#ff00aa").at(-1)?.label).toBe("My theme");
    }
  });

  it("wraps the caption index for Shuffle", () => {
    expect(captionFor("rock", "en", "honor", 3)).toBe(captionFor("rock", "en", "honor", 0));
    expect(captionFor("rock", "tl", "progress", -1)).toBe(CAPTIONS.rock.tl.progress.at(-1));
  });
});

describe("share text and links", () => {
  const content = buildShareContent({ kind: "current" }, current, [])!;

  it("describes only what the image shows", () => {
    const text = buildShareText(content, { appName: "GWA Calculator", appUrl: "https://gwa.example", caption: "Done.", showHonor: true });
    expect(text).toContain("My GWA: 1.375 (University Scholar)");
    expect(text).toContain("https://gwa.example");
    expect(buildShareText(content, { appName: "A", appUrl: "u", caption: "c", showHonor: false })).not.toContain("Scholar");
  });

  it("encodes intent links", () => {
    expect(shareLink("x", "a b&c", "u")).toBe("https://x.com/intent/tweet?text=a%20b%26c");
    expect(shareLink("facebook", "ignored", "https://gwa.example/")).toContain("u=https%3A%2F%2Fgwa.example%2F");
    expect(imageFileName(content, "proud")).toBe("gwa-calculator-my-gwa-proud.png");
  });
});
