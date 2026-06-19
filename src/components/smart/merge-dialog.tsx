"use client";

import { CloudIcon, LaptopIcon, MergeIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MergeConflict } from "@/hooks/use-calculator-data";

interface MergeDialogProps {
  conflict: MergeConflict | null;
  onResolve: (choice: "merge" | "cloud" | "local") => void;
}

function summarize(label: string, subjects: number, semesters: number) {
  return `${label}: ${subjects} subject${subjects === 1 ? "" : "s"}, ${semesters} semester${
    semesters === 1 ? "" : "s"
  }`;
}

export function MergeDialog({ conflict, onResolve }: MergeDialogProps) {
  return (
    <Dialog
      open={!!conflict}
      onOpenChange={(open) => {
        // Dismissing without choosing keeps the account (cloud) data — the safe
        // default that never silently discards what's already saved.
        if (!open) onResolve("cloud");
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Sync your data</DialogTitle>
          <DialogDescription>
            We found data on this device and in your account. Choose which to
            keep — this only happens once.
          </DialogDescription>
        </DialogHeader>

        {conflict && (
          <div className="grid gap-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
            <span>
              {summarize(
                "This device",
                conflict.local.subjects.length,
                conflict.local.semesters.length,
              )}
            </span>
            <span>
              {summarize(
                "Your account",
                conflict.cloud.subjects.length,
                conflict.cloud.semesters.length,
              )}
            </span>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button onClick={() => onResolve("merge")}>
            <MergeIcon />
            Merge both
          </Button>
          <Button variant="outline" onClick={() => onResolve("cloud")}>
            <CloudIcon />
            Keep account data
          </Button>
          <Button variant="outline" onClick={() => onResolve("local")}>
            <LaptopIcon />
            Keep this device&apos;s data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
