import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  /** Max width of the content column, e.g. "max-w-3xl". */
  width?: string;
  /** Rendered after the content column, full width (e.g. the calculator footer). */
  footer?: ReactNode;
}

/** Page frame: the shared header, then a centered content column. */
export function AppShell({ children, width = "max-w-3xl", footer }: AppShellProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className={cn("mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-8 md:px-8", width)}>
        {children}
      </main>
      {footer}
    </div>
  );
}
