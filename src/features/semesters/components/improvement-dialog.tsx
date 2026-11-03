"use client";

import { Share2Icon, TrendingUpIcon } from "lucide-react";

import { ConfettiBurst } from "@/components/shared/confetti-burst";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { SavedImprovement } from "@/features/calculator/hooks/use-celebrations";
import { formatDelta } from "@/features/calculator/lib/improvement";
import { formatTermLabel } from "@/features/semesters/lib/semesters";
import { computeGwa } from "@/lib/academic";
import type { Semester } from "@/types";

interface ImprovementDialogProps {
  saved: SavedImprovement | null;
  onClose: () => void;
  onShare: (semester: Semester) => void;
}

const GWA_CODE = "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold";

/** Opens by itself when a newly saved term beats the one before it: confetti and "Gumanda ng 0.18!". */
export function ImprovementDialog({ saved, onClose, onShare }: ImprovementDialogProps) {
  if (!saved) return null;
  const { semester, improvement, open } = saved;
  const delta = formatDelta(improvement.delta);
  const gwa = computeGwa(semester.subjects).gwa;

  return (
    <>
      <ConfettiBurst active={open} />
      <AlertDialog open={open} onOpenChange={(next) => !next && onClose()}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary">
              <TrendingUpIcon className="size-6 text-primary-foreground" />
            </div>
            <AlertDialogTitle className="text-2xl">Gumanda ng {delta}!</AlertDialogTitle>
            <AlertDialogDescription className="text-md text-center">
              {formatTermLabel(semester)} came in at <code className={GWA_CODE}>{gwa?.toFixed(3)}</code>, {delta} better
              than {improvement.term}. Ang galing ng pag-akyat mo!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <Button
              onClick={() => {
                onClose();
                onShare(semester);
              }}
            >
              <Share2Icon className="size-4" />
              Share
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
