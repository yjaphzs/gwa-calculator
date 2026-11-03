"use client";

import { useMemo, useRef } from "react";

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/shared/responsive-dialog";
import { displayHost } from "@/features/reports/lib/format";
import { PreviewStage } from "@/features/share/components/preview-stage";
import { ShareActions } from "@/features/share/components/share-actions";
import { StudioTabs } from "@/features/share/components/studio-tabs";
import { ShareTemplate } from "@/features/share/components/templates/share-template";
import { useShareStudio } from "@/features/share/hooks/use-share-studio";
import { useShareTip } from "@/features/share/hooks/use-share-tip";
import { availableScopes } from "@/features/share/lib/share-content";
import type { ShareOptions } from "@/features/share/lib/share-options";
import { APP_URL } from "@/config/app";
import { useIsMobile } from "@/hooks/use-media-query";
import { useViewportSize } from "@/hooks/use-viewport-size";
import type { Semester, Subject } from "@/types";

interface ShareStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preset: Partial<ShareOptions>;
  subjects: Subject[];
  semesters: Semester[];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Tallest the preview may be. On a phone it takes about a third of the screen,
 * so the tabs, the first options and Share all fit without scrolling.
 */
function previewHeight(mobile: boolean, viewportHeight: number): number {
  return mobile ? clamp(Math.round(viewportHeight * 0.33), 180, 320) : clamp(viewportHeight - 260, 360, 600);
}

/**
 * Make a share image: the live preview stays in view (swipe it for another
 * mood, or Surprise me), and the options sit in tabs beside or below it. The
 * image is made on this device; nothing is uploaded.
 */
export default function ShareStudio({ open, onOpenChange, preset, subjects, semesters }: ShareStudioProps) {
  const templateRef = useRef<HTMLDivElement>(null);
  const studio = useShareStudio({ open, preset, subjects, semesters, templateRef });
  const { showTip, dismissTip } = useShareTip();
  const scopes = useMemo(() => availableScopes(subjects, semesters), [subjects, semesters]);
  const mobile = useIsMobile();
  const viewport = useViewportSize();
  const maxHeight = previewHeight(mobile, viewport.height);
  const host = displayHost(APP_URL || "gwa-calculator.yjaphzs.xyz");

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-5xl" drawerClassName="h-[90svh]">
        <ResponsiveDialogHeader className="max-md:pb-2">
          <ResponsiveDialogTitle>Share your result</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="max-md:sr-only">
            Make an image for your feed or story. It&apos;s created on this device, and only what you switch on is shown.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="flex flex-col gap-3 overflow-hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-6 md:overflow-visible">
          <div className="shrink-0 md:sticky md:top-0 md:self-start">
            {studio.content ? (
              <PreviewStage studio={studio} maxHeight={maxHeight} onPlay={dismissTip}>
                <ShareTemplate
                  ref={templateRef}
                  content={studio.content}
                  options={studio.options}
                  mood={studio.mood}
                  variant={studio.variant}
                  caption={studio.caption}
                  identity={studio.identity}
                  badges={studio.badges}
                  host={host}
                />
              </PreviewStage>
            ) : (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Nothing to share here yet. Add subjects or pick something else to share.
              </p>
            )}
          </div>
          <StudioTabs studio={studio} scopes={scopes} showTip={showTip} onTabChange={dismissTip} />
        </ResponsiveDialogBody>
        <ShareActions studio={studio} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
