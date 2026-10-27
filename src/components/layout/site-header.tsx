import AppHeader from "@/components/dom/app-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccountMenu } from "@/components/account-menu";
import { WhatsNewButton } from "@/components/whats-new";
import { APP_NAME, APP_VERSION } from "@/config/app";

/**
 * Sticky top app bar: brand on the left, and the What's-new / theme / account
 * controls grouped on the right.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-2 px-4">
        <div className="min-w-0">
          <AppHeader appName={APP_NAME} appVersion={APP_VERSION} />
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <WhatsNewButton />
          <ThemeToggle />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
