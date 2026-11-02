import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { AnimatedNumber } from "@/components/shared/animated-number";
import { HonorBadge } from "@/components/shared/honor-badge";
import { formatDelta } from "@/features/calculator/lib/improvement";
import { gwaImprovement } from "@/lib/gwa-insights";

interface Result {
  gwa: number | null;
  honor: string | null;
}

/** The pretend GWA and honor, and how they compare with the real ones. Stays in view while scrolling. */
export function WhatIfResult({ now, then }: { now: Result; then: Result }) {
  const change = gwaImprovement(now.gwa, then.gwa);

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-lg border bg-background/95 p-4 backdrop-blur">
      <div>
        <p className="text-xs text-muted-foreground">Your GWA would be</p>
        <p className="font-mono text-4xl font-bold tabular-nums">
          {then.gwa !== null ? <AnimatedNumber value={then.gwa} duration={0.35} /> : "0.000"}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 text-right text-xs">
        {then.honor ? <HonorBadge honor={then.honor} /> : <span className="text-muted-foreground">No honor</span>}
        <p aria-live="polite" className="inline-flex items-center gap-1">
          {change !== null && change > 0 && <TrendingUpIcon aria-hidden className="size-3.5 text-status-new" />}
          {change !== null && change < 0 && <TrendingDownIcon aria-hidden className="size-3.5 text-muted-foreground" />}
          {!change ? "Same as now" : change > 0 ? `${formatDelta(change)} better than now` : `${formatDelta(-change)} behind now`}
        </p>
      </div>
    </div>
  );
}
