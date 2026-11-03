"use client";

import { DownloadIcon, LoaderCircleIcon, Share2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { WrappedViewerState } from "@/features/wrapped/hooks/use-wrapped-viewer";

/** One row under the slide, within thumb reach: the GWA privacy switch, Download, and Share. */
export function WrappedActions({ viewer }: { viewer: WrappedViewerState }) {
  const spinner = <LoaderCircleIcon className="size-4 animate-spin" />;

  return (
    <div className="flex items-center gap-2">
      <label className="flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white/10 pr-4 pl-3 text-sm font-medium">
        <Switch checked={viewer.exact} onCheckedChange={viewer.setExact} aria-label="Exact GWA" />
        Exact GWA
      </label>
      <Button
        variant="outline"
        size="icon"
        className="size-11 shrink-0"
        disabled={viewer.busy !== null}
        onClick={viewer.download}
        aria-label="Download slide"
      >
        {viewer.busy === "download" ? spinner : <DownloadIcon className="size-4" />}
      </Button>
      <Button className="h-11 min-w-0 flex-1" disabled={viewer.busy !== null} onClick={viewer.share}>
        {viewer.busy === "share" ? spinner : <Share2Icon className="size-4" />}
        Share slide
      </Button>
    </div>
  );
}
