import { APP_URL } from "@/config/app";
import { shareLink, type ShareSite } from "@/features/share/lib/share-text";
import { cn } from "@/lib/utils";

const SITES: { site: ShareSite; label: string }[] = [
  { site: "x", label: "X" },
  { site: "threads", label: "Threads" },
  { site: "facebook", label: "Facebook" },
];

/** Links that post the caption and app link (no site accepts an image from a link). */
export function ShareSiteLinks({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", className)}>
      <span>Share the link and caption on</span>
      {SITES.map(({ site, label }) => (
        <a
          key={site}
          href={shareLink(site, text, APP_URL)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {label}
        </a>
      ))}
    </div>
  );
}
