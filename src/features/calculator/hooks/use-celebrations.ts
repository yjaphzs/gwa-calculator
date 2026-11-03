"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Celebration } from "@/features/calculator/components/toolbar/subjects-toolbar";
import { savedTermImprovement, workingSetImprovement, type Improvement } from "@/features/calculator/lib/improvement";
import { buzz } from "@/lib/haptics";
import type { Semester, Subject } from "@/types";

/** A just-saved term that beat the one before it. `open` lets the dialog animate out with its content. */
export interface SavedImprovement {
  semester: Semester;
  improvement: Improvement;
  open: boolean;
}

interface Input {
  subjects: Subject[];
  semesters: Semester[];
  honor: string | null;
  loading: boolean;
}

/**
 * The calculator's happy moments: the Congratulate dialog, the working set
 * beating the latest term, a buzz when an honor is newly reached, and the
 * improvement dialog after saving a better term.
 */
export function useCelebrations({ subjects, semesters, honor, loading }: Input) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<SavedImprovement | null>(null);
  const improvement = useMemo(() => workingSetImprovement(subjects, semesters), [subjects, semesters]);

  // Only honors reached after the data has loaded, so opening the app doesn't buzz.
  const lastHonor = useRef(honor);
  const armed = useRef(false);
  useEffect(() => {
    if (armed.current && honor && honor !== lastHonor.current) buzz("honor");
    lastHonor.current = honor;
    if (!loading) armed.current = true;
  }, [honor, loading]);

  const celebration: Celebration = {
    open,
    improvement,
    onOpenChange: (next) => {
      if (next && (honor || improvement)) buzz("honor");
      setOpen(next);
    },
  };

  /** Call with every semester (the new one included) right after saving. */
  const onSemesterSaved = (all: Semester[], semester: Semester) => {
    buzz("save");
    const better = savedTermImprovement(all, semester);
    if (better) setSaved({ semester, improvement: better, open: true });
  };

  const closeSaved = () => setSaved((prev) => (prev ? { ...prev, open: false } : null));

  return { celebration, saved, onSemesterSaved, closeSaved };
}
