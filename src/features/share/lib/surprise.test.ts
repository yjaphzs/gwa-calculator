import { describe, expect, it } from "vitest";

import { BASE_MOODS } from "@/features/share/content/moods/base";
import { defaultOptions } from "./share-options";
import { steppedMood, surpriseOptions } from "./surprise";

/** A repeatable random source cycling through the given values. */
const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe("surpriseOptions", () => {
  it("always changes the style or the mood", () => {
    const options = defaultOptions({ style: "classic", mood: "proud" });
    // 0 picks the first style and mood every time: classic + proud, the current look.
    const patch = surpriseOptions(options, BASE_MOODS, () => 0);
    expect(patch.style !== "classic" || patch.mood !== "proud").toBe(true);
  });

  it("keeps the format, what's shown, the language and the user's own caption", () => {
    const options = defaultOptions({ format: "story", language: "tl", ownCaption: "Kaya natin 'to" });
    const patch = surpriseOptions(options, BASE_MOODS, sequence(0.3, 0.7, 0.5, 0.9));
    expect(Object.keys(patch).sort()).toEqual(["captionIndex", "mood", "style", "variant"]);
  });

  it("picks a color the mood has, counting My theme", () => {
    for (let i = 0; i < 50; i++) {
      const patch = surpriseOptions(defaultOptions(), BASE_MOODS);
      const mood = BASE_MOODS.find((m) => m.id === patch.mood)!;
      expect(patch.variant).toBeGreaterThanOrEqual(0);
      expect(patch.variant).toBeLessThanOrEqual(mood.variants.length);
    }
  });
});

describe("steppedMood", () => {
  it("steps both ways and wraps around", () => {
    const last = BASE_MOODS[BASE_MOODS.length - 1];
    expect(steppedMood(BASE_MOODS, "proud", 1).id).toBe(BASE_MOODS[1].id);
    expect(steppedMood(BASE_MOODS, "proud", -1).id).toBe(last.id);
    expect(steppedMood(BASE_MOODS, last.id, 1).id).toBe("proud");
  });

  it("starts from the first mood when the current one isn't offered", () => {
    expect(steppedMood(BASE_MOODS, "pasko", 1).id).toBe(BASE_MOODS[1].id);
  });
});
