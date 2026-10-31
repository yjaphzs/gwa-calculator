"use client";

import { useEffect, useState } from "react";
import { CopyIcon, DownloadIcon, LoaderCircleIcon, Share2Icon } from "lucide-react";

import { ResponsiveDialogFooter, useResponsiveDialogIsDrawer } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/config/app";
import type { ShareStudio } from "@/features/share/hooks/use-share-studio";
import { canShareImages } from "@/features/share/lib/share-targets";
import { shareLink, type ShareSite } from "@/features/share/lib/share-text";

const SITES: { site: ShareSite; label: string }[] = [
  { site: "x", label: "X" },
  { site: "threads", label: "Threads" },
  { site: "facebook", label: "Facebook" },
];

/**
 * Share (the phone's share sheet: Instagram, Facebook, Messenger, X…),
 * Download, and Copy caption. Site links carry the caption and app link only;
 * no site accepts an image from a link.
 */
export function ShareActions({ studio }: { studio: ShareStudio }) {
  const drawer = useResponsiveDialogIsDrawer();
  const [sheet, setSheet] = useState(false);
  useEffect(() => setSheet(canShareImages()), []);
  const { busy, content } = studio;
  const size = drawer ? "h-11" : undefined;
  const spinner = <LoaderCircleIcon className="size-4 animate-spin" />;

  const share = (
    <Button className={size} disabled={!content || busy !== null} onClick={sheet ? studio.share : studio.download}>
      {busy ? spinner : sheet ? <Share2Icon className="size-4" /> : <DownloadIcon className="size-4" />}
      {sheet ? "Share image" : "Download image"}
    </Button>
  );

  return (
    <ResponsiveDialogFooter className="flex-col items-stretch gap-3 sm:flex-col sm:items-stretch sm:justify-start">
      {/* Sheet: the main action full width, the others side by side to save height. */}
      {drawer && share}
      <div className={drawer ? "grid grid-cols-2 gap-2" : "flex flex-wrap justify-end gap-2"}>
        {sheet && (
          <Button variant="outline" className={size} disabled={!content || busy !== null} onClick={studio.download}>
            <DownloadIcon className="size-4" />
            Download
          </Button>
        )}
        <Button
          variant="outline"
          className={`${size ?? ""} ${drawer && !sheet ? "col-span-2" : ""}`}
          disabled={!content}
          onClick={studio.copyCaption}
        >
          <CopyIcon className="size-4" />
          Copy caption
        </Button>
        {!drawer && share}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:justify-end">
        <span>Share the link and caption on</span>
        {SITES.map(({ site, label }) => (
          <a
            key={site}
            href={shareLink(site, studio.text, APP_URL)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {label}
          </a>
        ))}
      </div>
    </ResponsiveDialogFooter>
  );
}
