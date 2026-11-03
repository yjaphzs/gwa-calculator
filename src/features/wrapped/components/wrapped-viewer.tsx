"use client";

import { useRef } from "react";

import { APP_URL } from "@/config/app";
import { brightAccent } from "@/features/appearance/lib/favicon";
import { useScheme } from "@/features/appearance/lib/scheme-store";
import { displayHost } from "@/features/reports/lib/format";
import { FullscreenStage } from "@/features/share/components/fullscreen-stage";
import { GlowUpSlide, HonorsSlide, SummarySlide } from "@/features/wrapped/components/slides/closing-slides";
import { IntroSlide, LoadSlide, TopSubjectSlide } from "@/features/wrapped/components/slides/opening-slides";
import { WrappedActions } from "@/features/wrapped/components/wrapped-actions";
import { WrappedYearPicker } from "@/features/wrapped/components/wrapped-year-picker";
import { SLIDE_COUNT, useWrappedViewer } from "@/features/wrapped/hooks/use-wrapped-viewer";
import { shortYear } from "@/features/wrapped/lib/wrapped";
import { cn } from "@/lib/utils";
import type { Semester } from "@/types";

const SLIDES = [IntroSlide, LoadSlide, TopSubjectSlide, GlowUpSlide, HonorsSlide, SummarySlide];

interface WrappedViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semesters: Semester[];
}

/** Shown in place of the slides when no school year has two saved semesters yet. */
function NoWrapped() {
  return (
    <div style={{ width: 1080, height: 1920, display: "flex", alignItems: "center", justifyContent: "center", padding: 120, background: "#111", color: "#d4d4d8", font: "500 52px/1.4 Roboto, sans-serif", textAlign: "center" }}>
      Save two semesters of a school year to see its Wrapped.
    </div>
  );
}

/**
 * GWA Wrapped: a story of the school year in six slides, filling the screen on
 * phones like Instagram Stories. Tap the sides, swipe, or use the arrow keys;
 * each slide shares as an image. Default export so next/dynamic can load it on
 * first open.
 */
export default function WrappedViewer({ open, onOpenChange, semesters }: WrappedViewerProps) {
  const slideRef = useRef<HTMLDivElement>(null);
  const viewer = useWrappedViewer({ open, semesters, slideRef });
  const accent = brightAccent(useScheme());
  const Slide = SLIDES[viewer.index];
  const host = displayHost(APP_URL || "gwa-calculator.yjaphzs.xyz");

  const top = (
    <div className="flex items-center gap-3">
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
          <span key={i} className={cn("h-1 flex-1 rounded-full", i <= viewer.index ? "bg-white" : "bg-white/35")} />
        ))}
      </div>
      {viewer.years.length > 1 && <WrappedYearPicker viewer={viewer} />}
    </div>
  );

  return (
    <FullscreenStage
      open={open}
      onOpenChange={onOpenChange}
      title={`GWA Wrapped, S.Y. ${shortYear(viewer.year)}`}
      description="Six slides about your school year. Tap the sides of the slide, swipe, or use the arrow keys to move."
      format="story"
      top={top}
      bottom={<WrappedActions viewer={viewer} />}
      onStep={viewer.go}
      tapZones
      stepLabels={["Previous slide", "Next slide"]}
      closeLabel="Close Wrapped"
    >
      {viewer.wrapped ? (
        <Slide ref={slideRef} wrapped={viewer.wrapped} accent={accent} exact={viewer.exact} host={host} />
      ) : (
        <NoWrapped />
      )}
    </FullscreenStage>
  );
}
