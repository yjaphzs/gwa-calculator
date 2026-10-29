"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenIcon, CalculatorIcon, TrophyIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Calculator", icon: CalculatorIcon },
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

/** Primary navigation between the calculator, the guide, and the leaderboard. */
export function MainNav({ variant, className }: MainNavProps) {
  const pathname = normalize(usePathname() ?? "/");

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
                "rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                FOCUS,
                active && "bg-accent text-foreground",
              )}
            >
              {label}
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
        "fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden",
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
                "flex h-7 w-14 items-center justify-center rounded-full transition-colors",
                active && "bg-primary/10 text-primary",
              )}
            >
              <Icon aria-hidden className="size-5" />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
