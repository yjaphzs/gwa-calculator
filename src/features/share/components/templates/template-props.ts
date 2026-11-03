import type { Ref } from "react";

import type { Badge } from "@/features/achievements/content/badges";
import type { Mood, MoodVariant } from "@/features/share/lib/moods";
import type { ShareContent } from "@/features/share/lib/share-content";
import type { ShareOptions } from "@/features/share/lib/share-options";

/** CSS for each mood's display face. */
export const TEMPLATE_FONTS = { sans: "var(--font-sans)", serif: "var(--font-serif)", mono: "var(--font-mono)" };

/**
 * What every share image style draws from. The image renders at its real size
 * (1080 wide); the preview scales the same element down and the export
 * captures it as-is. Inline styles throughout: every size is in image pixels.
 */
export interface ShareTemplateProps {
  ref?: Ref<HTMLDivElement>;
  content: ShareContent;
  options: ShareOptions;
  mood: Mood;
  variant: MoodVariant;
  caption: string;
  identity: { name?: string | null; school?: string | null };
  host: string;
  /** Up to three earned badges, for the trading card. */
  badges: Badge[];
}

/** The name and school line, when switched on. */
export function whoLine({ options, identity }: Pick<ShareTemplateProps, "options" | "identity">): string {
  return [options.show.name && identity.name, options.show.school && identity.school].filter(Boolean).join(" · ");
}
