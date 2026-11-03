"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AwardIcon, BookOpenIcon, CalculatorIcon, TrophyIcon } from "lucide-react";

import { useUnseenBadges } from "@/features/achievements/hooks/use-badges";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Calculator", icon: CalculatorIcon },
  { href: "/achievements", label: "Badges", icon: AwardIcon },
  { href: "/how-to-compute-gwa", label: "How it works", icon: BookOpenIcon },
  // Signed-out visitors are sent to sign in, then brought back here.
  { href: "/leaderboard", label: "Leaderboard", icon: TrophyIcon },
] as const;

/** trailingSlash export → "/leaderboard/"; compare without it. */
const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

const FOCUS = "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

interface MainNavProps {
  /** "inline" sits in the header row (md+); "bar" is the bottom tab bar below md. */
  variant: "inline" | "bar";
  className?: string;
}

/** A dot on Badges while there are newly earned badges the user hasn't looked at. */
function NewDot({ className }: { className: string }) {
  return (
    <>
      <span aria-hidden className={cn("absolute size-2 rounded-full bg-primary ring-2 ring-background", className)} />
      <span className="sr-only">, new badge</span>
    </>
  );
}

/** Primary navigation: the calculator, badges, the guide, and the leaderboard. */
export function MainNav({ variant, className }: MainNavProps) {
  const pathname = normalize(usePathname() ?? "/");
  const unseen = useUnseenBadges();
  const hasDot = (href: string) => href === "/achievements" && unseen > 0 && pathname !== href;

  if (variant === "inline") {
    return (
      <nav aria-label="Main" className={cn("hidden items-center gap-1.5 md:flex", className)}>
        {NAV_ITEMS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                FOCUS,
                active && "bg-accent text-foreground",
              )}
            >
              {label}
              {hasDot(href) && <NewDot className="top-1.5 right-1" />}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Main"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden",
        className,
      )}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-1 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors",
              FOCUS,
              active && "text-foreground",
            )}
          >
            <span
              className={cn(
                "relative flex h-7 w-14 items-center justify-center rounded-full transition-colors",
                active && "bg-primary/10 text-primary",
              )}
            >
              <Icon aria-hidden className="size-5" />
              {hasDot(href) && <NewDot className="top-0.5 right-3" />}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
