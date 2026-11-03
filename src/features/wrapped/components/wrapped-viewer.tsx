"use client";

import { useRef } from "react";
import { XIcon } from "lucide-react";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { APP_URL } from "@/config/app";
import { brightAccent } from "@/features/appearance/lib/favicon";
import { useScheme } from "@/features/appearance/lib/scheme-store";
import { displayHost } from "@/features/reports/lib/format";
import { SharePreview } from "@/features/share/components/share-preview";
import { GlowUpSlide, HonorsSlide, SummarySlide } from "@/features/wrapped/components/slides/closing-slides";
import { IntroSlide, LoadSlide, TopSubjectSlide } from "@/features/wrapped/components/slides/opening-slides";
import { WrappedActions } from "@/features/wrapped/components/wrapped-actions";
import { SLIDE_COUNT, useWrappedViewer } from "@/features/wrapped/hooks/use-wrapped-viewer";
import { shortYear } from "@/features/wrapped/lib/wrapped";
import { useViewportSize } from "@/hooks/use-viewport-size";
import { cn } from "@/lib/utils";
import type { Semester } from "@/types";

const SLIDES = [IntroSlide, LoadSlide, TopSubjectSlide, GlowUpSlide, HonorsSlide, SummarySlide];
// Room for the progress bar and the actions around the slide.
const CHROME = 190;

interface WrappedViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semesters: Semester[];
}

/**
 * GWA Wrapped: a story of the school year in six slides, full screen on
 * phones. Tap the sides or use the arrow keys; each slide shares as an image.
 * Default export so next/dynamic can load it on first open.
 */
export default function WrappedViewer({ open, onOpenChange, semesters }: WrappedViewerProps) {
  const slideRef = useRef<HTMLDivElement>(null);
  const viewer = useWrappedViewer({ open, semesters, slideRef });
  const accent = brightAccent(useScheme());
  const viewport = useViewportSize();
  const maxHeight = Math.max(320, viewport.height - CHROME);
  const width = Math.min(viewport.width - 24, (maxHeight * 1080) / 1920);
  const Slide = SLIDES[viewer.index];
  const host = displayHost(APP_URL || "gwa-calculator.yjaphzs.xyz");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="dark flex h-svh w-screen max-w-none flex-col gap-3 rounded-none border-0 bg-neutral-950 p-3 text-white sm:h-auto sm:w-auto sm:max-w-none sm:rounded-2xl sm:p-4"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") viewer.go(1);
          if (e.key === "ArrowLeft") viewer.go(-1);
        }}
      >
        <DialogTitle className="sr-only">GWA Wrapped, S.Y. {shortYear(viewer.year)}</DialogTitle>
        <DialogDescription className="sr-only">
          Six slides about your school year. Use the arrow keys or the sides of the slide to move.
        </DialogDescription>
        <div className="flex items-center gap-3" style={{ width }}>
          <div
            className="flex flex-1 gap-1.5"
            role="progressbar"
            aria-label="Slides"
            aria-valuemin={1}
            aria-valuemax={SLIDE_COUNT}
            aria-valuenow={viewer.index + 1}
            aria-valuetext={`Slide ${viewer.index + 1} of ${SLIDE_COUNT}`}
          >
            {Array.from({ length: SLIDE_COUNT }, (_, i) => (
              <span key={i} className={cn("h-1 flex-1 rounded-full", i <= viewer.index ? "bg-white" : "bg-white/25")} />
            ))}
          </div>
          <DialogClose className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Close Wrapped">
            <XIcon className="size-5" />
          </DialogClose>
        </div>
        <div className="relative mx-auto flex flex-1 items-center sm:flex-none" style={{ width }}>
          {viewer.wrapped ? (
            <SharePreview format="story" maxHeight={maxHeight}>
              <Slide ref={slideRef} wrapped={viewer.wrapped} accent={accent} exact={viewer.exact} host={host} />
            </SharePreview>
          ) : (
            <p className="w-full text-center text-sm text-white/70">Save two semesters of a school year to see its Wrapped.</p>
          )}
          <button type="button" aria-label="Previous slide" className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize" onClick={() => viewer.go(-1)} />
          <button type="button" aria-label="Next slide" className="absolute inset-y-0 right-0 w-2/3 cursor-e-resize" onClick={() => viewer.go(1)} />
        </div>
        <div style={{ width }} className="mx-auto">
          <WrappedActions viewer={viewer} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
