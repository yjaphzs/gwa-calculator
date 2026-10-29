import type { ReactNode } from "react";

import { MainNav } from "@/components/layout/main-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  /** Max width of the content column, e.g. "max-w-3xl". */
  width?: string;
  /** Rendered after the content column, full width (e.g. the calculator footer). */
  footer?: ReactNode;
}

/**
 * Page frame: the shared header, then a centered content column. Below md the
 * navigation is a fixed bottom tab bar, so the page pads its bottom to clear it.
 */
export function AppShell({ children, width = "max-w-3xl", footer }: AppShellProps) {
  return (
    <div className="flex min-h-svh flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <SiteHeader />
      <main className={cn("mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-8 md:px-8", width)}>
        {children}
      </main>
      {footer}
      <MainNav variant="bar" />
    </div>
  );
}
