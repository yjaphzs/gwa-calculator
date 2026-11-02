"use client";

import { HeartIcon, PartyPopper, Share2Icon, TrendingUpIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { formatDelta, type Improvement } from "@/features/calculator/lib/improvement";
import { HONOR_MIN_UNITS } from "@/lib/academic";

interface GwaCelebrationDialogProps {
  gwa: number | null;
  honor: string | null;
  totalUnits: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Better than the latest saved term: celebrated even without an honor. */
  improvement: Improvement | null;
  /** Share this moment: closes the dialog, then opens the share studio. */
  onShare?: () => void;
}

const GWA_CODE = "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold";

/**
 * "Congratulate" when the working set earns an honor, otherwise "My GWA" once
 * there are enough units to count. Hidden until one of those applies. Beating
 * the latest saved term gets its own cheer ("Gumanda ng 0.18!").
 */
export function GwaCelebrationDialog({
  gwa,
  honor,
  totalUnits,
  open,
  onOpenChange,
  improvement,
  onShare,
}: GwaCelebrationDialogProps) {
  const encourage = !honor && gwa !== null && gwa > 0 && totalUnits >= HONOR_MIN_UNITS;
  if (!honor && !encourage) return null;

  const Icon = honor ? PartyPopper : improvement ? TrendingUpIcon : HeartIcon;
  const gwaText = <code className={GWA_CODE}>{gwa?.toFixed(3)}</code>;
  const delta = improvement && formatDelta(improvement.delta);
  const title = honor ? "Congratulations!" : delta ? `Gumanda ng ${delta}!` : "Keep Going!";

  return (
    // data-phone-row lets the toolbar keep this row visible on phones.
    <ButtonGroup data-phone-row>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogTrigger asChild>
          <Button variant="default">
            <Icon className="size-4" />
            {honor ? "Congratulate" : "My GWA"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary">
              <Icon className="size-6 text-primary-foreground" />
            </div>
            <AlertDialogTitle className="text-2xl">{title}</AlertDialogTitle>
            <AlertDialogDescription className="text-md text-center">
              {honor ? (
                <>
                  You've achieved the academic honor of <strong>{honor}</strong> with a GWA of{" "}
                  {gwaText}!{" "}
                  {improvement ? `That's ${delta} better than ${improvement.term}, too.` : "Keep up the excellent work!"}
                </>
              ) : improvement ? (
                <>
                  Your GWA is {gwaText}, {delta} better than {improvement.term}. Not on the honors list
                  yet, but look at that climb. Tuloy lang!
                </>
              ) : (
                <>
                  Your current GWA is {gwaText}. You're not on the honors list yet, but every
                  step forward counts. Keep pushing, you've got this!
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {onShare && (
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onShare();
                }}
              >
                <Share2Icon className="size-4" />
                Share
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ButtonGroup>
  );
}
