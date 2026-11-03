"use client";

import { SparklesIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaptionControls } from "@/features/share/components/caption-controls";
import { LookTab } from "@/features/share/components/look-tab";
import { MoodTab } from "@/features/share/components/mood-tab";
import { ShareSiteLinks } from "@/features/share/components/share-site-links";
import { ShowTab } from "@/features/share/components/show-tab";
import type { ShareStudio } from "@/features/share/hooks/use-share-studio";
import type { ShareScope } from "@/features/share/lib/share-content";

interface StudioTabsProps {
  studio: ShareStudio;
  scopes: { scope: ShareScope; label: string }[];
  showTip: boolean;
  onTabChange: () => void;
}

// Phones: the open tab scrolls on its own under the pinned preview.
const PANEL = "mt-3 max-md:min-h-0 max-md:flex-1 max-md:overflow-y-auto max-md:overscroll-contain max-md:pb-2";

/** The studio's options, one group at a time: Look, Mood, Caption, Show. */
export function StudioTabs({ studio, scopes, showTip, onTabChange }: StudioTabsProps) {
  return (
    <Tabs defaultValue="look" onValueChange={onTabChange} className="gap-0 max-md:min-h-0 max-md:flex-1">
      <div className="relative">
        <TabsList className="w-full max-md:h-11">
          <TabsTrigger value="look">Look</TabsTrigger>
          <TabsTrigger value="mood">Mood</TabsTrigger>
          <TabsTrigger value="caption">Caption</TabsTrigger>
          <TabsTrigger value="show">Show</TabsTrigger>
        </TabsList>
        {showTip && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-primary/60 motion-safe:animate-pulse motion-reduce:hidden"
          />
        )}
      </div>
      {showTip && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium">
          <SparklesIcon className="size-3.5 shrink-0 text-chart-line" />
          Make it yours: pick a tab, swipe the image, or tap it to see it big.
        </p>
      )}
      <TabsContent value="look" className={PANEL}>
        <LookTab studio={studio} />
      </TabsContent>
      <TabsContent value="mood" className={PANEL}>
        <MoodTab studio={studio} />
      </TabsContent>
      <TabsContent value="caption" className={PANEL}>
        <div className="flex flex-col gap-5">
          <CaptionControls studio={studio} />
          {/* The footer is one row on phones, so the site links live here. */}
          <ShareSiteLinks text={studio.text} className="md:hidden" />
        </div>
      </TabsContent>
      <TabsContent value="show" className={PANEL}>
        <ShowTab studio={studio} scopes={scopes} />
      </TabsContent>
    </Tabs>
  );
}
