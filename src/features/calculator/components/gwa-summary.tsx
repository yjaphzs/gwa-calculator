import Link from "next/link";
import { Share2Icon, SlidersHorizontalIcon, TrendingUpIcon } from "lucide-react";

import { AnimatedNumber } from "@/components/shared/animated-number";
import { HonorBadge } from "@/components/shared/honor-badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { CardLine } from "@/features/calculator/components/card-line";
import { cardLineState } from "@/features/calculator/lib/card-line";
import { formatDelta, type Improvement } from "@/features/calculator/lib/improvement";
import { countsTowardGwa } from "@/lib/academic";
import { describeHonorProgress, honorProgress } from "@/lib/gwa-insights";
import type { Subject } from "@/types";

interface GwaSummaryProps {
  subjects: Subject[];
  gwa: number | null;
  honor: string | null;
  totalUnits: number;
  /** Better than the latest saved term, if it is. */
  improvement: Improvement | null;
  /** Opens the share studio for this result. */
  onShare?: () => void;
  /** Opens "What if?". */
  onWhatIf?: () => void;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The working set's GWA: readout, what it counts, honor, and how close the next band is. */
export function GwaSummary({ subjects, gwa, honor, totalUnits, improvement, onShare, onWhatIf }: GwaSummaryProps) {
  const display = gwa !== null ? gwa.toFixed(3) : "0.000";
  const counted = subjects.filter(countsTowardGwa).length;
  const notCounted = subjects.length - counted;
  const standing = honorProgress(subjects);
  const progress = describeHonorProgress(standing);

  return (
    <section
      aria-labelledby="current-gwa"
      className="mt-4 flex w-full flex-col gap-3 rounded-lg border border-dashed bg-muted/30 px-5 py-6 sm:px-8 sm:py-8"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="current-gwa" className="text-sm font-semibold">
            Current GWA
          </h2>
          <p className="text-xs text-muted-foreground">
            {plural(totalUnits, "unit")} across {plural(counted, "subject")}
            {notCounted > 0 && `, plus ${notCounted} not counted`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {honor && <HonorBadge honor={honor} />}
          {onShare && gwa !== null && (
            <Button variant="ghost" size="icon" className="max-md:size-10" aria-label="Share your GWA" onClick={onShare}>
              <Share2Icon />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <CopyButton variant="default" size="lg" content={display} aria-label="Copy GWA" />
        <div className={`text-end font-mono text-5xl font-bold tabular-nums sm:text-6xl ${gwa === null ? "text-muted-foreground/60" : ""}`}>
          {gwa !== null ? <AnimatedNumber value={gwa} /> : display}
        </div>
      </div>

      {improvement && (
        <p className="inline-flex items-center gap-1.5 self-end rounded-full bg-status-new/15 px-2.5 py-1 text-xs font-medium">
          <TrendingUpIcon aria-hidden className="size-3.5 text-status-new" />
          {formatDelta(improvement.delta)} better than {improvement.term}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
        <p className="text-muted-foreground">{progress ?? "Add subjects to see your GWA."}</p>
        <Link
          href="/how-to-compute-gwa"
          className="text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          How is this computed?
        </Link>
      </div>
      <div className="flex items-center justify-between gap-3">
        <CardLine state={cardLineState(standing, improvement !== null)} />
        {onWhatIf && counted > 0 && (
          <Button variant="outline" size="sm" className="shrink-0 max-md:h-10" onClick={onWhatIf}>
            <SlidersHorizontalIcon />
            What if?
          </Button>
        )}
      </div>
    </section>
  );
}
