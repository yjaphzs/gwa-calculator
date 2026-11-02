"use client";

import { useState } from "react";
import { RotateCcwIcon } from "lucide-react";

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { WhatIfResult } from "@/features/calculator/components/what-if/what-if-result";
import { WhatIfRow } from "@/features/calculator/components/what-if/what-if-row";
import { simulate, type GradeOverrides } from "@/features/calculator/lib/what-if";
import { countsTowardGwa } from "@/lib/academic";
import type { Subject } from "@/types";

interface WhatIfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
}

/** Try other grades and watch the GWA and honor move. Nothing is saved. */
export function WhatIfDialog({ open, onOpenChange, subjects }: WhatIfDialogProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-lg" drawerClassName="max-h-[94svh]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>What if?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Move a grade and watch your GWA and honor change. Just for fun: nothing is saved.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        {/* Mounted only while open, so the pretend grades reset each time. */}
        <WhatIfBody subjects={subjects} onDone={() => onOpenChange(false)} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function WhatIfBody({ subjects, onDone }: { subjects: Subject[]; onDone: () => void }) {
  const [overrides, setOverrides] = useState<GradeOverrides>({});
  const counted = subjects.filter(countsTowardGwa);
  const notCounted = subjects.length - counted.length;
  const changed = Object.keys(overrides).length > 0;

  const setGrade = (subject: Subject, grade: number) =>
    setOverrides((prev) => {
      const next = { ...prev };
      if (grade === subject.grade) delete next[subject.id];
      else next[subject.id] = grade;
      return next;
    });

  return (
    <>
      <ResponsiveDialogBody className="flex flex-col gap-2">
        <WhatIfResult now={simulate(subjects, {})} then={simulate(subjects, overrides)} />
        {counted.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Add a subject with a grade to try this.</p>
        ) : (
          <ul className="divide-y">
            {counted.map((subject) => (
              <WhatIfRow
                key={subject.id}
                subject={subject}
                grade={overrides[subject.id] ?? subject.grade}
                onChange={(grade) => setGrade(subject, grade)}
              />
            ))}
          </ul>
        )}
        {notCounted > 0 && (
          <p className="text-xs text-muted-foreground">
            {notCounted} subject{notCounted === 1 ? "" : "s"} not counted (like INC, IP, or NSTP) stay out, just like in your GWA.
          </p>
        )}
      </ResponsiveDialogBody>
      <ResponsiveDialogFooter>
        <Button variant="outline" disabled={!changed} onClick={() => setOverrides({})}>
          <RotateCcwIcon className="size-4" />
          Reset
        </Button>
        <Button onClick={onDone}>Done</Button>
      </ResponsiveDialogFooter>
    </>
  );
}
