"use client";

import { Slider } from "@/components/ui/slider";
import { gradeStep } from "@/features/calculator/lib/what-if";
import { GRADE_OPTIONS } from "@/lib/academic";
import type { Subject } from "@/types";

const TOP = GRADE_OPTIONS.length - 1;

interface WhatIfRowProps {
  subject: Subject;
  /** The pretend grade (the real one until the slider moves). */
  grade: number;
  onChange: (grade: number) => void;
}

/** One subject: a slider over the grades the form offers, with the real grade struck through once it changes. */
export function WhatIfRow({ subject, grade, onChange }: WhatIfRowProps) {
  const changed = grade !== subject.grade;
  const name = subject.title || subject.code;

  return (
    <li className="flex flex-col gap-3 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-sm font-medium">{name}</span>
        <span className="shrink-0 font-mono text-sm tabular-nums">
          {changed && <s className="mr-2 text-muted-foreground">{subject.grade.toFixed(2)}</s>}
          <span className={changed ? "font-bold" : undefined}>{grade.toFixed(2)}</span>
        </span>
      </div>
      {/* Reversed steps: 1.00 (the highest grade) is the maximum, on the right, so the bar fills as the grade improves. */}
      <Slider
        min={0}
        max={TOP}
        step={1}
        value={[TOP - gradeStep(grade)]}
        onValueChange={([position]) => onChange(GRADE_OPTIONS[TOP - position])}
        aria-label={`Grade for ${name}`}
        aria-valuetext={grade.toFixed(2)}
        // A bigger handle for fingers on phones.
        className="**:data-[slot=slider-thumb]:size-6 md:**:data-[slot=slider-thumb]:size-5"
      />
      <div aria-hidden className="flex justify-between text-[11px] text-muted-foreground">
        <span>5.00</span>
        <span>1.00</span>
      </div>
    </li>
  );
}
