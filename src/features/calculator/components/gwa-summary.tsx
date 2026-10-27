import Link from "next/link";

import { HonorBadge } from "@/components/shared/honor-badge";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { countsTowardGwa } from "@/lib/academic";
import { describeHonorProgress, honorProgress } from "@/lib/gwa-insights";
import type { Subject } from "@/types";

interface GwaSummaryProps {
  subjects: Subject[];
  gwa: number | null;
  honor: string | null;
  totalUnits: number;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The working set's GWA: readout, what it counts, honor, and how close the next band is. */
export function GwaSummary({ subjects, gwa, honor, totalUnits }: GwaSummaryProps) {
  const display = gwa !== null ? gwa.toFixed(3) : "0.000";
  const counted = subjects.filter(countsTowardGwa).length;
  const notCounted = subjects.length - counted;
  const progress = describeHonorProgress(honorProgress(subjects));

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
        {honor && <HonorBadge honor={honor} />}
      </div>

      <div className="flex items-center justify-between gap-4">
        <CopyButton variant="default" size="lg" content={display} aria-label="Copy GWA" />
        <div
          className={`text-end font-mono text-5xl font-bold tabular-nums sm:text-6xl ${gwa === null ? "text-muted-foreground/60" : ""}`}
        >
          {display}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
        <p className="text-muted-foreground">{progress ?? "Add subjects to see your GWA."}</p>
        <Link
          href="/how-to-compute-gwa"
          className="text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          How is this computed?
        </Link>
      </div>
    </section>
  );
}
