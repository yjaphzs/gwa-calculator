"use client";

import { RotateCcw } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ResetSubjectsDialogProps {
  onConfirm: () => void;
  /** Controlled mode, for opening the confirmation from a menu or sheet. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hide the "Reset" button when something else opens the dialog. */
  showTrigger?: boolean;
}

/** "Reset" button with a destructive confirmation. */
export function ResetSubjectsDialog({ onConfirm, open, onOpenChange, showTrigger = true }: ResetSubjectsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <RotateCcw className="mx-auto size-10 rounded-lg border bg-primary p-2 text-primary-foreground sm:mx-0" />
          <AlertDialogTitle>Reset all subjects?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all your subjects and
            reset your GWA.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Continue Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
