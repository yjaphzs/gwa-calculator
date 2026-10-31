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
import { ContentControls } from "@/features/share/components/content-controls";
import { LookControls } from "@/features/share/components/look-controls";
import { ShareActions } from "@/features/share/components/share-actions";
import { SharePreview } from "@/features/share/components/share-preview";
import { ShareTemplate } from "@/features/share/components/templates/share-template";
import { useShareStudio } from "@/features/share/hooks/use-share-studio";
import { availableScopes } from "@/features/share/lib/share-content";
import type { ShareOptions } from "@/features/share/lib/share-options";
import { APP_URL } from "@/config/app";
import { useIsMobile } from "@/hooks/use-media-query";
import type { Semester, Subject } from "@/types";

interface ShareStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preset: Partial<ShareOptions>;
  subjects: Subject[];
  semesters: Semester[];
}

/**
 * Make a share image: pick what to share, a format and a mood, see it live,
 * then share it through the phone's share sheet or download it. The image is
 * made on this device; nothing is uploaded.
 */
export default function ShareStudio({ open, onOpenChange, preset, subjects, semesters }: ShareStudioProps) {
  const templateRef = useRef<HTMLDivElement>(null);
  const studio = useShareStudio({ open, preset, subjects, semesters, templateRef });
  const scopes = useMemo(() => availableScopes(subjects, semesters), [subjects, semesters]);
  const mobile = useIsMobile();
  const maxHeight = mobile ? 360 : 600;
  const host = displayHost(APP_URL || "gwa-calculator.yjaphzs.xyz");

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-5xl" drawerClassName="max-h-[94svh]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Share your result</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Make an image for your feed or story. It&apos;s created on this device, and only what you switch on is shown.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div className="md:sticky md:top-0 md:self-start">
            {studio.content ? (
              <SharePreview format={studio.options.format} maxHeight={maxHeight}>
                <ShareTemplate
                  ref={templateRef}
                  content={studio.content}
                  options={studio.options}
                  mood={studio.mood}
                  variant={studio.variant}
                  caption={studio.caption}
                  identity={studio.identity}
                  host={host}
                />
              </SharePreview>
            ) : (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Nothing to share here yet. Add subjects or pick something else to share.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-6">
            <LookControls studio={studio} scopes={scopes} />
            <ContentControls studio={studio} />
          </div>
        </ResponsiveDialogBody>
        <ShareActions studio={studio} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
