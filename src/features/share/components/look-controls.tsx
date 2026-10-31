"use client";

import { ShuffleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OptionChips } from "@/features/share/components/option-chips";
import type { ShareStudio } from "@/features/share/hooks/use-share-studio";
import { MOODS, type MoodId } from "@/features/share/lib/moods";
import { scopeKey, type ShareScope } from "@/features/share/lib/share-content";
import type { CaptionLanguage, ShareFormat } from "@/features/share/lib/share-options";

interface LookControlsProps {
  studio: ShareStudio;
  scopes: { scope: ShareScope; label: string }[];
}

/** What to share, the format, the mood and its colors, and the caption. */
export function LookControls({ studio, scopes }: LookControlsProps) {
  const { options, update, variants } = studio;
  const byKey = new Map(scopes.map((s) => [scopeKey(s.scope), s.scope]));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="share-scope" className="text-sm font-medium text-muted-foreground">
          What to share
        </label>
        <Select
          value={scopeKey(options.scope)}
          onValueChange={(key) => update({ scope: byKey.get(key) ?? options.scope, chosen: [] })}
        >
          <SelectTrigger id="share-scope" className="w-full max-md:h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scopes.map((s) => (
              <SelectItem key={scopeKey(s.scope)} value={scopeKey(s.scope)}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <OptionChips<ShareFormat>
        label="Format"
        value={options.format}
        onChange={(format) => update({ format })}
        options={[
          { value: "post", label: "Post (4:5)" },
          { value: "story", label: "Story (9:16)" },
        ]}
      />
      <OptionChips<MoodId>
        label="Mood"
        value={options.mood}
        onChange={(mood) => update({ mood, variant: 0, captionIndex: 0 })}
        options={MOODS.map((m) => ({
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
      <div className="flex flex-col gap-2">
        <OptionChips<CaptionLanguage>
          label="Caption"
          value={options.language}
          onChange={(language) => update({ language })}
          options={[
            { value: "en", label: "English" },
            { value: "tl", label: "Taglish" },
          ]}
        />
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2 pl-3">
          <p className="min-w-0 flex-1 text-sm italic" aria-live="polite">
            &ldquo;{studio.caption}&rdquo;
          </p>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 max-md:h-10"
            onClick={() => update({ captionIndex: options.captionIndex + 1 })}
          >
            <ShuffleIcon className="size-4" />
            Shuffle
          </Button>
        </div>
      </div>
    </div>
  );
}
