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

interface MainNavProps {
  /** "inline" sits in the header row (md+); "bar" is the full-width row below md. */
  variant: "inline" | "bar";
  className?: string;
}

/** Primary navigation between the calculator, the guide, and the leaderboard. */
export function MainNav({ variant, className }: MainNavProps) {
  const pathname = normalize(usePathname() ?? "/");

  return (
    <nav
      aria-label="Main"
      className={cn(
        variant === "inline" ? "hidden items-center gap-1.5 md:flex" : "grid grid-cols-3 gap-1 md:hidden",
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
              "flex items-center justify-center rounded-md font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              variant === "inline" ? "px-3 py-2 text-sm" : "flex-col gap-0.5 px-1 py-1.5 text-xs",
              "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
              active && "bg-accent text-foreground",
            )}
          >
            {/* Icons only in the roomier mobile bar; the inline row stays text-only. */}
            {variant === "bar" && <Icon aria-hidden className="size-4" />}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
