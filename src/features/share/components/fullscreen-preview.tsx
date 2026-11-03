"use client";

import type { ReactNode } from "react";
import { DownloadIcon, LoaderCircleIcon, Share2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FullscreenStage } from "@/features/share/components/fullscreen-stage";
import { useCanShareImages } from "@/features/share/hooks/use-can-share-images";
import type { ShareStudio } from "@/features/share/hooks/use-share-studio";
import { cn } from "@/lib/utils";

interface FullscreenPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studio: ShareStudio;
  /** A copy of the template for viewing; Share and Download still capture the studio's own. */
  children: ReactNode;
}

/** The share image as big as the screen allows: swipe for another mood, then share it from here. */
export function FullscreenPreview({ open, onOpenChange, studio, children }: FullscreenPreviewProps) {
  const sheet = useCanShareImages();
  const { moods, mood, busy, content } = studio;
  const at = Math.max(0, moods.findIndex((m) => m.id === mood.id));
  const idle = !content || busy !== null;
  const spinner = <LoaderCircleIcon className="size-4 animate-spin" />;

  const top = (
    <div className="flex items-center gap-3">
      <p className="min-w-0 truncate text-sm font-semibold" aria-live="polite">
        <span aria-hidden>{mood.emoji}</span> {mood.label}
        <span className="sr-only">
          , mood {at + 1} of {moods.length}
        </span>
      </p>
      <div aria-hidden className="flex shrink-0 items-center gap-1">
        {moods.map((m, i) => (
          <span key={m.id} className={cn("h-1.5 rounded-full transition-all", i === at ? "w-4 bg-white" : "w-1.5 bg-white/40")} />
        ))}
      </div>
    </div>
  );

  const bottom = (
    <div className="flex items-center gap-2">
      <Button variant="outline" className="h-11 shrink-0 rounded-full" onClick={studio.surprise}>
        <span aria-hidden>🎲</span>
        Surprise
      </Button>
      <Button className="h-11 flex-1" disabled={idle} onClick={sheet ? studio.share : studio.download}>
        {busy ? spinner : sheet ? <Share2Icon className="size-4" /> : <DownloadIcon className="size-4" />}
        {sheet ? "Share image" : "Download image"}
      </Button>
      {sheet && (
        <Button variant="outline" size="icon" className="size-11 shrink-0" disabled={idle} onClick={studio.download} aria-label="Download image">
          <DownloadIcon className="size-4" />
        </Button>
      )}
    </div>
  );

  return (
    <FullscreenStage
      open={open}
      onOpenChange={onOpenChange}
      title="Your share image, full screen"
      description="Swipe the image or use the arrow keys for another mood."
      format={studio.options.format}
      top={top}
      bottom={bottom}
      onStep={studio.stepMood}
      stepLabels={["Previous mood", "Next mood"]}
      closeLabel="Close full screen"
    >
      {children}
    </FullscreenStage>
  );
}
