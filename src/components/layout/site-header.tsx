import { AccountMenu } from "@/components/layout/account-menu";
import { BrandLogo } from "@/components/layout/brand-logo";
import { MainNav } from "@/components/layout/main-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { WhatsNewButton } from "@/features/changelog/components/whats-new";

/**
 * Sticky top bar shared by every page except the auth screens. It's wider than
 * the reading column so brand, navigation, and actions each get room: brand on
 * the left, navigation centered, actions on the right. Below md the navigation
 * moves to the bottom tab bar that AppShell renders.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto grid h-16 w-full max-w-5xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        <BrandLogo className="justify-self-start" />
        <MainNav variant="inline" />
        <div className="flex items-center gap-1 justify-self-end">
          <WhatsNewButton />
          <ThemeToggle />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
