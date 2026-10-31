import type { ShareContent } from "@/features/share/lib/share-content";

interface ShareTextOptions {
  appName: string;
  appUrl: string;
  /** The line printed on the image. */
  caption: string;
  showHonor: boolean;
}

/**
 * The words that go with the image when it's shared: the caption, the result
 * (only what the image shows), and where to calculate your own.
 */
export function buildShareText(content: ShareContent, { appName, appUrl, caption, showHonor }: ShareTextOptions): string {
  const gwa = content.gwa === null ? null : content.gwa.toFixed(3);
  const honor = showHonor && content.honor ? ` (${content.honor})` : "";
  const result = gwa ? `${content.heading}: ${gwa}${honor}` : content.heading;
  return [caption, result, `Compute yours with ${appName}: ${appUrl}`, "#GWA #GWACalculator"].join("\n\n");
}

export type ShareSite = "x" | "threads" | "facebook";

/**
 * Links that open a site's own share box. They carry text and the app link
 * only: no site accepts an image from a link, so images go through the
 * phone's share sheet or a download.
 */
export function shareLink(site: ShareSite, text: string, appUrl: string): string {
  const enc = encodeURIComponent;
  switch (site) {
    case "x":
      return `https://x.com/intent/tweet?text=${enc(text)}`;
    case "threads":
      return `https://www.threads.net/intent/post?text=${enc(text)}`;
    case "facebook":
      // Facebook ignores prefilled text; it shares the link and lets the user write.
      return `https://www.facebook.com/sharer/sharer.php?u=${enc(appUrl)}`;
  }
}

/** "gwa-calculator-my-gwa-proud.png" */
export function imageFileName(content: ShareContent, mood: string): string {
  const slug = content.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `gwa-calculator-${slug}-${mood}.png`;
}
