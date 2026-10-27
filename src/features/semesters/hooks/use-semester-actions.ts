"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";

import type { SemesterValues } from "@/features/semesters/components/semester-form";
import type { Semester, Subject } from "@/types";

interface Options {
  subjects: Subject[];
  setSemesters: Dispatch<SetStateAction<Semester[]>>;
  removeSubjects: () => void;
}

/** Archive the working subjects as a semester, rename a term, delete one. */
export function useSemesterActions({
  subjects,
  setSemesters,
  removeSubjects,
}: Options) {
  const createSemester = useCallback(
    (values: SemesterValues) => {
      const semester: Semester = {
        id: crypto.randomUUID(),
        semester: values.semester,
        schoolYear: values.schoolYear,
        subjects,
      };
      // Add first, then clear the working set — the persistence layer writes
      // both in one go (see removeSubjects in use-calculator-data).
      setSemesters((prev) => [...prev, semester]);
      removeSubjects();
    },
    [subjects, setSemesters, removeSubjects],
  );

  const updateSemester = useCallback(
    (id: string, values: SemesterValues) => {
      setSemesters((prev) =>
        prev.map((semester) =>
          semester.id === id
            ? { id, semester: values.semester, schoolYear: values.schoolYear, subjects: semester.subjects }
            : semester,
        ),
      );
    },
    [setSemesters],
  );

  const deleteSemester = useCallback(
    (semester: Semester) => setSemesters((prev) => prev.filter((s) => s.id !== semester.id)),
    [setSemesters],
  );

  return { createSemester, updateSemester, deleteSemester };
}
