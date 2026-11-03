"use client";

import type { ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon, Maximize2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SharePreview } from "@/features/share/components/share-preview";
import type { ShareStudio } from "@/features/share/hooks/use-share-studio";
import { useSwipe } from "@/hooks/use-swipe";
import { cn } from "@/lib/utils";

interface PreviewStageProps {
  studio: ShareStudio;
  maxHeight: number;
  /** Called on any swipe, arrow, or Surprise (it ends the first-time tip). */
  onPlay: () => void;
  /** Opens the image full screen (a tap on it, or the expand button). */
  onExpand: () => void;
  /** The full-size template. */
  children: ReactNode;
}

const ARROW = "shrink-0 rounded-full text-muted-foreground max-md:size-10";

/**
 * The live preview, with the quick ways to play: swipe it (or use the arrows)
 * for the next mood, Surprise me for a whole new look, and a tap to see it
 * full screen.
 */
export function PreviewStage({ studio, maxHeight, onPlay, onExpand, children }: PreviewStageProps) {
  const { moods, mood } = studio;
  const at = Math.max(0, moods.findIndex((m) => m.id === mood.id));
  const step = (delta: number) => {
    studio.stepMood(delta);
    onPlay();
  };
  const swipe = useSwipe((direction) => step(direction === "left" ? 1 : -1), { onTap: onExpand });
  const expand = (
    <button
      type="button"
      onClick={onExpand}
      aria-label="View full screen"
      className="absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-black/50 text-white shadow-md backdrop-blur-sm after:absolute after:-inset-1 hover:bg-black/65 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Maximize2Icon className="size-4" />
    </button>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" className={ARROW} onClick={() => step(-1)} aria-label="Previous mood">
          <ChevronLeftIcon className="size-5" />
        </Button>
        {/* data-vaul-no-drag: a sideways swipe here changes the mood instead of dragging the sheet. */}
        <div data-vaul-no-drag className="min-w-0 flex-1 cursor-pointer select-none" {...swipe}>
          <SharePreview format={studio.options.format} maxHeight={maxHeight} overlay={expand}>
            {children}
          </SharePreview>
        </div>
        <Button variant="ghost" size="icon" className={ARROW} onClick={() => step(1)} aria-label="Next mood">
          <ChevronRightIcon className="size-5" />
        </Button>
      </div>
      <div className="flex min-h-10 items-center gap-3 px-1">
        <p className="min-w-0 flex-1 truncate text-sm font-medium" aria-live="polite">
          <span aria-hidden>{mood.emoji}</span> {mood.label}
          <span className="sr-only">
            , mood {at + 1} of {moods.length}
          </span>
        </p>
        <div aria-hidden className="flex items-center gap-1">
          {moods.map((m, i) => (
            <span
              key={m.id}
              className={cn("h-1.5 rounded-full transition-all", i === at ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30")}
            />
          ))}
        </div>
        <div className="flex flex-1 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full max-md:h-10"
            onClick={() => {
              studio.surprise();
              onPlay();
            }}
          >
            <span aria-hidden>🎲</span>
            Surprise me
          </Button>
        </div>
      </div>
    </div>
  );
}
