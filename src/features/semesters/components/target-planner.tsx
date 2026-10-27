"use client";

import { useState } from "react";
import { TargetIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LATIN_HONOR_BANDS, computeGwa } from "@/lib/academic";
import { requiredTermGwa, type TermTarget } from "@/lib/gwa-insights";
import type { Semester } from "@/types";

const TARGETS = LATIN_HONOR_BANDS.map((band) => ({
  value: band.max.toFixed(2),
  label: `${band.name} (${band.max.toFixed(2)} or better)`,
}));

function describe(result: TermTarget, target: string): string {
  switch (result.kind) {
    case "reachable":
      return `You need a semester GWA of ${result.requiredGwa.toFixed(3)} or better to keep your cumulative at ${target} or better.`;
    case "any-passing":
      return `Any passing semester keeps your cumulative at ${target} or better.`;
    case "out-of-reach":
      return `Not reachable next semester. Even straight 1.00s would bring your cumulative to ${result.bestCumulative.toFixed(3)}.`;
  }
}

/** "What do I need next semester?" against a Latin-honor cutoff. */
export function TargetPlanner({ semesters }: { semesters: Semester[] }) {
  const [target, setTarget] = useState(TARGETS[TARGETS.length - 1].value);
  const [units, setUnits] = useState("21");

  const subjects = semesters.flatMap((s) => s.subjects);
  const { gwa, totalUnits } = computeGwa(subjects);
  if (gwa === null) return null;

  const nextUnits = Number(units);
  const valid = Number.isFinite(nextUnits) && nextUnits >= 1 && nextUnits <= 40;
  const message = valid
    ? describe(requiredTermGwa(subjects, Number(target), nextUnits), target)
    : "Enter between 1 and 40 units for next semester.";

  return (
    <section aria-labelledby="planner-title" className="rounded-lg border p-4">
      <h3 id="planner-title" className="flex items-center gap-2 text-sm font-semibold">
        <TargetIcon aria-hidden className="size-4 text-primary" />
        Plan your next semester
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Cumulative so far: <span className="font-mono font-semibold text-foreground">{gwa.toFixed(3)}</span> over{" "}
        {totalUnits} units.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_8rem]">
        <div className="grid gap-1.5">
          <Label htmlFor="planner-target">Goal</Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger id="planner-target" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGETS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="planner-units">Units next semester</Label>
          <Input
            id="planner-units"
            type="number"
            inputMode="numeric"
            min={1}
            max={40}
            value={units}
            onChange={(e) => setUnits(e.target.value)}
          />
        </div>
      </div>
      <p aria-live="polite" className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
        {message}
      </p>
    </section>
  );
}
