"use client";

import { useEffect, useState } from "react";
import { CopyIcon, DownloadIcon, LoaderCircleIcon, Share2Icon } from "lucide-react";

import { ResponsiveDialogFooter, useResponsiveDialogIsDrawer } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { ShareSiteLinks } from "@/features/share/components/share-site-links";
import type { ShareStudio } from "@/features/share/hooks/use-share-studio";
import { canShareImages } from "@/features/share/lib/share-targets";

/**
 * Share (the phone's share sheet: Instagram, Facebook, Messenger, X…),
 * Download, and Copy caption. On a phone they fit one row, so the preview and
 * the options keep the room; the site links move to the Caption tab there.
 */
export function ShareActions({ studio }: { studio: ShareStudio }) {
  const drawer = useResponsiveDialogIsDrawer();
  const [sheet, setSheet] = useState(false);
  useEffect(() => setSheet(canShareImages()), []);
  const { busy, content } = studio;
  const idle = !content || busy !== null;
  const spinner = <LoaderCircleIcon className="size-4 animate-spin" />;

  const share = (
    <Button className={drawer ? "h-11 flex-1" : undefined} disabled={idle} onClick={sheet ? studio.share : studio.download}>
      {busy ? spinner : sheet ? <Share2Icon className="size-4" /> : <DownloadIcon className="size-4" />}
      {sheet ? "Share image" : "Download image"}
    </Button>
  );

  if (drawer) {
    return (
      <ResponsiveDialogFooter className="flex-row gap-2">
        {share}
        {sheet && (
          <Button variant="outline" size="icon" className="size-11" disabled={idle} onClick={studio.download} aria-label="Download image" title="Download image">
            <DownloadIcon className="size-4" />
          </Button>
        )}
        <Button variant="outline" size="icon" className="size-11" disabled={!content} onClick={studio.copyCaption} aria-label="Copy caption" title="Copy caption">
          <CopyIcon className="size-4" />
        </Button>
      </ResponsiveDialogFooter>
    );
  }

  return (
    <ResponsiveDialogFooter className="flex-col items-stretch gap-3 sm:flex-col sm:items-stretch sm:justify-start">
      <div className="flex flex-wrap justify-end gap-2">
        {sheet && (
          <Button variant="outline" disabled={idle} onClick={studio.download}>
            <DownloadIcon className="size-4" />
            Download
          </Button>
        )}
        <Button variant="outline" disabled={!content} onClick={studio.copyCaption}>
          <CopyIcon className="size-4" />
          Copy caption
        </Button>
        {share}
      </div>
      <ShareSiteLinks text={studio.text} className="justify-end" />
    </ResponsiveDialogFooter>
  );
}
