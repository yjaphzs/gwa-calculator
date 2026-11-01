"use client";

import { ShuffleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { OptionChips } from "@/features/share/components/option-chips";
import type { ShareStudio } from "@/features/share/hooks/use-share-studio";
import { OWN_CAPTION_MAX } from "@/features/share/lib/captions";
import type { CaptionLanguage } from "@/features/share/lib/share-options";

type CaptionChoice = CaptionLanguage | "own";

/** The line on the image: one of the mood's captions (Shuffle), or the user's own. */
export function CaptionControls({ studio }: { studio: ShareStudio }) {
  const { options, update } = studio;
  const own = options.ownCaption !== null;

  const choose = (choice: CaptionChoice) => {
    if (choice === "own") studio.startOwnCaption();
    else update({ language: choice, ownCaption: null });
  };

  return (
    <div className="flex flex-col gap-2">
      <OptionChips<CaptionChoice>
        label="Caption"
        value={own ? "own" : options.language}
        onChange={choose}
        options={[
          { value: "en", label: "English" },
          { value: "tl", label: "Taglish" },
          { value: "own", label: "My own" },
        ]}
      />
      {own ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="share-own-caption" className="sr-only">
            Your caption
          </label>
          <Textarea
            id="share-own-caption"
            value={options.ownCaption ?? ""}
            maxLength={OWN_CAPTION_MAX}
            placeholder="Write your own caption"
            autoComplete="off"
            className="min-h-0 resize-none"
            rows={2}
            onChange={(e) => studio.writeOwnCaption(e.target.value)}
          />
          <p className="flex justify-between gap-3 text-xs text-muted-foreground">
            <span>Saved on this device for next time.</span>
            <span className="tabular-nums">
              {(options.ownCaption ?? "").length}/{OWN_CAPTION_MAX}
            </span>
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2 pl-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm italic" aria-live="polite">
              &ldquo;{studio.caption}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {studio.captionNumber} of {studio.captionCount}
            </p>
          </div>
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
      )}
    </div>
  );
}
