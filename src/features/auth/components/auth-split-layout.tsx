import type { ReactNode } from "react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { AppearanceButton } from "@/features/appearance/components/appearance-button";
import { AppCheckActivator } from "@/features/auth/components/app-check-activator";
import { AuthBanner } from "@/features/auth/components/auth-banner";

/** Split screen for auth pages: form column on the left, banner on the right. */
export function AuthSplitLayout({
  children,
  contentClassName = "w-full max-w-xs",
}: {
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <AppCheckActivator />
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <AppearanceButton />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className={contentClassName}>{children}</div>
        </div>
        <SiteFooter variant="minimal" />
      </div>
      <AuthBanner />
    </div>
  );
}
