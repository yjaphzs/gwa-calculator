"use client";

import { useEffect, useState } from "react";
import { SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CHANGELOG, LATEST_VERSION, type ChangeType } from "@/config/changelog";

const SEEN_KEY = "gwa_changelog_seen";

// Render order + styling for the change-type groups. One soft dot + label per
// group keeps the list calm instead of a colored pill on every single line.
const TYPE_ORDER: ChangeType[] = ["new", "improved", "fixed"];

const TYPE_META: Record<ChangeType, { label: string; dot: string; text: string }> = {
  new: {
    label: "New",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  improved: {
    label: "Improved",
    dot: "bg-sky-500",
    text: "text-sky-600 dark:text-sky-400",
  },
  fixed: {
    label: "Fixed",
    dot: "bg-muted-foreground/60",
    text: "text-muted-foreground",
  },
};

export function WhatsNewButton() {
  const [open, setOpen] = useState(false);
  // Default to "seen" so the dot never flashes during SSR/first paint; the
  // effect below corrects it from localStorage on the client.
  const [seenVersion, setSeenVersion] = useState<string | null>(LATEST_VERSION);

  useEffect(() => {
    try {
      setSeenVersion(localStorage.getItem(SEEN_KEY));
    } catch {
      /* ignore */
    }
  }, []);

  const hasUnseen = seenVersion !== LATEST_VERSION;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      try {
        localStorage.setItem(SEEN_KEY, LATEST_VERSION);
      } catch {
        /* ignore */
      }
      setSeenVersion(LATEST_VERSION);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={hasUnseen ? "What's new (updates available)" : "What's new"}
        >
          <SparklesIcon />
          {hasUnseen && (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[80svh] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b p-5">
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-primary" />
            What&apos;s new
          </DialogTitle>
          <DialogDescription>
            The latest features and improvements in GWA Calculator.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 divide-y divide-border/60 overflow-y-auto px-5">
          {CHANGELOG.map((entry) => {
            const groups = TYPE_ORDER.map((type) => ({
              type,
              items: entry.changes
                .filter((c) => c.type === type)
                .map((c) => c.text),
            })).filter((g) => g.items.length > 0);

            return (
              <section key={entry.version} className="py-6">
                <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                    v{entry.version}
                  </span>
                  {entry.title && (
                    <h3 className="text-sm font-semibold text-foreground">
                      {entry.title}
                    </h3>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {entry.date}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {groups.map((group) => {
                    const meta = TYPE_META[group.type];
                    return (
                      <div key={group.type} className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn("size-1.5 rounded-full", meta.dot)}
                          />
                          <span
                            className={cn(
                              "text-[11px] font-semibold uppercase tracking-wider",
                              meta.text,
                            )}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <ul className="space-y-1.5 pl-3.5 text-sm leading-relaxed text-muted-foreground">
                          {group.items.map((text, i) => (
                            <li key={i}>{text}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
