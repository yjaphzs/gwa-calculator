"use client";

import { DownloadIcon, LoaderCircleIcon, Share2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { WrappedViewerState } from "@/features/wrapped/hooks/use-wrapped-viewer";
import { shortYear } from "@/features/wrapped/lib/wrapped";

/** Below the slides: the school year (when there's more than one), the GWA privacy switch, and Share/Download. */
export function WrappedActions({ viewer }: { viewer: WrappedViewerState }) {
  const spinner = <LoaderCircleIcon className="size-4 animate-spin" />;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-4">
        {viewer.years.length > 1 && (
          <Select value={viewer.year} onValueChange={viewer.pickYear}>
            <SelectTrigger aria-label="School year" className="h-10 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {viewer.years.map((year) => (
                <SelectItem key={year} value={year}>
                  S.Y. {shortYear(year)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Switch checked={viewer.exact} onCheckedChange={viewer.setExact} aria-label="Exact GWA" />
          Exact GWA
        </label>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="h-10" disabled={viewer.busy !== null} onClick={viewer.download}>
          {viewer.busy === "download" ? spinner : <DownloadIcon className="size-4" />}
          Download
        </Button>
        <Button className="h-10" disabled={viewer.busy !== null} onClick={viewer.share}>
          {viewer.busy === "share" ? spinner : <Share2Icon className="size-4" />}
          Share slide
        </Button>
      </div>
    </div>
  );
}
