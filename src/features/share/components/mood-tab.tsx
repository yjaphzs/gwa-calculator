"use client";

import { OptionChips } from "@/features/share/components/option-chips";
import type { ShareStudio } from "@/features/share/hooks/use-share-studio";
import type { MoodId } from "@/features/share/lib/moods";

/** The studio's Mood tab: the mood (seasonal ones in season) and its colors. */
export function MoodTab({ studio }: { studio: ShareStudio }) {
  const { options, update, variants, moods } = studio;

  return (
    <div className="flex flex-col gap-5">
      <OptionChips<MoodId>
        label="Mood"
        value={options.mood}
        onChange={studio.chooseMood}
        options={moods.map((m) => ({
          value: m.id,
          label: (
            <>
              <span aria-hidden>{m.emoji}</span>
              {m.label}
            </>
          ),
        }))}
      />
      <OptionChips<number>
        label="Colors"
        value={Math.min(options.variant, variants.length - 1)}
        onChange={(variant) => update({ variant })}
        options={variants.map((v, i) => ({
          value: i,
          label: (
            <>
              <span aria-hidden className="size-4 rounded-full ring-1 ring-border" style={{ background: v.background }} />
              {v.label}
            </>
          ),
        }))}
      />
    </div>
  );
}
