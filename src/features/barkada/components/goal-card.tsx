"use client";

import { useEffect, useState } from "react";
import { TargetIcon } from "lucide-react";

import { ConfettiBurst } from "@/components/shared/confetti-burst";
import { goalLabel, goalProgress } from "@/features/barkada/lib/barkada-rank";
import { buzz } from "@/lib/haptics";
import type { BarkadaGroup } from "@/types";

/** Celebrated once per group and term on this device. */
const celebratedKey = (group: BarkadaGroup) => `gwa_barkada_goal_${group.id}_${group.term.key}`;

/** The shared goal and how close the barkada is, with confetti the first time everyone makes it. */
export function GoalCard({ group }: { group: BarkadaGroup }) {
  const progress = goalProgress(group.members, group.goal);
  const percent = progress.total ? Math.round((progress.made / progress.total) * 100) : 0;
  const [celebrate, setCelebrate] = useState(false);
  const key = celebratedKey(group);

  useEffect(() => {
    if (!progress.reached) return;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      return; // Storage blocked: skip the cheer rather than repeat it every visit.
    }
    setCelebrate(true);
    buzz("honor");
  }, [progress.reached, key]);

  return (
    <section className="rounded-xl border p-4" aria-labelledby="barkada-goal">
      <ConfettiBurst active={celebrate} />
      <div className="flex items-start gap-3">
        <TargetIcon className="mt-0.5 size-5 shrink-0 text-chart-line" />
        <div className="min-w-0 flex-1">
          <h3 id="barkada-goal" className="font-semibold">
            {goalLabel(group.goal)}
          </h3>
          <p className="text-xs text-muted-foreground">{group.term.label}</p>
        </div>
      </div>
      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Members who made the goal"
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-valuenow={progress.made}
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-sm">
        {progress.reached ? (
          <span className="font-medium">Goal reached! Ang galing ng barkada! 🎉</span>
        ) : (
          <>
            <span className="font-medium tabular-nums">
              {progress.made} of {progress.total}
            </span>{" "}
            made it
            {progress.waiting > 0 && <span className="text-muted-foreground"> · {progress.waiting} still waiting for grades</span>}
          </>
        )}
      </p>
    </section>
  );
}
