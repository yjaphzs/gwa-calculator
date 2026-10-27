import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { SiteFooter } from "@/components/layout/site-footer";

// Shared typography for long-form pages (legal documents, guides) — keeps them
// consistent without pulling in a Tailwind typography plugin.
export const PROSE =
  "max-w-none " +
  "[&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight " +
  "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground " +
  "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground " +
  "[&_p]:mt-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground " +
  "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6 [&_ul]:text-sm [&_ul]:leading-relaxed [&_ul]:text-muted-foreground " +
  "[&_li]:marker:text-muted-foreground/60 " +
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 " +
  "[&_strong]:font-semibold [&_strong]:text-foreground";

/** Page shell for long-form content: shared header, prose article, compact footer. */
export function ContentPageLayout({
  children,
  articleClassName = PROSE,
}: {
  children: ReactNode;
  articleClassName?: string;
}) {
  return (
    <AppShell>
      <article className={articleClassName}>{children}</article>
      <SiteFooter variant="compact" />
    </AppShell>
  );
}
