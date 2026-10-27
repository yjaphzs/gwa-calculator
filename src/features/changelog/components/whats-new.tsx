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
import { CHANGELOG, LATEST_VERSION } from "@/config/changelog";
import { ChangelogEntry } from "@/features/changelog/components/changelog-entry";

const SEEN_KEY = "gwa_changelog_seen";

/** Header button opening the changelog, with a dot until the latest version is seen. */
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
          <DialogDescription>The latest features and improvements in GWA Calculator.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 divide-y divide-border/60 overflow-y-auto px-5">
          {CHANGELOG.map((entry) => (
            <ChangelogEntry key={entry.version} entry={entry} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
