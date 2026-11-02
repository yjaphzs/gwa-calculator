import { LockIcon } from "lucide-react";

import type { BadgeStatus } from "@/features/achievements/lib/evaluate-badges";
import { cn } from "@/lib/utils";

/** One badge: in the accent color once earned, otherwise grey with how close it is. */
export function BadgeTile({ status }: { status: BadgeStatus }) {
  const { badge, earned, progress } = status;
  const Icon = badge.icon;
  const percent = Math.round((progress.current / progress.target) * 100);

  return (
    <li
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-4 text-center",
        earned ? "border-primary/40 bg-primary/5" : "bg-muted/30",
      )}
    >
      <span
        className={cn(
          "relative flex size-14 items-center justify-center rounded-full",
          earned ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon aria-hidden className="size-7" />
        {!earned && (
          <LockIcon aria-hidden className="absolute -right-0.5 -bottom-0.5 size-5 rounded-full bg-background p-0.5 text-muted-foreground" />
        )}
      </span>
      <p className="text-sm font-semibold">
        {badge.name}
        <span className="sr-only">{earned ? ", earned" : ", not yet earned"}</span>
      </p>
      <p className="text-xs text-muted-foreground">{badge.hint}</p>
      {!earned && (
        <div className="mt-auto flex w-full flex-col gap-1">
          <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary/70" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground">{progress.label}</p>
        </div>
      )}
    </li>
  );
}
