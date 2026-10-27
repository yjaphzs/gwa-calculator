"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { APP_NAME, APP_URL } from "@/config/app";
import { useAuth } from "@/context/auth-provider";
import { printAcademicSummary, printSemesterReport } from "@/features/reports/lib";
import { formatTermLabel } from "@/features/semesters/lib/semesters";
import type { Semester, Subject } from "@/types";

/** Print handlers for the Semester Report and Academic Summary, with toasts. */
export function useReportActions(subjects: Subject[], semesters: Semester[]) {
  const { profile } = useAuth();

  // Personal details printed on the documents — all optional (guests have none).
  const identity = useMemo(
    () => ({
      appName: APP_NAME,
      appUrl: APP_URL,
      studentName: profile?.displayName ?? null,
      schoolName: profile?.schoolName ?? null,
      program: profile?.program ?? null,
    }),
    [profile?.displayName, profile?.schoolName, profile?.program],
  );

  // The current (working) subjects as a one-semester report.
  const printWorkingSet = useCallback(() => {
    if (subjects.length === 0) {
      toast.error("Add subjects before exporting a Semester Report.");
      return;
    }
    try {
      printSemesterReport({ ...identity, subjects });
    } catch {
      toast.error("Failed to open the Semester Report.");
    }
  }, [subjects, identity]);

  // A single saved semester.
  const printSemester = useCallback(
    (semester: Semester) => {
      try {
        printSemesterReport({ ...identity, periodLabel: formatTermLabel(semester), subjects: semester.subjects });
      } catch {
        toast.error("Failed to open the Semester Report.");
      }
    },
    [identity],
  );

  // Every saved semester plus the cumulative GWA.
  const printSummary = useCallback(() => {
    if (semesters.length === 0) {
      toast.error("Save a semester before exporting an Academic Summary.");
      return;
    }
    try {
      printAcademicSummary({ ...identity, semesters });
    } catch {
      toast.error("Failed to open the Academic Summary.");
    }
  }, [semesters, identity]);

  return { printWorkingSet, printSemester, printSummary };
}
